'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { validateLogicInput } from '@/lib/security'

function checkSafety(...inputs: (string | null | undefined)[]) {
  for (const input of inputs) {
    const safety = validateLogicInput(input)
    if (!safety.isValid) {
      throw new Error(`Security Violation: ${safety.reason}`)
    }
  }
}

export async function addConstantAction(projectId: string, name: string, value: string, type: string) {
  checkSafety(name, value)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('constants')
    .insert([{ project_id: projectId, name, value, type }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function addFunctionAction(projectId: string, name: string, description?: string) {
  checkSafety(name, description)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('functions')
    .insert([{ 
      project_id: projectId, 
      name, 
      description,
      return_type: 'void',
      parameters: [],
      implementation_language: 'pseudo-code'
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function addDependencyAction(projectId: string, name: string, version: string, type: string) {
  checkSafety(name, version, type)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dependencies')
    .insert([{ project_id: projectId, name, version, type }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deleteConstantAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('constants')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteFunctionAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('functions')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteDependencyAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('dependencies')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

export async function updateConstantAction(projectId: string, id: string, name: string, value: string, type: string) {
  checkSafety(name, value)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('constants')
    .update({ name, value, type })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function updateFunctionAction(
  projectId: string,
  id: string,
  name: string,
  description: string | null,
  parameters: any[],
  returnType: string | null,
  implementationCode: string | null,
  implementationLanguage: string | null = 'pseudo-code'
) {
  checkSafety(name, description, returnType, implementationCode)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('functions')
    .update({
      name,
      description,
      parameters,
      return_type: returnType,
      implementation_code: implementationCode,
      implementation_language: implementationLanguage,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function updateDependencyAction(
  projectId: string,
  id: string,
  name: string,
  version: string,
  type: string
) {
  checkSafety(name, version, type)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dependencies')
    .update({
      name,
      version,
      type
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

