import { NextResponse } from "next/server";
const baseURL = "http://localhost:8080";
export async function middleware(request) {
  const authRoutes = ["/login"];
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const url = request.nextUrl.clone();

  if (!token) {
    url.pathname = "/login";
  } else if (token && authRoutes.includes(pathname)) {
    url.pathname = "/";
  }
  return pathname != url.pathname
    ? NextResponse.redirect(url)
    : NextResponse.next();
}

export const config = {
  matcher: "/((?!api|admin|static|.*\\..*|_next).*)",
};