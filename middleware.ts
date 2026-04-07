import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isPublicAsset(pathname: string) {
  return pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/favicon') || /\.[a-zA-Z0-9]+$/.test(pathname);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/login' || pathname.startsWith('/tutor') || isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  const authed = req.cookies.get('st_auth');
  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};
