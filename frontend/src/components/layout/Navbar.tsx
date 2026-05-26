'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ModeToggle'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="text-xs font-semibold text-foreground hover:text-foreground transition-colors duration-300"
    >
      {children}
    </Link>
  )
}

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-fit py-4 z-50 flex items-center justify-center px-12 bg-background/50 backdrop-blur-md border-b border-border/50">
      <div className='w-full flex items-center justify-between max-w-7xl'>
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-black font-heading hover:opacity-80 transition-opacity">
            Stem <span className="bg-zinc-800 text-3xl min-w-10 h-10 size-10" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/docs">Docs</NavLink>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#faqs">FAQs</NavLink>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button variant="primary" size="md" href="/auth/login" className="px-6">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  )
}
