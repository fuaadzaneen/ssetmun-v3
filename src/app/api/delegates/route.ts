import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { INITIAL_ROUNDS } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roundSlug = searchParams.get('roundSlug') || 'priority';

    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({ success: false, delegates: [] });
    }

    let query = supabaseAdmin.from('delegates').select('*').like('email', '%@%');
    
    if (roundSlug !== 'all') {
      const round = INITIAL_ROUNDS.find((r) => r.slug === roundSlug) || INITIAL_ROUNDS[0];
      query = query.eq('round_id', round.id);
    }
    
    const { data, error } = await query.order('synced_at', { ascending: false });

    if (error) {
      console.error('Error fetching delegates:', error);
      return NextResponse.json({ success: false, error: error.message, delegates: [] }, { status: 500 });
    }

    return NextResponse.json({ success: true, delegates: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, delegates: [] }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing delegate ID' }, { status: 400 });
    }

    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const { error } = await supabaseAdmin
      .from('delegates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting delegate:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
