'use client'

interface StackItemProps {
  title: string
  desc: string
  icon: React.ReactNode
}

export function StackItem({ title, desc, icon }: StackItemProps) {
  return (
    <div className="p-6 bg-card border border-border rounded-2xl space-y-3 group hover:border-primary/20 transition-all cursor-pointer">
      <div className="size-8 bg-background rounded-lg flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
        {icon}
      </div>
      <h4 className="font-bold text-foreground text-sm">{title}</h4>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}
