import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return Response.redirect(signInUrl);
  }
});

// Only protect write pages — all other pages stay fully public
export const config = {
  matcher: ["/records/new", "/records/:path*/edit"],
};
