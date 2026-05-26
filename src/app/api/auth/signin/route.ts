import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  const res = NextResponse.json({ ok: true, user: { email } });
  res.cookies.set("atlas_session", "mock-token", { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
