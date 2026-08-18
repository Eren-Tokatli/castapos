import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const reqUrl = new URL(req.url);
  const session = req.auth;
  const isLoggedIn = !!session;

  const isAdminRoute = reqUrl.pathname.startsWith("/admin");
  const isSupportRoute = reqUrl.pathname.startsWith("/destek");
  const isAuthPage = reqUrl.pathname.startsWith("/hesap/giris") || reqUrl.pathname.startsWith("/hesap/kayit");
  // Protect all /hesap sub-routes except sign-in and registration
  const isAccountRoute =
    reqUrl.pathname.startsWith("/hesap") &&
    !isAuthPage;

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL(`/hesap/giris?callbackUrl=${encodeURIComponent(reqUrl.pathname)}`, req.nextUrl));
    }
    if (session?.user?.role !== "ADMIN") {
      return Response.redirect(new URL("/", req.nextUrl));
    }
  }

  if (isSupportRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL(`/hesap/giris?callbackUrl=${encodeURIComponent(reqUrl.pathname)}`, req.nextUrl));
    }
    if (session?.user?.role !== "SUPPORT" && session?.user?.role !== "ADMIN") {
      return Response.redirect(new URL("/", req.nextUrl));
    }
  }

  if (isAccountRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL(`/hesap/giris?callbackUrl=${encodeURIComponent(reqUrl.pathname)}`, req.nextUrl));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/destek/:path*", "/hesap/:path*"],
};
