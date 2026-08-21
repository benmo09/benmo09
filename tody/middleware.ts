import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Middleware temporarily disabled for development
  // All routes are publicly accessible
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
