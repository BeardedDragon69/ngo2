import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get path
  const path = request.nextUrl.pathname;
  
  // Define protected routes
  const adminRoutes = ['/admin', '/member_control'];
  
  // Check if path is a protected admin route
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route));
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // If trying to access admin routes without a token, redirect to login
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    // Match admin paths
    '/admin/:path*', 
    '/member_control/:path*',
    // Don't match api routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 