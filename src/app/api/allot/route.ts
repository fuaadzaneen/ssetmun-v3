import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { delegateId, committee, country, passTier, notes, assignedBy = 'Admin' } = body;

    console.log('[allot] Received request:', { delegateId, committee, country, passTier });

    if (!delegateId || !committee || !country) {
      return NextResponse.json(
        { success: false, error: 'Delegate ID, committee, and country are required' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      // 0. First verify the delegate actually exists in the DB with this ID
      const { data: delegateCheck, error: checkError } = await supabaseAdmin
        .from('delegates')
        .select('id, name, status')
        .eq('id', delegateId)
        .maybeSingle();

      if (checkError) {
        console.error('[allot] Error checking delegate existence:', checkError);
        return NextResponse.json({ success: false, error: 'DB error checking delegate: ' + checkError.message }, { status: 500 });
      }

      if (!delegateCheck) {
        console.error('[allot] Delegate NOT FOUND in DB with id:', delegateId);
        return NextResponse.json({
          success: false,
          error: `Delegate with id "${delegateId}" was not found in the database. This delegate may only exist in the local mock data and has not been synced to Supabase yet.`,
        }, { status: 404 });
      }

      console.log('[allot] Found delegate in DB:', delegateCheck.name);

      // 1. Mark previous allotments for this delegate as not current
      const { error: archiveError } = await supabaseAdmin
        .from('allotments')
        .update({ is_current: false })
        .eq('delegate_id', delegateId);

      if (archiveError) {
        console.warn('[allot] Warning archiving old allotments (non-fatal):', archiveError.message);
      }

      // 2. Insert new allotment history row
      // Note: pass_tier is stored on the delegates table, not the allotments table
      const { error: insertError } = await supabaseAdmin.from('allotments').insert({
        delegate_id: delegateId,
        committee,
        country,
        assigned_by: assignedBy,
        notes: notes || '',
        is_current: true,
      });

      if (insertError) {
        console.error('[allot] Error inserting allotment log:', insertError);
        throw insertError;
      }

      // 3. Update active fields on the delegate record
      const { data: updatedDelegate, error: updateError } = await supabaseAdmin
        .from('delegates')
        .update({
          current_committee: committee,
          current_country: country,
          pass_tier: passTier || undefined,
          status: 'Allotted',
        })
        .eq('id', delegateId)
        .select(); // <-- select() forces Supabase to return what was actually updated

      if (updateError) {
        console.error('[allot] Error updating delegate record:', updateError);
        throw updateError;
      }

      // Verify the update actually affected a row
      if (!updatedDelegate || updatedDelegate.length === 0) {
        console.error('[allot] Update ran but affected 0 rows for delegateId:', delegateId);
        return NextResponse.json({
          success: false,
          error: `Update affected 0 rows. The delegate record for id "${delegateId}" could not be found or was not modified.`,
        }, { status: 500 });
      }

      console.log('[allot] Successfully allotted:', updatedDelegate[0].name, '->', committee, country);
      return NextResponse.json({
        success: true,
        message: 'Allotted successfully with audit log',
        delegate: updatedDelegate[0],
      });
    }

    // Mock mode fallback (no Supabase)
    console.warn('[allot] Running in mock mode — no Supabase configured');
    return NextResponse.json({ success: true, mode: 'mock', message: 'Allotted successfully in mock mode' });
  } catch (err: any) {
    console.error('[allot] Unhandled error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
