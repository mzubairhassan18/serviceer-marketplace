import { type NextRequest, NextResponse } from "next/server";

import { getPublicSupabaseEnv } from "@/lib/supabase/env";
import { createServerClient } from "@supabase/ssr";

const publicPaths = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/update-password",
  "/auth",
  "/gigs",
  "/search",
  "/contact",
  "/",
  "/offline",
];

export async function middleware(request: NextRequest) {
  const { publishableKey, url } = getPublicSupabaseEnv();

  let supabaseResponse = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const isPublic = publicPaths.some((p) => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(p + "/"));

  if (!user && !isPublic) {
    const redirectUrl = new URL("/sign-in", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
