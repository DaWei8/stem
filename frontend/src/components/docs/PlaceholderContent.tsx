'use client'

import { Box } from 'lucide-react'

export function PlaceholderContent() {
  return (
    <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 border border-dashed border-zinc-900 rounded-3xl">
      <div className="size-16 bg-black border border-zinc-900 rounded-2xl flex items-center justify-center">
        <Box className="size-8 text-zinc-700" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">Content Under Construction</h3>
        <p className="text-zinc-500 text-sm max-w-xs mx-auto">Our engineers are formalizing the documentation for this section. Check back soon.</p>
      </div>
    </div>
  )
}
