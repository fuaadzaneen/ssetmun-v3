import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { INITIAL_ROUNDS } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roundSlug = searchParams.get('roundSlug') || 'priority';

    const round = INITIAL_ROUNDS.find((r) => r.slug === roundSlug) || INITIAL_ROUNDS[0];

    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({ success: false, delegates: [] });
    }

    const { data, error } = await supabaseAdmin
      .from('delegates')
      .select('*')
      .eq('round_id', round.id)
      .order('synced_at', { ascending: false });

    if (error) {
      console.error('Error fetching delegates:', error);
      return NextResponse.json({ success: false, error: error.message, delegates: [] }, { status: 500 });
    }

    return NextResponse.json({ success: true, delegates: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, delegates: [] }, { status: 500 });
  }
}
