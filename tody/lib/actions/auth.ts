'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: 'buyer' | 'seller' = 'buyer'
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('User creation failed')

    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role,
        status: 'active',
      })

    if (profileError) throw profileError

    return { success: true, userId: authData.user.id }
  } catch (error) {
    console.error('Sign up error:', error)
    return { success: false, error: 'Failed to create account' }
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await anonClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (!data.session) throw new Error('No session created')

    const cookieStore = await cookies()
    cookieStore.set('auth-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: data.session.expires_in,
    })

    return { success: true, userId: data.user.id }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error: 'Invalid email or password' }
  }
}

export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')
    redirect('/login')
  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, error: 'Failed to sign out' }
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          cookie: cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; '),
        },
      },
    }
  )

  const { data: { user }, error } = await anonClient.auth.getUser()

  if (error || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await anonClient.auth.resetPasswordForEmail(email)
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return { success: false, error: 'Failed to reset password' }
  }
}
