import { NextResponse } from "next/server";
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID || "MOCK";
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  if (clientId === "MOCK") return NextResponse.redirect(new URL("/dashboard", base));
  const redirect = encodeURIComponent(`${base}/api/auth/google/callback`);
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=openid email profile`);
}
