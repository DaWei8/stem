'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Shield, Layout, Workflow, Bot, Cpu } from 'lucide-react'

const PILLARS = [
  { id: 'identity', label: 'Identity Layer', icon: Shield, x: 50, y: 15, delay: 2.5 },
  { id: 'schema', label: 'Schema Engine', icon: Database, x: 20, y: 50, delay: 3.0 },
  { id: 'logic', label: 'Core Logic', icon: Cpu, x: 50, y: 50, delay: 2.0 },
  { id: 'flows', label: 'Flow Nodes', icon: Workflow, x: 80, y: 50, delay: 3.5 },
  { id: 'design', label: 'Design System', icon: Layout, x: 50, y: 85, delay: 4.0 },
]

const CONNECTIONS = [
  { id: 'c1', from: 'logic', to: 'identity', delay: 2.7 },
  { id: 'c2', from: 'logic', to: 'schema', delay: 3.2 },
  { id: 'c3', from: 'logic', to: 'flows', delay: 3.7 },
  { id: 'c4', from: 'logic', to: 'design', delay: 4.2 },
  { id: 'c5', from: 'schema', to: 'design', delay: 4.5 },
]

export const StemIllustration = () => {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => setStep(3), 3500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="relative w-full h-full flex touch-none items-center justify-center p-8 bg-zinc-900 overflow-hidden">
      {/* Background Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Faint Scrolling Code Background */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.03] pointer-events-none font-mono text-[10px] text-white whitespace-pre leading-loose select-none">
        <motion.div
          initial={{ y: '0%' }}
          animate={{ y: '-50%' }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          {`
// Initialize Stem Architecture
function bootSequence() {
  const identity = await Auth.verify();
  const schema = new Database({ strict: true });
  const logic = new CoreLogic(identity, schema);
  
  logic.stream(async (packet) => {
    if (packet.verified) {
      await Router.push(packet.destination);
    }
  });

  return logic.status === 'OK';
}

export type Node = {
  id: string;
  edges: string[];
  payload: unknown;
};

// ... Establishing deterministic state ...
          `.repeat(5)}
        </motion.div>
      </div>

      {/* Vertical Scanner Line */}
      <motion.div
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 right-0 h-48 bg-linear-to-b from-transparent via-white/2 to-transparent pointer-events-none z-0"
      />

      <div className="relative w-full max-w-2xl aspect-square flex flex-col items-center justify-center z-10">

        {/* Top: AI Prompt Terminal */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-0 w-full max-w-lg bg-black/80 backdrop-blur-md border border-zinc-800 p-5 shadow-2xl z-20"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-800/50">
                <div className="flex gap-1.5">
                  <div className="size-2 rounded-full bg-zinc-600" />
                  <div className="size-2 rounded-full bg-zinc-700" />
                  <div className="size-2 rounded-full bg-zinc-800" />
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="size-3.5 text-zinc-400" />
                  <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-wider ">Stem Architect</span>
                </div>
              </div>
              <div className="font-mono text-xs text-zinc-300 flex items-start gap-3 h-10">
                <span className="text-zinc-600 mt-0.5">{'>'}</span>
                <div className="relative w-full">
                  {step >= 2 && (
                    <div className="flex items-center">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.5, ease: 'linear' }}
                        className="overflow-hidden whitespace-nowrap text-white font-medium"
                      >
                        Generate comprehensive system blueprint...
                      </motion.div>
                      {step < 3 && (
                        <motion.div
                          animate={{ opacity: [1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          className="w-1.5 h-3.5 bg-zinc-400 ml-1"
                        />
                      )}
                    </div>
                  )}
                  {step >= 3 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-zinc-500 mt-2 text-[10px] flex items-center"
                    >
                      Mapping LLM-generated script to canvas state.
                      <motion.div
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        className="w-1.5 h-2.5 bg-zinc-500 ml-1"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Node Canvas */}
        <div className="relative w-full h-full mt-32">
          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {step >= 3 && CONNECTIONS.map((conn) => {
              const fromNode = PILLARS.find(p => p.id === conn.from)!
              const toNode = PILLARS.find(p => p.id === conn.to)!

              return (
                <motion.line
                  key={conn.id}
                  x1={`${fromNode.x}%`}
                  y1={`${fromNode.y}%`}
                  x2={`${toNode.x}%`}
                  y2={`${toNode.y}%`}
                  stroke="#3f3f46"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: conn.delay, ease: "easeInOut" }}
                />
              )
            })}
          </svg>

          {/* Pillars */}
          {step >= 3 && PILLARS.map((pillar) => (
            <motion.div
              key={pillar.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: pillar.delay, type: 'spring' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10"
              style={{ left: `${pillar.x}%`, top: `${pillar.y}%` }}
            >
              <div className="relative">
                {/* Ping animation behind node */}
                <motion.div
                  initial={{ scale: 1, opacity: pillar.id === 'logic' ? 1 : 0.8 }}
                  animate={{ scale: pillar.id === 'logic' ? 2.5 : 2, opacity: 0 }}
                  transition={{ duration: 2, delay: pillar.delay + 0.5, repeat: Infinity, repeatDelay: pillar.id === 'logic' ? 1 : 3 }}
                  className="absolute inset-0 bg-white/20 rounded-none"
                />
                <div className={`relative size-14 bg-black border ${pillar.id === 'logic' ? 'border-zinc-400' : 'border-zinc-700'} flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)]`}>
                  {pillar.id === 'logic' && (
                    <motion.div
                      animate={{ opacity: [0.1, 0.3, 0.1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 bg-white/30 blur-md rounded-none pointer-events-none"
                    />
                  )}
                  <pillar.icon className={`size-5 ${pillar.id === 'logic' ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'text-zinc-300'}`} strokeWidth={1.5} />
                </div>
              </div>
              <div className="bg-black/80 px-3 py-2 border border-zinc-800 backdrop-blur-sm flex flex-col items-center">
                <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-400  whitespace-nowrap">
                  {pillar.label}
                </span>
                <span className="text-[8px] font-mono font-bold text-emerald-500/80 mt-0.5 tracking-widest">
                  SYS.OK
                </span>
              </div>
            </motion.div>
          ))}

          {/* Moving data packets along connections */}
          {step >= 3 && CONNECTIONS.map((conn, i) => {
            const fromNode = PILLARS.find(p => p.id === conn.from)!
            const toNode = PILLARS.find(p => p.id === conn.to)!

            return (
              <motion.div
                key={`packet-${i}`}
                initial={{ left: `${fromNode.x}%`, top: `${fromNode.y}%`, opacity: 0 }}
                animate={{
                  left: [`${fromNode.x}%`, `${toNode.x}%`],
                  top: [`${fromNode.y}%`, `${toNode.y}%`],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: conn.delay + 1 + (i * 0.5),
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2 + 1,
                  ease: "linear"
                }}
                className="absolute size-1.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] rounded-full -translate-x-1/2 -translate-y-1/2 z-20"
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
