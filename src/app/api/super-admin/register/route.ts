import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { SuperAdmin } from "@/lib/models/SuperAdmin";
import { jsonWithSuperAdminSession } from "@/lib/superadmin-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "Super Administrator";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await SuperAdmin.findByUsername(username);
    if (existing) {
      return NextResponse.json(
        { error: "This Super Admin username is already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await SuperAdmin.create({
      username,
      passwordHash,
      name: name || "Super Administrator",
      email,
      phone,
    });

    return await jsonWithSuperAdminSession(created.id, created.username, created.name);
  } catch (e: any) {
    console.error("Super Admin registration error:", e);
    const msg = e?.message || "Failed to register Super Admin";
    let userMsg = msg;
    if (e?.code === "ECONNREFUSED" || e?.code === "ETIMEDOUT" || e?.code === "ENOTFOUND") {
      userMsg = "Database connection failed. Please ensure your cloud MySQL database is active and DATABASE_URL or MYSQL_HOST is configured in Vercel Environment Variables.";
    } else if (e?.code === "ER_ACCESS_DENIED_ERROR") {
      userMsg = "Database access denied. Please verify your MySQL username and password in Vercel.";
    }
    return NextResponse.json(
      { error: userMsg, code: e?.code },
      { status: 500 }
    );
  }
}
