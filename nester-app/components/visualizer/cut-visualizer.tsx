'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Placement {
  x: number
  y: number
  width: number
  height: number
  bin_index: number
}

interface CutVisualizerProps {
  placements: Placement[]
  boardWidth: number
  boardHeight: number
  strategyName?: string
}

export const CutVisualizer: React.FC<CutVisualizerProps> = ({ 
  placements, 
  boardWidth, 
  boardHeight,
  strategyName = "Plan"
}) => {
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0)

  const bins = useMemo(() => {
    return placements.reduce((acc, p) => {
      if (!acc[p.bin_index]) acc[p.bin_index] = []
      acc[p.bin_index].push(p)
      return acc
    }, {} as Record<number, Placement[]>)
  }, [placements])

  const binIndices = useMemo(() => Object.keys(bins).map(Number).sort((a, b) => a - b), [bins])
  const totalSheets = binIndices.length

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setCurrentSheetIndex(prev => Math.max(0, prev - 1))
      else if (e.key === 'ArrowRight') setCurrentSheetIndex(prev => Math.min(totalSheets - 1, prev + 1))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [totalSheets])

  if (totalSheets === 0) return null

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500 overflow-hidden">
      
      {/* COMPACT NAVIGATOR */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-2.5 lg:py-3 bg-slate-900 border-b border-slate-800 relative z-40">
        <div className="flex items-center space-x-2 w-1/4">
           <div className="p-1.5 bg-blue-600/20 rounded-lg hidden sm:block">
              <FileText className="h-3.5 w-3.5 text-blue-400" />
           </div>
           <div>
              <p className="text-[7px] lg:text-[8px] font-black uppercase tracking-wider text-slate-500 leading-none">Sheet</p>
              <p className="text-[9px] lg:text-[10px] font-black text-slate-200 mt-0.5">{currentSheetIndex + 1} / {totalSheets}</p>
           </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 bg-slate-950 border border-slate-800 rounded-xl p-0.5 lg:p-1 shadow-xl">
           <button 
             onClick={() => setCurrentSheetIndex(prev => Math.max(0, prev - 1))}
             disabled={currentSheetIndex === 0}
             className="p-1 lg:p-1.5 hover:bg-slate-800 rounded-md text-slate-500 hover:text-white disabled:opacity-20 transition-all"
           >
              <ChevronLeft className="h-4 w-4" />
           </button>
           
           <div className="flex flex-col items-center min-w-[80px] lg:min-w-[120px]">
              <span className="text-[7px] lg:text-[9px] font-black text-blue-500 uppercase tracking-widest truncate max-w-[100px]">{strategyName}</span>
              <div className="flex space-x-1 mt-1">
                 {binIndices.map(idx => (
                    <div 
                      key={idx} 
                      className={cn(
                        "h-0.5 rounded-full transition-all duration-300",
                        idx === currentSheetIndex ? "w-3 lg:w-4 bg-blue-500" : "w-1 bg-slate-800"
                      )}
                    />
                 ))}
              </div>
           </div>

           <button 
             onClick={() => setCurrentSheetIndex(prev => Math.min(totalSheets - 1, prev + 1))}
             disabled={currentSheetIndex === totalSheets - 1}
             className="p-1 lg:p-1.5 hover:bg-slate-800 rounded-md text-slate-500 hover:text-white disabled:opacity-20 transition-all"
           >
              <ChevronRight className="h-4 w-4" />
           </button>
        </div>

        <div className="w-1/4 text-right flex flex-col items-end">
           <p className="text-[7px] lg:text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none text-right">Size</p>
           <p className="text-[8px] lg:text-[10px] font-black text-slate-400 font-mono mt-0.5">
             {boardWidth}<span className="opacity-30 mx-0.5 italic">X</span>{boardHeight}
           </p>
        </div>
      </div>

      {/* CANVAS CONTAINER */}
      <div className="relative flex-1 overflow-hidden bg-[#010409] z-10">
        <InteractiveBinCanvas
          placements={bins[binIndices[currentSheetIndex]]}
          boardWidth={boardWidth}
          boardHeight={boardHeight}
        />
      </div>

      {/* THUMBNAILS */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800/40 flex gap-2 lg:gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth relative z-20">
         {binIndices.map(idx => (
            <button
              key={idx}
              onClick={() => setCurrentSheetIndex(idx)}
              className={cn(
                "group relative w-12 h-9 lg:w-10 lg:h-8 rounded-lg border transition-all duration-300 shrink-0 flex items-center justify-center font-black text-[9px] lg:text-[8px]",
                idx === currentSheetIndex 
                 ? "bg-blue-600/30 border-blue-500 text-blue-400 shadow-md shadow-blue-900/10" 
                 : "bg-slate-950/80 border-slate-800 text-slate-700 hover:border-slate-600"
              )}
            >
               #{idx + 1}
            </button>
         ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

interface InteractiveBinCanvasProps {
    placements: Placement[];
    boardWidth: number;
    boardHeight: number;
}

function InteractiveBinCanvas({ placements, boardWidth, boardHeight }: InteractiveBinCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.1 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const requestRef = useRef<number>()

  const calculateAutoFit = useCallback(() => {
    if (containerRef.current) {
        const cw = containerRef.current.clientWidth - 40
        const ch = containerRef.current.clientHeight - 40 
        
        const scaleW = cw / boardWidth
        const scaleH = ch / boardHeight
        const bestScale = Math.min(scaleW, scaleH) * 0.95
        
        setTransform({
          x: (containerRef.current.clientWidth - boardWidth * bestScale) / 2,
          y: (containerRef.current.clientHeight - boardHeight * bestScale) / 2,
          scale: bestScale
        })
    }
  }, [boardWidth, boardHeight])

  useEffect(() => {
    const timer = setTimeout(calculateAutoFit, 50)
    window.addEventListener('resize', calculateAutoFit)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', calculateAutoFit)
    }
  }, [calculateAutoFit])

  const drawDimensions = (ctx: CanvasRenderingContext2D, bw: number, bh: number, scale: number) => {
    const offset = 40 / scale
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 1 / scale
    ctx.font = `bold ${12/scale}px Inter, sans-serif`
    ctx.textAlign = 'center'
    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
       ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
    }
    drawLine(0, bh + offset, bw, bh + offset)
    ctx.fillText(`${Math.round(bw)}`, bw/2, bh + offset + (20/scale))
    ctx.save(); ctx.translate(-offset, bh/2); ctx.rotate(-Math.PI/2); 
    drawLine(-bh/2, 0, bh/2, 0); ctx.fillText(`${Math.round(bh)}`, 0, -(12/scale)); ctx.restore()
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)
    ctx.save(); ctx.translate(transform.x, transform.y); ctx.scale(transform.scale, transform.scale)
    drawDimensions(ctx, boardWidth, boardHeight, transform.scale)
    ctx.fillStyle = '#010409'; ctx.fillRect(0, 0, boardWidth, boardHeight)
    ctx.strokeStyle = '#30363d'; ctx.lineWidth = 1/transform.scale; ctx.strokeRect(0, 0, boardWidth, boardHeight)
    ctx.fillStyle = 'rgba(220, 38, 38, 0.1)'; ctx.fillRect(0, 0, boardWidth, boardHeight)
    ctx.globalCompositeOperation = 'destination-out'
    placements.forEach((p: Placement) => ctx.fillRect(p.x, p.y, p.width, p.height))
    ctx.globalCompositeOperation = 'source-over'
    placements.forEach((p: Placement) => {
      ctx.fillStyle = '#1d4ed8'; ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 0.8/transform.scale
      ctx.fillRect(p.x, p.y, p.width, p.height); ctx.strokeRect(p.x, p.y, p.width, p.height)
      const labelScaleLimit = 30
      if (p.width * transform.scale > labelScaleLimit) {
        ctx.fillStyle = 'white'; ctx.font = `bold ${10/transform.scale}px Inter, sans-serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(`${p.width}x${p.height}`, p.x + p.width/2, p.y + p.height/2)
      }
    })
    ctx.restore()
  }, [transform, placements, boardWidth, boardHeight])

  useEffect(() => {
    const animate = () => { draw(); requestRef.current = requestAnimationFrame(animate) }
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current!)
  }, [draw])

  const handleWheel = (e: React.WheelEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top
    setTransform(prev => {
        const newScale = Math.max(0.005, Math.min(prev.scale * zoomFactor, 30))
        return { scale: newScale, x: mouseX - (mouseX - prev.x) * (newScale / prev.scale), y: mouseY - (mouseY - prev.y) * (newScale / prev.scale) }
    })
  }

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      const gearWheel = (e: WheelEvent) => { e.preventDefault(); handleWheel(e as unknown as React.WheelEvent) }
      container.addEventListener('wheel', gearWheel, { passive: false })
      return () => container.removeEventListener('wheel', gearWheel)
    }
  }, [transform])

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-[#010409] cursor-grab active:cursor-grabbing overflow-hidden"
      onMouseDown={(e) => { setIsDragging(true); setLastMousePos({ x: e.clientX, y: e.clientY }) }}
      onMouseMove={(e) => {
        if (!isDragging) return
        const dx = e.clientX - lastMousePos.x, dy = e.clientY - lastMousePos.y
        setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }))
        setLastMousePos({ x: e.clientX, y: e.clientY })
      }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchStart={(e) => {
        if (e.touches.length === 1) {
          setIsDragging(true); 
          setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
        }
      }}
      onTouchMove={(e) => {
        if (!isDragging || e.touches.length !== 1) return
        const dx = e.touches[0].clientX - lastMousePos.x
        const dy = e.touches[0].clientY - lastMousePos.y
        setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }))
        setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      }}
      onTouchEnd={() => setIsDragging(false)}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none">
        <div className="px-2.5 py-1 bg-blue-600/90 border border-blue-400/30 rounded-lg text-[8px] lg:text-[10px] font-black text-white shadow-xl pointer-events-auto select-none">
          {Math.round(transform.scale * 100)}%
        </div>
      </div>
      <div className="absolute top-3 right-4 flex items-center gap-2">
         <button onClick={() => calculateAutoFit()} className="p-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all shadow-xl">
            <RotateCcw className="h-3.5 w-3.5" />
         </button>
      </div>
    </div>
  )
}

export default CutVisualizer
