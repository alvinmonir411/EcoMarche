import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@gmail.com", password: "pass13663" }),
    });
    
    const data = await res.json();
    return NextResponse.json({ status: res.status, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
