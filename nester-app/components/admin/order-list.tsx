'use client'

import React from 'react'
import { Download, ExternalLink, Calendar, Layers, Hash } from 'lucide-react'
import { generatePanelCSV, downloadCSV, CSVPieceInput } from '@/lib/csv-generator'

interface Piece {
  id: string
  width: number
  height: number
  quantity: number
  rotation: boolean
  edge_top: boolean
  edge_bottom: boolean
  edge_left: boolean
  edge_right: boolean
}

interface Order {
  id: string
  material: string
  board_width: number
  board_height: number
  total_sheets: number
  waste_percent: number
  created_at: string
  pieces: Piece[]
}

export function OrderList({ orders }: { orders: Order[] }) {
  const exportToCSV = (order: Order) => {
    const formattedPieces: CSVPieceInput[] = order.pieces.map((p) => ({
      width: p.width,
      height: p.height,
      quantity: p.quantity,
      thickness: 18, 
      material: order.material,
      edges: {
        top: p.edge_top,
        bottom: p.edge_bottom,
        left: p.edge_left,
        right: p.edge_right
      },
      label: `P-${order.id.slice(0,4)}-${p.id.slice(0,4)}`
    }))

    const csvContent = generatePanelCSV(formattedPieces)
    downloadCSV(csvContent, `nester_production_${order.id.slice(0, 8)}.csv`)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2 py-1 bg-blue-500/10 text-blue-500 rounded uppercase tracking-tighter">
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-sm font-medium text-slate-500 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-100">{order.material}</h3>
                <p className="text-sm text-slate-400">
                  Board: {order.board_width} x {order.board_height} mm
                </p>
              </div>

              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Sheets</p>
                  <p className="text-xl font-black flex items-center justify-center text-slate-200">
                    <Layers className="h-4 w-4 mr-1 text-blue-500" />
                    {order.total_sheets}
                  </p>
                </div>
                <div className="text-center border-l border-slate-800 pl-8">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Waste</p>
                  <p className="text-xl font-black text-rose-500">{order.waste_percent}%</p>
                </div>
                <div className="text-center border-l border-slate-800 pl-8">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Pieces</p>
                  <p className="text-xl font-black flex items-center justify-center text-slate-200">
                    <Hash className="h-4 w-4 mr-1 text-emerald-500" />
                    {order.pieces?.length || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => exportToCSV(order)}
                  className="inline-flex items-center px-4 py-2 border border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors text-slate-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-500 transition-colors">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-20 bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-800">
            <p className="text-slate-500">No orders found yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
