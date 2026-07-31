import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { delegateId, committee, country, passTier, notes, assignedBy = 'Admin' } = body;

    if (!delegateId || !committee || !country) {
      return NextResponse.json(
        { success: false, error: 'Delegate ID, committee, and country are required' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      // 1. Mark previous allotments for this delegate as not current
      await supabaseAdmin
        .from('allotments')
        .update({ is_current: false })
        .eq('delegate_id', delegateId);

      // 2. Insert new allotment history row
      const { error: insertError } = await supabaseAdmin.from('allotments').insert({
        delegate_id: delegateId,
        committee,
        country,
        pass_tier: passTier,
        assigned_by: assignedBy,
        notes: notes || '',
        is_current: true,
      });

      if (insertError) throw insertError;

      // 3. Update active fields on the delegate record
      const { error: updateError } = await supabaseAdmin
        .from('delegates')
        .update({
          current_committee: committee,
          current_country: country,
          pass_tier: passTier || undefined,
          status: 'Allotted',
        })
        .eq('id', delegateId);

      if (updateError) {
        console.error('Error updating delegate allotment:', updateError);
        throw updateError;
      }

      return NextResponse.json({ success: true, message: 'Allotted successfully with audit log' });
    }

    return NextResponse.json({ success: true, mode: 'mock', message: 'Allotted successfully in mock mode' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
