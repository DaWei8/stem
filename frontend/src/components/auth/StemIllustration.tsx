'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Activity } from 'lucide-react'
import { PILLARS, CONNECTIONS, PARTICLES } from './constants'
import { BackgroundCode } from './BackgroundCode'
import { TelemetryTooltip } from './TelemetryTooltip'

export const StemIllustration = () => {
  const [step, setStep] = useState(0)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2400),
      setTimeout(() => setStep(4), 3200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="relative w-full h-full flex touch-none items-center justify-center p-8 bg-[#050508] overflow-hidden">
      {/* Deep Space Glowing Auras */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06)_0%,rgba(0,0,0,0)_70%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-indigo-950/20 to-transparent pointer-events-none" />

      {/* Cyber Double Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:80px_80px]" />

      {/* Scrolling Syntax-Highlighted Code */}
      <BackgroundCode />

      {/* Floating Network Particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-indigo-500/20 shadow-[0_0_6px_rgba(99,102,241,0.2)] pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: ['0%', '-25%', '0%'], opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Laser Scanline */}
      <motion.div
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent border-b border-indigo-500/25 pointer-events-none z-0 shadow-[0_4px_15px_rgba(99,102,241,0.12)]"
      />

      <div className="relative w-full max-w-2xl aspect-square flex flex-col items-center justify-center z-10">
        {/* Top: AI Terminal HUD */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-0 w-full max-w-lg bg-zinc-950/70 border border-zinc-800/60 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl p-5 z-20 rounded-xl"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/40">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="size-2 rounded-full bg-red-500/50" />
                    <div className="size-2 rounded-full bg-yellow-500/50" />
                    <div className="size-2 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="size-3.5 text-zinc-400" />
                    <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-wider">Stem Architect v1.0</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-zinc-600 font-mono text-[8px] font-bold">
                  <Activity className="size-3 text-indigo-400 animate-pulse" />
                  <span className="text-zinc-500">145 TOK/S</span>
                </div>
              </div>

              <div className="font-mono text-xs text-zinc-300 flex flex-col gap-1.5 h-16 justify-center">
                {step >= 2 && (
                  <div className="flex items-center text-white font-medium">
                    <span className="text-indigo-400 mr-2">»</span>
                    <span>Generate comprehensive system blueprint...</span>
                  </div>
                )}
                {step >= 3 && (
                  <div className="flex items-center text-zinc-400 text-[10px]">
                    <span className="text-indigo-500/60 mr-2">»</span>
                    <span>Mapping LLM blueprint to canvas state.</span>
                    <motion.div
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="w-1.5 h-3 bg-zinc-500 ml-1.5"
                    />
                  </div>
                )}
              </div>

              {/* HUD Progress Bar */}
              <div className="w-full h-1 bg-zinc-900 rounded-full mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: step === 1 ? '15%' : step === 2 ? '50%' : step === 3 ? '85%' : '100%' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Node Canvas */}
        <div className="relative w-full h-full mt-36">
          {/* Laser Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {step >= 3 && CONNECTIONS.map((conn) => {
              const fromNode = PILLARS.find(p => p.id === conn.from)!
              const toNode = PILLARS.find(p => p.id === conn.to)!

              return (
                <g key={conn.id}>
                  {/* Glowing Laser Backdrop */}
                  <motion.line
                    x1={`${fromNode.x}%`}
                    y1={`${fromNode.y}%`}
                    x2={`${toNode.x}%`}
                    y2={`${toNode.y}%`}
                    stroke={toNode.glowColor}
                    strokeWidth="3.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.4 }}
                    transition={{ duration: 0.8, delay: conn.delay }}
                  />
                  {/* Running Core Spark Link */}
                  <motion.line
                    x1={`${fromNode.x}%`}
                    y1={`${fromNode.y}%`}
                    x2={`${toNode.x}%`}
                    y2={`${toNode.y}%`}
                    stroke="rgba(255, 255, 255, 0.7)"
                    strokeWidth="1.2"
                    strokeDasharray="6 8"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1, strokeDashoffset: [0, -28] }}
                    transition={{
                      pathLength: { duration: 0.8, delay: conn.delay },
                      strokeDashoffset: { repeat: Infinity, duration: 1.2, ease: 'linear' }
                    }}
                  />
                </g>
              )
            })}
          </svg>

          {/* Pillars */}
          {step >= 3 && PILLARS.map((pillar) => {
            const isHovered = hoveredNode === pillar.id
            const isLogic = pillar.id === 'logic'

            return (
              <motion.div
                key={pillar.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: pillar.delay, type: 'spring' }}
                whileHover={{ scale: 1.08 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10 cursor-pointer"
                style={{ left: `${pillar.x}%`, top: `${pillar.y}%` }}
                onMouseEnter={() => setHoveredNode(pillar.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className="relative">
                  {/* Floating Telemetry Tooltip */}
                  <TelemetryTooltip pillar={pillar} isVisible={isHovered} />

                  {/* Pulsing Outer Glow Aura */}
                  <motion.div
                    animate={{
                      scale: isLogic ? [1.8, 2.4, 1.8] : [1.4, 1.8, 1.4],
                      opacity: isLogic ? [0.15, 0.35, 0.15] : [0.08, 0.22, 0.08]
                    }}
                    transition={{ duration: isLogic ? 2.5 : 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ backgroundColor: pillar.glowColor }}
                  />

                  {/* Glassmorphic Node Icon Button */}
                  <div
                    className={`relative size-14 bg-zinc-950/85 border rounded-xl flex items-center justify-center transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.4)] ${pillar.borderColor} ${isHovered ? 'border-zinc-300' : 'border-zinc-800'}`}
                    style={{ boxShadow: isHovered ? `0 0 25px ${pillar.glowColor}` : undefined }}
                  >
                    {isLogic && (
                      <motion.div
                        animate={{ opacity: [0.15, 0.45, 0.15] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 bg-white/20 blur-md rounded-xl pointer-events-none"
                      />
                    )}
                    <pillar.icon className={`size-5 transition-all duration-300 ${isHovered ? pillar.iconColor : 'text-zinc-400'}`} strokeWidth={1.8} />
                  </div>
                </div>

                {/* Glassmorphic Labels */}
                <div className={`px-3 py-1.5 border rounded-lg backdrop-blur-md flex flex-col items-center transition-all duration-300 bg-zinc-950/90 ${isHovered ? 'border-zinc-600' : 'border-zinc-800/80'}`}>
                  <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-300 whitespace-nowrap">
                    {pillar.label}
                  </span>
                  <span className="text-[8px] font-mono font-bold text-emerald-400 mt-0.5 tracking-widest flex items-center gap-1">
                    <span className="size-1 rounded-full bg-emerald-400 animate-pulse" />
                    SYS.OK
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
