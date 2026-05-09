'use client'

import Link from 'next/link'

export function Footer() {
  const sections = [
    {
      title: 'Platform',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Use Cases', href: '#use-cases' },
        { label: 'Docs', href: '/docs' },
        { label: 'Logic Bot', href: '/docs/logic-bot' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'GitHub', href: 'https://github.com' },
        { label: 'Discord', href: 'https://discord.com' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
    },
  ]

  return (
    <footer className="bg-background border-t border-border py-24 px-12 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-foreground">Stem</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Deterministic system design and modeling for mission-critical software architecture.
          </p>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="space-y-6">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60">
              {section.title}
            </h3>
            <ul className="space-y-3">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-medium text-muted-foreground/40 ">
          © {new Date().getFullYear()} STEM SYSTEMIC. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  )
}
