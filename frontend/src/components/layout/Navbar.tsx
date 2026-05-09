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
    <nav className="fixed top-0 left-0 right-0 h-fit py-4 z-50 flex items-center justify-between px-12 lg:px-24 bg-background/50 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center gap-12">
        <Link href="/" className="text-2xl font-black hover:opacity-80 transition-opacity">
          Stem
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
    </nav>
  )
}
