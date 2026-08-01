import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { INITIAL_ROUNDS } from '@/lib/store';

export const dynamic = 'force-dynamic';

// GET /api/delegates/debug?email=someone@example.com
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const roundSlug = searchParams.get('roundSlug') || 'priority';

    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const round = INITIAL_ROUNDS.find((r) => r.slug === roundSlug) || INITIAL_ROUNDS[0];

    let query = supabaseAdmin
      .from('delegates')
      .select('id, name, email, status, current_committee, current_country, round_id')
      .eq('round_id', round.id);

    if (email) {
      query = query.ilike('email', `%${email}%`);
    }

    const { data, error } = await query.limit(20);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ round_id_used: round.id, delegates: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
