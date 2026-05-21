'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Pillar } from './constants'
import { useEffect, useState } from 'react'

interface TelemetryTooltipProps {
  pillar: Pillar
  isVisible: boolean
}

export const TelemetryTooltip = ({ pillar, isVisible }: TelemetryTooltipProps) => {
  const [load, setLoad] = useState(12.4)
  const [throughput, setThroughput] = useState(124)

  // Dynamic simulation of metrics
  useEffect(() => {
    if (!isVisible) return
    const interval = setInterval(() => {
      setLoad(parseFloat((Math.random() * 20 + 5).toFixed(1)))
      setThroughput(Math.floor(Math.random() * 50 + 100))
    }, 1500)
    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute z-30 bottom-[95px] left-1/2 -translate-x-1/2 w-52 bg-zinc-950/90 border border-zinc-800 p-3 rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-md pointer-events-none select-none text-left"
        >
          <div className="text-[10px] font-bold text-white mb-2 flex justify-between items-center tracking-tight">
            <span>{pillar.label} Telemetry</span>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] text-zinc-500 font-mono">LIVE</span>
            </div>
          </div>
          <div className="space-y-1.5 font-mono text-[9px] text-zinc-400">
            <div className="flex justify-between border-b border-zinc-900 pb-1">
              <span>Status</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="flex justify-between border-b border-zinc-900 pb-1">
              <span>Telemetry Load</span>
              <span className="text-zinc-200">{load}%</span>
            </div>
            <div className="flex justify-between border-b border-zinc-900 pb-1">
              <span>Rate</span>
              <span className="text-zinc-200">{throughput} tx/s</span>
            </div>
            <div className="text-[8px] text-zinc-500 mt-1 leading-normal italic">
              {pillar.tooltip}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
