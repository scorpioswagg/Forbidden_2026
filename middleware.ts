import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/reset",
  "/legal",
  "/legal/privacy",
  "/legal/terms",
  "/legal/guidelines"
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isAuthRoute = pathname.startsWith("/auth");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isFeedRoute = pathname.startsWith("/feed");

  if (!user) {
    if (isFeedRoute || isOnboardingRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/login";
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return isPublic ? response : response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  const onboardingComplete = Boolean(profile?.onboarding_completed_at);

  if (isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = onboardingComplete ? "/feed" : "/onboarding";
    return NextResponse.redirect(redirectUrl);
  }

  if (isOnboardingRoute && onboardingComplete) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/feed";
    return NextResponse.redirect(redirectUrl);
  }

  if (isFeedRoute && !onboardingComplete) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/onboarding";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
