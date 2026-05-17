import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    const authToken = request.cookies.get('authToken');
    if (!authToken) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/authentication';
      redirectUrl.search = `redirect=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
