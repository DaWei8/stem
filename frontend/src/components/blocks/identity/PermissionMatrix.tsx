'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react'

type PolicyType = 'select' | 'insert' | 'update' | 'delete'
const POLICY_OPS: PolicyType[] = ['select', 'insert', 'update', 'delete']

const OP_COLOR: Record<PolicyType, string> = {
  select: 'text-blue-500',
  insert: 'text-emerald-500',
  update: 'text-amber-500',
  delete: 'text-red-500',
}

interface Props {
  userTypes: any[]
  policies: any[]
  tables: any[]
  pages: any[]
}

export function PermissionMatrix({ userTypes, policies, tables, pages }: Props) {
  // Build a folder→pages map for grouping rows
  const folders = useMemo(() => {
    const map: Record<string, any[]> = {}
    pages.forEach(p => {
      const folder = p.folder || 'Main Architecture'
      if (!map[folder]) map[folder] = []
      map[folder].push(p)
    })
    return map
  }, [pages])

  // Build policy lookup: table_id → user_type_id → set of ops
  const policyMap = useMemo(() => {
    const map: Record<string, Record<string, Set<string>>> = {}
    policies.forEach(p => {
      const tid = p.table_id
      const uid = p.user_type_id || '__all__'
      if (!map[tid]) map[tid] = {}
      if (!map[tid][uid]) map[tid][uid] = new Set()
      map[tid][uid].add(p.policy_type)
    })
    return map
  }, [policies])

  const getAccessCell = (tableId: string, userTypeId: string): PolicyType[] => {
    const byTable = policyMap[tableId] ?? {}
    const byRole = byTable[userTypeId] ?? new Set<string>()
    const byAll = byTable['__all__'] ?? new Set<string>()
    const combined = new Set([...byRole, ...byAll])
    return POLICY_OPS.filter(op => combined.has(op))
  }

  if (tables.length === 0) {
    return (
      <div className="py-16 border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
        <p className="text-xs text-zinc-400 italic">Define schema tables first to populate the permission matrix.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-[10px] font-mono border-collapse">
        <thead>
          <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
            <th className="text-left px-4 py-3 font-black text-zinc-400  w-48 border-r border-zinc-200 dark:border-zinc-800">
              Table / Role →
            </th>
            {userTypes.map(ut => (
              <th key={ut.id} className="px-4 py-3 text-center font-black text-black dark:text-white  border-r border-zinc-100 dark:border-zinc-900 last:border-r-0">
                {ut.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tables.map((table, i) => {
            return (
              <tr key={table.id} className={cn(
                'border-b border-zinc-100 dark:border-zinc-900 group',
                i % 2 === 0 ? 'bg-white dark:bg-black' : 'bg-zinc-50/50 dark:bg-zinc-950/50'
              )}>
                <td className="px-4 py-3 font-black text-black dark:text-white border-r border-zinc-200 dark:border-zinc-800 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900 transition-colors">
                  {table.name}
                </td>
                {userTypes.map(ut => {
                  const ops = getAccessCell(table.id, ut.id)
                  const isAdmin = ut.is_admin
                  return (
                    <td key={ut.id} className="px-3 py-3 border-r border-zinc-100 dark:border-zinc-900 last:border-r-0 text-center group-hover:bg-zinc-50/50 dark:group-hover:bg-zinc-900/30 transition-colors">
                      {isAdmin ? (
                        <div className="flex items-center justify-center gap-0.5" title="Super Admin — full access">
                          {POLICY_OPS.map(op => (
                            <span key={op} className={cn('text-[8px] font-black ', OP_COLOR[op])}>{op[0]}</span>
                          ))}
                        </div>
                      ) : ops.length === 0 ? (
                        <div title="No access"><XCircle className="size-3.5 text-zinc-200 dark:text-zinc-800 mx-auto" /></div>
                      ) : ops.length === POLICY_OPS.length ? (
                        <div title="Full access"><CheckCircle2 className="size-3.5 text-emerald-500 mx-auto" /></div>
                      ) : (
                        <div className="flex items-center justify-center gap-0.5">
                          {ops.map(op => (
                            <span key={op} className={cn('text-[8px] font-black ', OP_COLOR[op])}>{op[0]}</span>
                          ))}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
          {/* Folder rows */}
          {Object.entries(folders).length > 0 && (
            <>
              <tr className="bg-zinc-100 dark:bg-zinc-900">
                <td colSpan={userTypes.length + 1} className="px-4 py-2 text-[9px] font-black  text-zinc-400">
                  UI Flows — Folder Access
                </td>
              </tr>
              {Object.entries(folders).map(([folder, fps]) => (
                <tr key={folder} className="border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-black">
                  <td className="px-4 py-3 font-black text-zinc-500 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800 text-[9px]">
                    📁 {folder} ({fps.length})
                  </td>
                  {userTypes.map(ut => (
                    <td key={ut.id} className="px-3 py-3 text-center border-r border-zinc-100 dark:border-zinc-900">
                      <div title="Not applicable"><MinusCircle className="size-3 text-zinc-300 dark:text-zinc-700 mx-auto" /></div>
                    </td>
                  ))}
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
      <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
        {POLICY_OPS.map(op => (
          <div key={op} className="flex items-center gap-1">
            <span className={cn('text-[9px] font-black ', OP_COLOR[op])}>{op[0]}</span>
            <span className="text-[9px] text-zinc-400">{op}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 ml-4">
          <XCircle className="size-2.5 text-zinc-300" />
          <span className="text-[9px] text-zinc-400">no access</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="size-2.5 text-emerald-500" />
          <span className="text-[9px] text-zinc-400">full access</span>
        </div>
      </div>
    </div>
  )
}
