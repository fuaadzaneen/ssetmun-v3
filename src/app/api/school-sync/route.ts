import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { fetchSchoolSheetData } from "@/lib/schoolSheets";
import { INITIAL_ROUNDS } from "@/lib/store";

// POST /api/school-sync
// Body: { schoolId: string; roundSlug: string }
export async function POST(req: Request) {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const { schoolId, roundSlug } = body;

  if (!schoolId) {
    return NextResponse.json({ success: false, error: "schoolId is required" }, { status: 400 });
  }

  // Fetch the school record
  const { data: school, error: schoolErr } = await supabaseAdmin
    .from("schools")
    .select("*")
    .eq("id", schoolId)
    .single();

  if (schoolErr || !school) {
    return NextResponse.json({ success: false, error: "School not found" }, { status: 404 });
  }

  if (!school.sheet_id) {
    return NextResponse.json({ success: false, error: "No Google Sheet linked to this school. Please edit the school and add the sheet link." }, { status: 422 });
  }

  const round = INITIAL_ROUNDS.find((r) => r.slug === roundSlug) ?? INITIAL_ROUNDS[0];

  // Fetch rows from school's Google Sheet
  let rows: Awaited<ReturnType<typeof fetchSchoolSheetData>> = [];
  try {
    rows = await fetchSchoolSheetData(school.sheet_id, school.sheet_name || undefined);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: `Could not read sheet: ${err.message}` }, { status: 502 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ success: true, summary: { added: 0, updated: 0, skipped: 0, skippedEmails: [] } });
  }

  let added = 0;
  let updated = 0;
  const skippedEmails: string[] = [];

  for (const row of rows) {
    if (!row.email || !row.name) continue;

    const normalizedEmail = row.email.trim().toLowerCase();

    // Check if delegate already exists in this round (by email)
    const { data: existing } = await supabaseAdmin
      .from("delegates")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("round_id", round.id)
      .maybeSingle();

    if (existing) {
      // Protect allotted/confirmed delegates — only update form fields
      const { error: updateErr } = await supabaseAdmin
        .from("delegates")
        .update({
          name: row.name,
          whatsapp: row.whatsapp,
          emergency_contact: row.emergency_contact,
          food_preference: row.food_preference,
          committee_preferences: row.committee_preferences,
          school_id: school.id,
          school_price: school.price_per_delegate,
          // Preserve allotment state
          current_committee: existing.current_committee,
          current_country: existing.current_country,
          status: existing.status,
          pass_tier: existing.pass_tier,
          synced_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (!updateErr) updated++;
    } else {
      const { error: insertErr } = await supabaseAdmin.from("delegates").insert({
        round_id: round.id,
        name: row.name,
        email: normalizedEmail,
        whatsapp: row.whatsapp,
        emergency_contact: row.emergency_contact,
        college: school.name,          // school name goes in college field
        food_preference: row.food_preference,
        committee_preferences: row.committee_preferences,
        delegation_type: "School Delegate",
        pass_tier: "School Delegate",
        school_id: school.id,
        school_price: school.price_per_delegate,
        status: "Registered",
        payment_status: "Pending",
        latest_email_status: "none",
        synced_at: new Date().toISOString(),
      });

      if (!insertErr) added++;
      else skippedEmails.push(normalizedEmail);
    }
  }

  return NextResponse.json({
    success: true,
    summary: {
      school: school.name,
      totalFetched: rows.length,
      added,
      updated,
      skipped: skippedEmails.length,
      skippedEmails,
    },
  });
}
