'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Layout, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ResultsDashboard } from './results-dashboard'
import { OptimizationResult } from '@/types'

interface PieceInput {
  id: string
  width: string
  height: string
  quantity: string
  rotation: boolean
  edge_top: boolean
  edge_bottom: boolean
  edge_left: boolean
  edge_right: boolean
}

const INITIAL_PIECE: PieceInput = {
  id: '',
  width: '',
  height: '',
  quantity: '1',
  rotation: true,
  edge_top: false,
  edge_bottom: false,
  edge_left: false,
  edge_right: false,
}

// Visual Edge Band Selector Component
const EdgeSelector = ({ piece, onUpdate }: { piece: PieceInput, onUpdate: (field: keyof PieceInput, val: boolean) => void }) => {
  const directions = [
    { id: 'edge_top' as keyof PieceInput, className: 'top-0 left-1/2 -translate-x-1/2 w-6 h-1' },
    { id: 'edge_bottom' as keyof PieceInput, className: 'bottom-0 left-1/2 -translate-x-1/2 w-6 h-1' },
    { id: 'edge_left' as keyof PieceInput, className: 'left-0 top-1/2 -translate-y-1/2 w-1 h-6' },
    { id: 'edge_right' as keyof PieceInput, className: 'right-0 top-1/2 -translate-y-1/2 w-1 h-6' },
  ]

  return (
    <div className="relative w-10 h-10 flex items-center justify-center bg-slate-950/40 rounded-lg border border-slate-800 transition-all group shrink-0">
      <div className="w-1 h-1 rounded-full bg-slate-800" />
      {directions.map((dir) => (
        <button
          key={dir.id}
          type="button"
          onClick={() => onUpdate(dir.id, !piece[dir.id])}
          className={cn(
            "absolute rounded-full transition-all duration-200",
            dir.className,
            piece[dir.id] 
              ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
              : "bg-slate-800/40 hover:bg-slate-700"
          )}
        />
      ))}
    </div>
  )
}

