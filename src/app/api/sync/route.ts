import { NextResponse } from 'next/server';
import { fetchSheetData, ParsedSheetRow } from '@/lib/googleSheets';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { INITIAL_DELEGATES, INITIAL_ROUNDS } from '@/lib/store';
import { Delegate } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const roundSlug = body.roundSlug || 'priority';

    const round = INITIAL_ROUNDS.find((r) => r.slug === roundSlug) || INITIAL_ROUNDS[0];

    // Fetch live rows from Google Sheet
    let parsedRows: ParsedSheetRow[] = [];
    try {
      parsedRows = await fetchSheetData(round.sheet_id, round.sheet_name);
    } catch (err: any) {
      console.warn('Live Google Sheet fetch notice:', err.message);
      parsedRows = [];
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      let added = 0;
      let updated = 0;
      const conflicts: string[] = [];

      for (const row of parsedRows) {
        // Check existing by email and round_id
        const { data: existing } = await supabaseAdmin
          .from('delegates')
          .select('*')
          .eq('email', row.email)
          .eq('round_id', round.id)
          .maybeSingle();

        if (existing) {
          // Idempotent update: update form fields, preserve allotment & resolved_ca_id
          const { error } = await supabaseAdmin
            .from('delegates')
            .update({
              name: row.name,
              dob: row.dob,
              whatsapp: row.whatsapp,
              college: row.college,
              course: row.course,
              delegation_type: row.delegation_type,
              raw_ca_input: row.raw_ca_input || existing.raw_ca_input,
              muns_attended: row.muns_attended,
              mun_achievements: row.mun_achievements,
              committee_preferences: row.committee_preferences,
              accommodation_required: row.accommodation_required,
              food_preference: row.food_preference,
              travel_assistance: row.travel_assistance,
              queries_suggestions: row.queries_suggestions,
              synced_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (error) console.error('Error updating delegate:', error);
          else updated++;
        } else {
          // Insert new delegate
          const { error } = await supabaseAdmin.from('delegates').insert({
            round_id: round.id,
            name: row.name,
            dob: row.dob,
            email: row.email,
            whatsapp: row.whatsapp,
            college: row.college,
            course: row.course,
            delegation_type: row.delegation_type,
            raw_ca_input: row.raw_ca_input,
            muns_attended: row.muns_attended,
            mun_achievements: row.mun_achievements,
            committee_preferences: row.committee_preferences,
            accommodation_required: row.accommodation_required,
            food_preference: row.food_preference,
            travel_assistance: row.travel_assistance,
            queries_suggestions: row.queries_suggestions,
            status: 'Registered',
            pass_tier: row.delegation_type === 'Institutional' ? 'Institutional Delegate' : 'Home Delegate',
            latest_email_status: 'none',
          });

          if (error) console.error('Error inserting delegate:', error);
          else added++;
        }
      }

      return NextResponse.json({
        success: true,
        summary: {
          round: round.name,
          totalFetched: parsedRows.length,
          added,
          updated,
          skipped: parsedRows.length - (added + updated),
          conflicts,
        },
      });
    }

    // In-memory mode fallback response
    return NextResponse.json({
      success: true,
      mode: 'mock',
      summary: {
        round: round.name,
        totalFetched: parsedRows.length || INITIAL_DELEGATES.length,
        added: parsedRows.length > 0 ? parsedRows.length : 0,
        updated: INITIAL_DELEGATES.length,
        skipped: 0,
        conflicts: [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
