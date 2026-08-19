import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { hydrateTemplate, PRIORITY_EMAIL_TEMPLATE, MULTI_ROUND_EMAIL_TEMPLATE } from '@/lib/emailTemplates';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';

const smtpEmail = process.env.SMTP_EMAIL;
const smtpPassword = process.env.SMTP_PASSWORD;

const transporter = (smtpEmail && smtpPassword) ? nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: smtpEmail,
    pass: smtpPassword,
  },
  tls: {
    rejectUnauthorized: false
  }
}) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { delegates, roundSlug = 'priority', templateType = 'priority', isBulk = false, roundData } = body;

    if (!delegates || !Array.isArray(delegates) || delegates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No delegates provided for email dispatch' },
        { status: 400 }
      );
    }

    // Extract fee info from passed roundData (set from the UI's active round)
    const feeTiers: { name: string; price: number; payment_url: string }[] = roundData?.fee_tiers || [];
    const sharedPaymentUrl = feeTiers[0]?.payment_url || 'https://forms.gle/zNNtdiFjRgxqx64D6';
    const paymentDeadline = roundData?.deadline_date || 'TBD';
    const roundName = roundData?.name || (roundSlug === 'priority' ? 'Priority Round' : roundSlug === 'r1' ? 'Round 1' : 'Round 2');

    const feeDelegation = feeTiers.find((t) => t.name === 'Institutional Delegate')?.price;
    const feeSchool = feeTiers.find((t) => t.name === 'School Delegate')?.price;
    const feeIndividual = feeTiers.find((t) => t.name === 'Individual Delegate')?.price;
    const feeSSETians = feeTiers.find((t) => t.name === 'Home Delegate')?.price;

    const results = [];

    for (const del of delegates) {
      const templateContent = templateType === 'priority' ? PRIORITY_EMAIL_TEMPLATE : MULTI_ROUND_EMAIL_TEMPLATE;
      const html = hydrateTemplate(templateContent, {
        delegateName: del.name,
        delegateEmail: del.email,
        committee: del.current_committee || del.committee || 'UNGA-DISEC',
        country: del.current_country || del.country || 'India',
        roundName,
        passTier: del.pass_tier || 'Institutional Delegate',
        accommodation: del.accommodation_required || 'No',
        foodPref: del.food_preference || 'Non-Veg',
        travel: del.travel_assistance || 'No',
        paymentUrl: sharedPaymentUrl,
        paymentDeadline,
        feeDelegation,
        feeSchool,
        feeIndividual,
        feeSSETians,
      });

      let status = 'sent';
      let messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      let errorMsg = null;

      if (transporter) {
        try {
          const info = await transporter.sendMail({
            from: `"SSET MUN Secretariat" <${smtpEmail}>`,
            to: del.email,
            subject: `Portfolio Allotment – SSET MUN 2026 (${del.current_committee || 'Allotted'})`,
            html: html,
          });
          messageId = info.messageId || messageId;
        } catch (mailErr: any) {
          status = 'failed';
          errorMsg = mailErr.message;
        }
      } else {
        status = 'failed';
        errorMsg = 'SMTP credentials not configured in .env.local';
      }

      // Record email log in Supabase
      if (isSupabaseConfigured && supabaseAdmin) {
        await supabaseAdmin.from('email_logs').insert({
          delegate_id: del.id,
          template_name: templateType,
          recipient_email: del.email,
          provider_message_id: messageId,
          status,
          error_message: errorMsg,
          sent_at: new Date().toISOString(),
        });

        await supabaseAdmin
          .from('delegates')
          .update({
            latest_email_status: status,
            latest_email_sent_at: new Date().toISOString(),
          })
          .eq('id', del.id);
      }

      results.push({
        id: del.id,
        email: del.email,
        name: del.name,
        status,
        messageId,
        error: errorMsg,
      });
    }

    return NextResponse.json({
      success: true,
      totalSent: results.filter((r) => r.status === 'sent').length,
      totalFailed: results.filter((r) => r.status === 'failed').length,
      details: results,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
