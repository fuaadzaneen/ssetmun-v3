import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { INITIAL_ROUNDS } from '@/lib/store';
import { Round } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({ success: true, rounds: INITIAL_ROUNDS });
    }

    const { data: dbRounds, error } = await supabaseAdmin
      .from('rounds')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !dbRounds || dbRounds.length === 0) {
      return NextResponse.json({ success: true, rounds: INITIAL_ROUNDS });
    }

    // Merge DB rounds with store defaults (preserves deadline_date & payment_sheet_name)
    const mergedRounds: Round[] = INITIAL_ROUNDS.map((initRound) => {
      const dbMatch = dbRounds.find((r: any) => r.id === initRound.id || r.slug === initRound.slug);
      if (!dbMatch) return initRound;

      return {
        ...initRound,
        sheet_name: dbMatch.sheet_name || initRound.sheet_name,
        fee_tiers: Array.isArray(dbMatch.fee_tiers) && dbMatch.fee_tiers.length > 0
          ? dbMatch.fee_tiers
          : initRound.fee_tiers,
      };
    });

    return NextResponse.json({ success: true, rounds: mergedRounds });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, rounds: INITIAL_ROUNDS }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, slug, fee_tiers, deadline_date, sheet_name } = body;

    if (!id && !slug) {
      return NextResponse.json({ success: false, error: 'Round id or slug is required' }, { status: 400 });
    }

    // Update in-memory INITIAL_ROUNDS
    const targetIdx = INITIAL_ROUNDS.findIndex((r) => r.id === id || r.slug === slug);
    if (targetIdx !== -1) {
      if (fee_tiers) INITIAL_ROUNDS[targetIdx].fee_tiers = fee_tiers;
      if (deadline_date) INITIAL_ROUNDS[targetIdx].deadline_date = deadline_date;
      if (sheet_name) INITIAL_ROUNDS[targetIdx].sheet_name = sheet_name;
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      const updateData: any = {};
      if (fee_tiers) updateData.fee_tiers = fee_tiers;
      if (sheet_name) updateData.sheet_name = sheet_name;

      if (Object.keys(updateData).length > 0) {
        let query = supabaseAdmin.from('rounds').update(updateData);
        if (id) query = query.eq('id', id);
        else query = query.eq('slug', slug);

        const { error } = await query;
        if (error) {
          console.error('Failed to update round in Supabase:', error);
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
      }
    }

    const updated = targetIdx !== -1 ? INITIAL_ROUNDS[targetIdx] : null;
    return NextResponse.json({ success: true, round: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
