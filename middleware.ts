import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Store routes that admin must not access
const STORE_PATHS = ['/', '/products', '/cart', '/checkout', '/about', '/profile', '/orders', '/order-success'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read user from cookie (we'll set this on login)
  const userCookie = request.cookies.get('techstore_user')?.value;
  if (!userCookie) return NextResponse.next();

  try {
    const user = JSON.parse(userCookie);

    // Block admin from accessing store pages
    const isStorePage = STORE_PATHS.some(p =>
      p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/')
    );
    if (user?.role === 'admin' && isStorePage) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Block non-admin from accessing admin pages
    if (user?.role !== 'admin' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch {}

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.jpeg|orderplace.mp4).*)'],
};
