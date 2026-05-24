'use client'

import { motion } from 'framer-motion'
import { CODE_LINES } from './constants'

export const BackgroundCode = () => {
  // Let's loop the list of lines multiple times to fill the viewport
  const repeatedLines = [...CODE_LINES, ...CODE_LINES, ...CODE_LINES, ...CODE_LINES]

  const tokenColors = {
    comment: 'text-zinc-600 font-normal italic',
    keyword: 'text-violet-400 font-bold',
    variable: 'text-cyan-400',
    class: 'text-indigo-300 font-medium',
    function: 'text-amber-300',
    string: 'text-emerald-400',
    text: 'text-zinc-500'
  }

  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none font-mono text-sm whitespace-pre leading-loose select-none p-4">
      <motion.div
        initial={{ y: '0%' }}
        animate={{ y: '-50%' }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
        className="flex flex-col gap-0.5"
      >
        {repeatedLines.map((line, lineIdx) => (
          <div key={lineIdx} className="flex flex-wrap">
            {line.map((token, tokenIdx) => (
              <span
                key={tokenIdx}
                className={tokenColors[token.type] || 'text-zinc-400'}
              >
                {token.text}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
