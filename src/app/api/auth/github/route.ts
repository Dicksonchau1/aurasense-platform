import { NextResponse } from "next/server";
export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID || "MOCK";
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  if (clientId === "MOCK") return NextResponse.redirect(new URL("/dashboard", base));
  const redirect = encodeURIComponent(`${base}/api/auth/github/callback`);
  return NextResponse.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirect}&scope=read:user user:email`);
}
