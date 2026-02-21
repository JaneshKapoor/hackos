import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // If no token, redirect to login (withAuth handles this)
        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        // Protect /dashboard routes — only HOST can access
        if (path.startsWith("/dashboard") && token.role !== "HOST") {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        // Protect /judge routes — only JUDGE can access
        if (path.startsWith("/judge") && token.role !== "JUDGE") {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        // Protect /my routes — only PARTICIPANT can access
        if (path.startsWith("/my") && token.role !== "PARTICIPANT") {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/judge/:path*",
        "/my/:path*",
    ],
};
