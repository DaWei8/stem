import { StandardModal } from '@/components/ui/StandardModal'
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { ValidationIssue } from '@/lib/validationUtils'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ValidationModal({
  isOpen,
  onClose,
  issues,
  onLocate
}: {
  isOpen: boolean
  onClose: () => void
  issues: ValidationIssue[]
  onLocate: (pageId: string) => void
}) {
  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Architectural Audit"
      description="Deterministic analysis of your system's structural integrity."
      className="max-w-xl w-full"
    >
      <div className="space-y-4 py-4">
        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="size-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="size-8 text-green-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-black dark:text-white">System Verified</h4>
              <p className="text-[10px] text-zinc-500 mt-1">No structural orphans, loops, or logic gaps detected.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {issues.map((issue, i) => (
              <div
                key={i}
                className={cn(
                  "p-4 border rounded-xl flex gap-4 transition-colors",
                  issue.type === 'error' ? "bg-red-500/5 border-red-500/20" :
                    issue.type === 'warning' ? "bg-amber-500/5 border-amber-500/20" :
                      "bg-blue-500/5 border-blue-500/20"
                )}
              >
                <div className="mt-0.5">
                  {issue.type === 'error' ? <AlertCircle className="size-4 text-red-500" /> :
                    issue.type === 'warning' ? <AlertTriangle className="size-4 text-amber-500" /> :
                      <Info className="size-4 text-blue-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-black dark:text-white leading-tight">{issue.message}</p>
                  {issue.pageId && (
                    <button
                      onClick={() => {
                        onLocate(issue.pageId!);
                        onClose();
                      }}
                      className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      Locate Screen →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={onClose}
          className="w-full bg-black dark:bg-white text-white dark:text-black rounded-lg h-11 text-xs font-bold"
        >
          Close Report
        </Button>
      </div>
    </StandardModal>
  )
}
