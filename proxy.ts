import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Named export "proxy" for Next.js 16+
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for static files, API routes, and images
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Check setup status via cookie
  const setupComplete = request.cookies.get('setup-complete');
  const isSetup = setupComplete?.value === 'true';
  
  console.log('Proxy check:', { pathname, cookieValue: setupComplete?.value, isSetup });

  // If accessing setup page
  if (pathname === '/setup') {
    // If already setup, redirect to home (no backdoor access)
    if (isSetup) {
      console.log('Setup complete - redirecting /setup to /');
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Allow access to setup if not complete
    return NextResponse.next();
  }

  // For homepage and other routes
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/dashboard')) {
    // If not setup, redirect to setup
    if (!isSetup) {
      console.log('Setup not complete - redirecting to /setup');
      return NextResponse.redirect(new URL('/setup', request.url));
    }
    // Allow access if setup complete
    console.log('Setup complete - allowing access to', pathname);
    return NextResponse.next();
  }

  // Default: allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
