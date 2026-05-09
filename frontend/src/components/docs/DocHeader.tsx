'use client'

interface DocHeaderProps {
  title: React.ReactNode
  description: string
}

export function DocHeader({ title, description }: DocHeaderProps) {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-4xl lg:text-5xl font-black text-foreground">
        {title}
      </h1>
      <p className="text-lg text-muted-foreground leading-relaxed font-medium">
        {description}
      </p>
    </div>
  )
}
