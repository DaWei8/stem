'use client'

import { Brain, Cpu, Database, LayoutTemplate, Shield, Terminal, Zap, Code2, Workflow, Fingerprint } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function HeroVisual() {
  return (
    <div className="relative w-full max-w-7xl min-h-[800px] flex items-center justify-center perspective-[2000px]">
      {/* Main Orchestration Window */}
      <motion.div
        initial={{ opacity: 0, rotateY: -20, rotateX: 10, scale: 0.9 }}
        animate={{ opacity: 1, rotateY: -15, rotateX: 5, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full h-[600px] bg-black border border-zinc-800 rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col group"
      >
        {/* Top Bar */}
        <div className="h-10 border-b border-zinc-900 bg-black/50 flex items-center justify-between px-4">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-zinc-800" />
            <div className="size-2 rounded-full bg-zinc-800" />
            <div className="size-2 rounded-full bg-zinc-800" />
            <span className="ml-4 text-[9px] font-mono text-zinc-600 font-bold tracking-widest uppercase">System Flow: authentication_v1.blueprint</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[9px] font-bold text-zinc-500 tracking-wider">BLUEPRINT SYNCED</span>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-12 border-r border-zinc-900 bg-black/20 flex flex-col items-center py-6 gap-6">
            <ToolIcon icon={<Brain className="size-4" />} active />
            <ToolIcon icon={<Database className="size-4" />} />
            <ToolIcon icon={<Workflow className="size-4" />} />
            <ToolIcon icon={<Shield className="size-4" />} />
            <div className="mt-auto pb-4">
              <ToolIcon icon={<Terminal className="size-4" />} />
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[24px_24px] p-6">
            {/* Visualizing the "Blueprints" */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-full h-full opacity-20" preserveAspectRatio="none">
                <path d="M 100 250 Q 250 250 350 150" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M 100 250 Q 250 250 350 350" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M 350 150 Q 500 150 600 250" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M 350 350 Q 500 350 600 250" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
              </svg>
            </div>

            {/* Nodes */}
            <Node x="10%" y="40%" title="Auth Gateway" icon={<Shield className="size-3" />} color="text-blue-500" />
            <Node x="45%" y="20%" title="Identity Verification" icon={<Fingerprint className="size-3" />} color="text-purple-500" />
            <Node x="45%" y="60%" title="Session Engine" icon={<Cpu className="size-3" />} color="text-amber-500" />
            <Node x="80%" y="40%" title="Secure Access" icon={<Zap className="size-3" />} color="text-green-500" />
          </div>

          {/* Right Panel */}
          <div className="w-56 border-l border-zinc-900 bg-black/30 p-4 space-y-6">
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-zinc-500 tracking-[0.2em] uppercase">Properties</h4>
              <div className="space-y-2">
                <Property label="Type" value="Mission Critical" />
                <Property label="Latency" value="< 2ms" />
                <Property label="Isolation" value="Strict WASM" />
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-zinc-500 tracking-[0.2em] uppercase">Metrics</h4>
              <div className="h-20 bg-black/50 border border-zinc-800 rounded-lg flex items-end justify-between p-2 gap-1">
                {[40, 70, 45, 90, 65, 80, 55, 75].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                    className="flex-1 bg-white/10 rounded-sm"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar / Terminal */}
        <div className="h-12 border-t border-zinc-900 bg-black flex items-center px-4 gap-4 overflow-hidden">
          <Terminal className="size-3 text-zinc-600" />
          <div className="flex-1 font-mono text-[9px] text-zinc-500 flex gap-4 truncate">
            <span className="text-zinc-400">root@blueprint:~$</span>
            <span>compiling logic_bot.wasm...</span>
            <span className="text-green-500 font-bold">DONE</span>
            <span>verification successful: 0 errors, 2 warnings</span>
          </div>
        </div>
      </motion.div>

      {/* Floating Code Snippet */}
      <motion.div
        initial={{ opacity: 0, x: 50, y: 50 }}
        animate={{ opacity: 1, x: 20, y: 30 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute bottom-10 right-0 w-64 bg-black border border-zinc-800 rounded-xl p-5 shadow-2xl backdrop-blur-xl group hover:scale-105 transition-all duration-500"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code2 className="size-3.5 text-zinc-500" />
            <span className="text-[10px] font-bold text-zinc-400">logic.rs</span>
          </div>
          <div className="size-2 rounded-full bg-zinc-800" />
        </div>
        <div className="font-mono text-[10px] leading-relaxed text-zinc-500 selection:bg-white/10">
          <p><span className="text-purple-500">pub fn</span> validate() {'{'}</p>
          <p className="pl-3">blueprint.<span className="text-blue-500">verify</span>();</p>
          <p className="pl-3 text-green-500">// deterministic</p>
          <p>{'}'}</p>
        </div>
      </motion.div>
    </div>
  )
}

function ToolIcon({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <div className={cn(
      "size-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
      active ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "text-zinc-600 hover:text-white hover:bg-black"
    )}>
      {icon}
    </div>
  )
}

function Node({ x, y, title, icon, color }: { x: string; y: string; title: string; icon: React.ReactNode; color: string }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      style={{ left: x, top: y }}
      className="absolute p-3 bg-black border border-zinc-800 rounded-xl flex items-center gap-3 shadow-xl hover:border-white/20 transition-all cursor-pointer group/node"
    >
      <div className={cn("size-6 rounded-md bg-black border border-zinc-800 flex items-center justify-center", color)}>
        {icon}
      </div>
      <span className="text-[10px] font-bold text-zinc-300 group-hover/node:text-white transition-colors">{title}</span>
    </motion.div>
  )
}

function Property({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[9px] font-bold text-zinc-600">{label}</span>
      <span className="text-[9px] font-mono text-zinc-400">{value}</span>
    </div>
  )
}
