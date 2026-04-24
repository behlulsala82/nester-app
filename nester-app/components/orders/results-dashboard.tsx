'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  Sparkles,
  Save,
  CheckCircle2,
  Loader2,
  Zap,
  Layers,
  ArrowRightLeft,
  Columns,
  Rows,
  FileDown
} from 'lucide-react'
import { CutVisualizer } from '../visualizer/cut-visualizer'
import { Card, CardContent } from '@/components/ui/card'
import { createSupabaseClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { OptimizationResult, PieceInput } from '@/types'
import { Database } from '@/types/database'

type OrderInsert = Database['public']['Tables']['orders']['Insert']
type PieceInsert = Database['public']['Tables']['pieces']['Insert']

interface ResultsDashboardProps {
  results: OptimizationResult | null
  boardWidth: number
  boardHeight: number
  material: string
  originalPieces: PieceInput[]
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ 
  results, 
  boardWidth, 
  boardHeight, 
  material,
  originalPieces
}) => {
  const [selectedLayoutType, setSelectedLayoutType] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  
  const supabase = useMemo(() => {
    try { return createSupabaseClient() } catch (e) { 
        console.error("Supabase creation error:", e);
        return null;
    }
  }, [])
  
  useEffect(() => {
    if (results?.best_layout?.type) {
      setSelectedLayoutType(results.best_layout.type)
      setIsSaved(false)
    }
  }, [results])

  const currentLayout = useMemo(() => {
    if (!results || !results.layouts) return null
    return results.layouts.find(l => l.type === selectedLayoutType) || results.best_layout
  }, [selectedLayoutType, results])

  const handleExportPDF = async () => {
    if (!currentLayout || isExporting) return
    setIsExporting(true)
    try {
      const payload = {
        board_width: boardWidth,
        board_height: boardHeight,
        placements: currentLayout.placements,
        metrics: {
          efficiency_score: currentLayout.efficiency_score,
          total_sheets: currentLayout.total_sheets,
          waste_percent: currentLayout.waste_percent
        },
        material: material
      }

      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error("PDF generation failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nester-cutting-plan-${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("PDF Export Error:", error)
      alert("PDF export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleSaveOrder = async () => {
    if (!currentLayout || isSaving || !supabase) return
    setIsSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        alert("Please login first.")
        setIsSaving(false)
        return
      }
      
      const orderPayload: OrderInsert = {
        user_id: user.id,
        material: material,
        board_width: boardWidth,
        board_height: boardHeight,
        total_sheets: currentLayout.total_sheets,
        waste_percent: currentLayout.waste_percent,
        selected_strategy: currentLayout.type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        placements_data: currentLayout.placements as any,
        efficiency_score: currentLayout.efficiency_score
      }

      const { data: orderData, error: orderError } = await supabase.from('orders')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(orderPayload as any)
        .select()
        .single()

      if (orderError || !orderData) throw orderError || new Error("Order creation failed")
      
      const piecesToInsert: PieceInsert[] = (originalPieces || []).map(p => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        order_id: (orderData as any).id,
        width: parseFloat(p.width),
        height: parseFloat(p.height),
        quantity: parseInt(p.quantity),
        rotation: true,
        edge_top: false, edge_bottom: false, edge_left: false, edge_right: false
      }))

      if (piecesToInsert.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: piecesError } = await supabase.from('pieces').insert(piecesToInsert as any)
        if (piecesError) throw piecesError
      }
      setIsSaved(true)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 5000)
    } catch (error: unknown) {
      console.error("Save error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const getStrategyIcon = (type: string) => {
    switch (type) {
      case 'horizontal-priority': return <Rows className="h-4 w-4" />
      case 'vertical-priority': return <Columns className="h-4 w-4" />
      case 'compact-block': return <Zap className="h-4 w-4" />
      case 'strip-mode': return <Layers className="h-4 w-4" />
      case 'rotated-board': return <ArrowRightLeft className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const formatStrategyName = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  if (!results || !results.layouts || !currentLayout) return null

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10 max-w-[1600px] mx-auto relative h-auto">
      
      <div className={cn(
        "fixed top-4 lg:top-8 right-4 lg:right-8 z-[100] transition-all duration-500 transform",
        showToast ? "translate-y-0 opacity-100 scale-100" : "-translate-y-12 opacity-0 scale-95 pointer-events-none"
      )}>
        <div className="bg-slate-900 border border-emerald-500/20 shadow-2xl rounded-2xl p-4 flex items-center space-x-3 backdrop-blur-3xl min-w-[280px]">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <p className="text-[10px] font-black text-slate-100 uppercase tracking-widest">SAVED TO CLOUD</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        
        {/* VISUALIZER */}
        <div className="w-full lg:flex-1 min-w-0 bg-slate-950 rounded-2xl border border-slate-800/60 overflow-hidden shadow-2xl relative h-[450px] sm:h-[580px]">
            <CutVisualizer 
              key={selectedLayoutType}
              placements={currentLayout.placements}
              boardWidth={boardWidth}
              boardHeight={boardHeight}
              strategyName={formatStrategyName(currentLayout.type)}
            />
        </div>

        {/* SIDEBAR MODES */}
        <div className="w-full lg:w-auto flex lg:flex-col gap-2 p-1.5 bg-slate-900/30 border border-slate-800/40 rounded-2xl overflow-x-auto lg:overflow-x-visible no-scrollbar">
            {results.layouts.map((layout) => (
              <button
                key={layout.type}
                type="button"
                onClick={() => setSelectedLayoutType(layout.type)}
                className={cn(
                  "flex lg:flex-col items-center justify-start lg:justify-center min-w-[120px] lg:w-16 h-14 lg:h-18 rounded-xl border transition-all duration-300 gap-2 lg:gap-1 px-3 lg:px-1 shrink-0",
                  selectedLayoutType === layout.type 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-xl scale-[1.02]' 
                  : 'bg-slate-950/60 border-slate-800 text-slate-600 hover:border-slate-700'
                )}
              >
                <div className={cn(
                  "p-1 rounded-lg transition-all",
                  selectedLayoutType === layout.type ? 'bg-white/20' : 'bg-slate-900'
                )}>
                  {getStrategyIcon(layout.type)}
                </div>
                <div className="flex flex-col lg:items-center">
                  <p className="text-[8px] font-black uppercase tracking-tighter lg:hidden">
                    {formatStrategyName(layout.type).split(' ')[0]}
                  </p>
                  <p className={cn(
                    "text-[9px] font-bold",
                    selectedLayoutType === layout.type ? "text-white" : "text-slate-500"
                  )}>%{layout.efficiency_score.toFixed(0)}</p>
                </div>
              </button>
            ))}
        </div>

        {/* METRICS PANEL */}
        <div className="w-full lg:w-[240px] shrink-0">
           <Card className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden flex flex-col backdrop-blur-xl h-auto shadow-2xl">
              <div className="bg-slate-800/20 px-5 py-3 border-b border-slate-800/60 flex items-center justify-between">
                 <h3 className="text-[9px] font-black text-slate-500 tracking-[0.2em] uppercase leading-none">Intelligence</h3>
                 <Sparkles className="h-3 w-3 text-blue-500" />
              </div>
              
              <CardContent className="px-5 py-5 space-y-5">
                 <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Efficiency Score</p>
                    <p className="text-3xl font-black text-emerald-500 tracking-tight tabular-nums">
                      %{currentLayout.efficiency_score.toFixed(1)}
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800/60">
                    <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-500 uppercase leading-none">Sheets</p>
                        <p className="text-xl font-black text-blue-500 tabular-nums">{currentLayout.total_sheets}</p>
                    </div>
                    <div className="space-y-0.5 text-right">
                        <p className="text-[9px] font-black text-slate-500 uppercase leading-none text-right">Cuts</p>
                        <p className="text-xl font-black text-slate-200 tabular-nums">{currentLayout.cut_lines_count}</p>
                    </div>
                 </div>
                 
                 <div className="space-y-2.5 pt-4 border-t border-slate-800/40">
                    <div className="flex justify-between items-center text-[10px] font-black">
                       <span className="text-slate-200 uppercase tracking-widest font-black text-[8px]">USED AREA</span>
                       <span className="text-slate-100 font-mono text-[9px]">{(currentLayout.used_area / 1000000).toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black">
                       <span className="text-slate-400 uppercase tracking-widest font-black opacity-80 text-[8px]">WASTE AREA</span>
                       <span className="text-red-500 font-mono text-[9px]">{(currentLayout.waste_area / 1000000).toFixed(2)} m²</span>
                    </div>
                 </div>
              </CardContent>

              {/* ACTION BUTTONS */}
              <div className="p-3 flex flex-col gap-2 bg-slate-950/40 border-t border-slate-800/60">
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 border border-slate-700"
                >
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> : <><FileDown className="h-4 w-4 text-blue-500" /> <span>Export PDF</span></>}
                </button>

                <button
                  onClick={handleSaveOrder}
                  disabled={isSaving || isSaved}
                  className={cn(
                    "w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 shadow-xl",
                    isSaved 
                    ? 'bg-emerald-600 text-white cursor-default' 
                    : 'bg-white text-black hover:bg-blue-600 hover:text-white active:scale-95'
                  )}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    isSaved ? <span className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2" /> PLAN SAVED</span> : 
                    <><Save className="h-4 w-4" /> <span>CONFIRM PLAN</span></>
                  )}
                </button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}

export default ResultsDashboard
