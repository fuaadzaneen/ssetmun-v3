import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { INITIAL_ROUNDS } from "@/lib/store";

// GET /api/schools?roundSlug=r1
export async function GET(req: Request) {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json({ success: true, schools: [] });
  }

  const { searchParams } = new URL(req.url);
  const roundSlug = searchParams.get("roundSlug");
  const round = INITIAL_ROUNDS.find((r) => r.slug === roundSlug);

  try {
    let query = supabaseAdmin
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });

    if (round) query = query.eq("round_id", round.id);

    const { data: schools, error } = await query;
    if (error) throw error;

    // Attach delegate counts
    const enriched = await Promise.all(
      (schools ?? []).map(async (school: any) => {
        const { count } = await supabaseAdmin!
          .from("delegates")
          .select("id", { count: "exact", head: true })
          .eq("school_id", school.id);
        return { ...school, delegate_count: count ?? 0 };
      })
    );

    return NextResponse.json({ success: true, schools: enriched });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/schools  — create
export async function POST(req: Request) {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  const body = await req.json();
  const { name, coordinator_name, coordinator_email, coordinator_phone, price_per_delegate, payment_link, sheet_id, sheet_name, round_id, notes } = body;

  if (!name || !price_per_delegate || !payment_link) {
    return NextResponse.json({ success: false, error: "name, price_per_delegate and payment_link are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("schools")
    .insert({ name, coordinator_name, coordinator_email, coordinator_phone, price_per_delegate, payment_link, sheet_id, sheet_name, round_id, notes })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, school: data });
}

// PATCH /api/schools  — update
export async function PATCH(req: Request) {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("schools")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, school: data });
}

// DELETE /api/schools?id=xxx
export async function DELETE(req: Request) {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

  const { count } = await supabaseAdmin
    .from("delegates")
    .select("id", { count: "exact", head: true })
    .eq("school_id", id);

  if (count && count > 0) {
    return NextResponse.json({ success: false, error: `Cannot delete — ${count} delegates linked to this school.` }, { status: 409 });
  }

  const { error } = await supabaseAdmin.from("schools").delete().eq("id", id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
