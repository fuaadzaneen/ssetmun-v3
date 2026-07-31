import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { delegateId, rawCaInput, caId, isBulk } = body;

    if (!caId) {
      return NextResponse.json({ success: false, error: 'Campus Ambassador ID is required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      if (isBulk && rawCaInput) {
        // Resolve all delegates with matching raw_ca_input
        const { data, error } = await supabaseAdmin
          .from('delegates')
          .update({ resolved_ca_id: caId })
          .eq('raw_ca_input', rawCaInput)
          .select();

        if (error) throw error;
        return NextResponse.json({ success: true, count: data.length });
      } else if (delegateId) {
        // Single resolution
        const { error } = await supabaseAdmin
          .from('delegates')
          .update({ resolved_ca_id: caId })
          .eq('id', delegateId);

        if (error) throw error;
        return NextResponse.json({ success: true, count: 1 });
      }
    }

    return NextResponse.json({ success: true, mode: 'mock', count: isBulk ? 2 : 1 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
