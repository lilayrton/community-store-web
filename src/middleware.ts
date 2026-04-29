import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "default_secret_key_change_me_in_production"
);

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    const { pathname } = request.nextUrl;

    // 1. Redirect logged-in users trying to access login pages
    if (pathname === '/login' || pathname === '/admin/login') {
        if (session) {
            try {
                const { payload } = await jwtVerify(session, JWT_SECRET);

                // Case A: Admin authenticated
                if (payload.role === 'ADMIN') {
                    // Admins going to /admin/login -> /admin
                    if (pathname === '/admin/login') {
                        return NextResponse.redirect(new URL('/admin', request.url));
                    }
                    // Admins going to /login -> redirect to /admin
                    if (pathname === '/login') {
                        return NextResponse.redirect(new URL('/admin', request.url));
                    }
                }

                // Case B: Customer authenticated
                if (payload.role !== 'ADMIN') {
                    // Customers going to /admin/login -> redirect to /
                    if (pathname === '/admin/login') {
                        return NextResponse.redirect(new URL('/', request.url));
                    }
                    // Customers going to /login -> /
                    if (pathname === '/login') {
                        return NextResponse.redirect(new URL('/', request.url));
                    }
                }

            } catch (error) {
                // Token invalid, let them proceed to login page
            }
        }
        return NextResponse.next();
    }

    // 2. Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        // Allow access to login page
        if (pathname === '/admin/login') {
            return NextResponse.next();
        }

        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            const { payload } = await jwtVerify(session, JWT_SECRET, {
                algorithms: ['HS256'],
            });

            if (payload.role !== 'ADMIN') {
                // Logged in via customer login but trying to access admin
                return NextResponse.redirect(new URL('/', request.url));
            }

            return NextResponse.next();
        } catch (error) {
            // Invalid token
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
