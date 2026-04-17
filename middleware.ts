import { getAppRoleForUser } from "@/lib/auth/user-role";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/index.html";
    return NextResponse.rewrite(url);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login?error=config", request.url));
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appRole = user ? await getAppRoleForUser(supabase, user.id) : null;
  const isAdmin = appRole === "admin";

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login?error=forbidden", request.url));
    }
  }

  if (pathname === "/admin/login" && user) {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/account", request.url));
  }

  if ((pathname === "/login" || pathname === "/register") && user) {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/account", request.url));
  }

  if (pathname.startsWith("/account")) {
    if (!user) {
      const next = encodeURIComponent(pathname + (request.nextUrl.search || ""));
      return NextResponse.redirect(new URL(`/login?next=${next}`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/admin",
    "/admin/:path*",
    "/login",
    "/register",
    "/account",
    "/account/:path*",
    "/auth/callback",
  ],
};