export function OrderForm() {
  const [material, setMaterial] = useState('MDF White 18mm')
  const [boardWidth, setBoardWidth] = useState('2800')
  const [boardHeight, setBoardHeight] = useState('2100')
  const [pieces, setPieces] = useState<PieceInput[]>([{ ...INITIAL_PIECE, id: crypto.randomUUID() }])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<OptimizationResult | null>(null)
  
  const lastInputRef = useRef<HTMLInputElement>(null)

  const addPiece = () => {
    setPieces([...pieces, { ...INITIAL_PIECE, id: crypto.randomUUID() }])
  }

  useEffect(() => {
    if (lastInputRef.current) {
      lastInputRef.current.focus()
    }
  }, [pieces.length])

  const removePiece = (id: string) => {
    if (pieces.length === 1) return
    setPieces(pieces.filter((p) => p.id !== id))
  }

  const updatePiece = (id: string, field: keyof PieceInput, value: string | boolean) => {
    setPieces(
      pieces.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsLoading(true)
    
    try {
      const payload = {
        board_width: parseFloat(boardWidth),
        board_height: parseFloat(boardHeight),
        pieces: pieces.map((p) => ({
          width: parseFloat(p.width) || 0,
          height: parseFloat(p.height) || 0,
          quantity: parseInt(p.quantity) || 1,
          rotation: p.rotation,
          edge_top: p.edge_top,
          edge_bottom: p.edge_bottom,
          edge_left: p.edge_left,
          edge_right: p.edge_right,
        })).filter(p => p.width > 0 && p.height > 0),
      }

      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Optimization failed')
      }

      const data = await response.json()
      setResult(data)
      
      setTimeout(() => {
        const dashboard = document.getElementById('results-section')
        if (dashboard) dashboard.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      
    } catch (err: unknown) {
        console.error("Submit error:", err);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto p-4 animate-in fade-in duration-500 pb-20">
      
      {/* Configuration Header */}
      <section className="bg-slate-900 p-5 lg:p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
          <Layout className="h-4 w-4 text-blue-500" />
          <h2 className="text-[10px] font-black text-slate-100 uppercase tracking-widest">Plate Settings</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5 font-black uppercase text-[9px] text-slate-500">
            <span>Material</span>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            >
              <option>MDF White 18mm</option>
              <option>Plywood Birch 15mm</option>
              <option>Chipboard Oak 18mm</option>
            </select>
          </div>
          <div className="space-y-1.5 font-black uppercase text-[9px] text-slate-500">
            <span>Width (mm)</span>
            <input
              type="number"
              value={boardWidth}
              onChange={(e) => setBoardWidth(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold"
            />
          </div>
          <div className="space-y-1.5 font-black uppercase text-[9px] text-slate-500 sm:col-span-2 lg:col-span-1">
            <span>Height (mm)</span>
            <input
              type="number"
              value={boardHeight}
              onChange={(e) => setBoardHeight(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold"
            />
          </div>
        </div>
      </section>

      {/* Pieces Inventory */}
      <section className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xs font-black text-slate-100 uppercase tracking-widest">Piece List</h2>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={addPiece}
              className="flex-1 sm:flex-none h-11 px-6 bg-slate-800/80 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add Row
            </button>
            <button
              onClick={() => handleSubmit()}
              disabled={isLoading}
              className="flex-1 sm:flex-none h-11 px-8 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Calculate'}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-0 overflow-x-hidden">
          {/* Desktop Table View */}
          <table className="hidden sm:table w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-950 text-[9px] font-black uppercase tracking-widest text-slate-600 border-b border-slate-800">
                <th className="px-6 py-4">Sizes (WxH)</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4 text-center">Rot</th>
                <th className="px-6 py-4 text-center">Bands</th>
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {pieces.map((piece, index) => (
                <tr key={piece.id} className="group hover:bg-slate-800/10">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <input
                        ref={index === pieces.length - 1 ? lastInputRef : null}
                        type="number"
                        value={piece.width}
                        onChange={(e) => updatePiece(piece.id, 'width', e.target.value)}
                        className="w-20 h-10 px-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-slate-700 italic font-black text-[10px]">X</span>
                      <input
                        type="number"
                        value={piece.height}
                        onChange={(e) => updatePiece(piece.id, 'height', e.target.value)}
                        className="w-20 h-10 px-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={piece.quantity}
                      onChange={(e) => updatePiece(piece.id, 'quantity', e.target.value)}
                      className="w-16 h-10 px-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm font-bold"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={piece.rotation}
                      onChange={(e) => updatePiece(piece.id, 'rotation', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                       <EdgeSelector piece={piece} onUpdate={(f, v) => updatePiece(piece.id, f, v)} />
                    </div>
                  </td>
                  <td className="px-4">
                    <button onClick={() => removePiece(piece.id)} className="p-2 text-slate-700 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3">
             {pieces.map((piece, index) => (
               <div key={piece.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-[10px] font-black text-slate-600 uppercase">Piece #{index + 1}</span>
                     <button onClick={() => removePiece(piece.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                     </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                     <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase">Width</label>
                        <input
                          type="number"
                          value={piece.width}
                          onChange={(e) => updatePiece(piece.id, 'width', e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-sm font-bold focus:ring-1 focus:ring-blue-500"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase">Height</label>
                        <input
                          type="number"
                          value={piece.height}
                          onChange={(e) => updatePiece(piece.id, 'height', e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-sm font-bold focus:ring-1 focus:ring-blue-500"
                        />
                     </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                     <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={piece.quantity}
                          onChange={(e) => updatePiece(piece.id, 'quantity', e.target.value)}
                          className="w-16 h-10 px-3 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-sm font-bold"
                        />
                        <span className="text-[9px] font-black text-slate-600 uppercase">Qty</span>
                     </div>
                     <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                           <span className="text-[8px] font-black text-slate-600 uppercase mb-1">Rot</span>
                           <input
                            type="checkbox"
                            checked={piece.rotation}
                            onChange={(e) => updatePiece(piece.id, 'rotation', e.target.checked)}
                            className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-blue-600"
                          />
                        </div>
                        <EdgeSelector piece={piece} onUpdate={(f, v) => updatePiece(piece.id, f, v)} />
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      <div id="results-section">
        {result && (
          <ResultsDashboard 
            results={result}
            boardWidth={parseFloat(boardWidth)}
            boardHeight={parseFloat(boardHeight)}
            material={material}
            originalPieces={pieces}
          />
        )}
      </div>
    </div>
  )
}
