import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Supabase server not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { email, password, nama, jabatan, avatar } = await req.json();

  if (!email || !password || !nama) {
    return NextResponse.json({ error: "Email, password, and nama required" }, { status: 400 });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nama, jabatan, avatar: avatar ?? "therapist" },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data.user.id });
}
