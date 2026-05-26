'use client'

import { useEffect } from 'react'
import { useProjects } from './useProjects'
import { useUser } from './useUser'

export function useProjectRole() {
  const { currentProject } = useProjects()
  const { profile, fetchProfile } = useUser()

  useEffect(() => {
    if (!profile) {
      fetchProfile()
    }
  }, [profile, fetchProfile])

  if (!currentProject || !profile) {
    return { role: null, isOwner: false, isEditor: false, isViewer: false }
  }

  if (currentProject.owner_id === profile.id) {
    return { role: 'owner', isOwner: true, isEditor: true, isViewer: false }
  }

  const collaborator = currentProject.collaborators?.find(
    (c: any) => c.user_id === profile.id
  )

  const role = collaborator?.role || null
  const isOwner = false
  const isEditor = role === 'editor'
  const isViewer = role === 'viewer'

  return { role, isOwner, isEditor, isViewer }
}
