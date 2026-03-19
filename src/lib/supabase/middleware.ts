import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales, type Locale } from "@/i18n/config";

function getLocaleAwarePath(pathname: string) {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  const hasLocale = locales.includes(maybeLocale as Locale);
  const locale = hasLocale ? (maybeLocale as Locale) : defaultLocale;
  const basePath = hasLocale
    ? `/${segments.slice(2).join("/")}`.replace(/\/+$/, "") || "/"
    : pathname;

  return {
    locale,
    hasLocale,
    basePath,
    localePrefix: hasLocale ? `/${locale}` : "",
  };
}

export async function updateSession(
  request: NextRequest,
  response = NextResponse.next({ request })
) {
  let supabaseResponse = response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { basePath, localePrefix } = getLocaleAwarePath(request.nextUrl.pathname);

  const isAuthPage =
    basePath.startsWith("/login") || basePath.startsWith("/signup");

  const isDashboard = basePath.startsWith("/dashboard");

  // Redirect unauthenticated users from dashboard to login
  if (!user && isDashboard) {
    const url = request.nextUrl.clone();
    url.pathname = `${localePrefix}/login`;
    url.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from auth pages to dashboard
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = `${localePrefix}/dashboard`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
