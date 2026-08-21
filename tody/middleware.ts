import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${request.cookies.get('sb-access-token')?.value}`,
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    // No user logged in
    if (error || !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Get user role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, is_blocked')
      .eq('id', user.id)
      .single()

    // Not admin or blocked
    if (!userProfile || userProfile.role !== 'admin' || userProfile.is_blocked) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
