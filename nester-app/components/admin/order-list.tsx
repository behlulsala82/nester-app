'use client'

import React from 'react'
import { Download, ExternalLink, Calendar, Layers, Hash } from 'lucide-react'
import { generatePanelCSV, downloadCSV, CSVPieceInput } from '@/lib/csv-generator'

interface Piece {
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

export function OrderList({ orders }: { orders: any[] }) {
  const exportToCSV = (order: any) => {
    const formattedPieces: CSVPieceInput[] = order.pieces.map((p: any) => ({
      width: p.width,
      height: p.height,
      quantity: p.quantity,
      thickness: 18, // Default or extracted from material
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
          <div key={order.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded uppercase tracking-tighter">
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{order.material}</h3>
                <p className="text-sm text-muted-foreground">
                  Board: {order.board_width} x {order.board_height} mm
                </p>
              </div>

              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Sheets</p>
                  <p className="text-xl font-black flex items-center justify-center">
                    <Layers className="h-4 w-4 mr-1 text-blue-500" />
                    {order.total_sheets}
                  </p>
                </div>
                <div className="text-center border-l pl-8">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Waste</p>
                  <p className="text-xl font-black text-rose-500">{order.waste_percent}%</p>
                </div>
                <div className="text-center border-l pl-8">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Pieces</p>
                  <p className="text-xl font-black flex items-center justify-center">
                    <Hash className="h-4 w-4 mr-1 text-emerald-500" />
                    {order.pieces?.length || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => exportToCSV(order as Order)}
                  className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-bold hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
            <p className="text-muted-foreground">No orders found yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
