const SSET_LOGO = 'https://i.ibb.co/ksY274mG/SSET-MUN-pfp.png';

// The "Easter Egg" Chocobun link — points to /bun page in the app
// On PC: opens browser with full DVD-bounce animation
// Works on mobile browser too
const CHOCOBUN_URL = 'https://ssetmun.vercel.app/bun?n=[DELEGATE_NAME_ENC]';
const CHOCOBUN_IMG = 'https://i.ibb.co/zWq0n3Hq/pngtree-chocolate-buns-png-image-6471290.png';

const EMAIL_HEAD = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root { color-scheme: light !important; }
    body,table,td,p,a { margin:0; padding:0; }
    body { background-color:#061619 !important; background-image: linear-gradient(#061619, #061619) !important; font-family:"Cinzel","Times New Roman",serif !important; color:#f5f4ef !important; -webkit-text-fill-color:#f5f4ef !important; }
    a { text-decoration:none !important; }
    img { border:0; display:block; }
    @media (prefers-color-scheme:dark) {
      body,.wrapper { background-color:#061619 !important; background-image: linear-gradient(#061619, #061619) !important; }
      .inner { background-color:#061619 !important; background-image: linear-gradient(#061619, #061619) !important; }
      .footer-block { background-color:#020c0e !important; background-image: linear-gradient(#020c0e, #020c0e) !important; }
    }
  </style>
`;

const EMAIL_HEADER = `
  <tr>
    <td style="background-color:#0a1e21;background-image:linear-gradient(#0a1e21,#0a1e21);padding:24px 32px 18px 32px;border-bottom:1px solid rgba(204,169,84,0.45);">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr>
          <td style="width:30%;vertical-align:middle;">
            <img src="${SSET_LOGO}" alt="SSET MUN 2.0" width="110" height="110" style="border-radius:14px;box-shadow:0 14px 30px rgba(0,0,0,0.55);">
          </td>
          <td style="width:70%;vertical-align:middle;text-align:right;">
            <div style="font-size:18px;text-transform:uppercase;letter-spacing:0.18em;color:#f5f4ef !important;">SSET MUN · 2.0</div>
            <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#ccb154 !important;margin-top:4px;">2026</div>
          </td>
        </tr>
      </table>
      <div style="font-size:10px;letter-spacing:0.35em;text-transform:uppercase;text-align:center;margin-top:14px;color:#b9c0c3 !important;">Bigger · Better · Benchmark</div>
    </td>
  </tr>
`;

const EMAIL_FOOTER = `
  <tr>
    <td style="background-color:#020c0e;background-image:linear-gradient(#020c0e,#020c0e);padding:28px;border-top:1px solid rgba(204,169,84,0.45);text-align:center;">
      <p style="font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:#9ba3a7 !important;margin:0 0 16px 0;">BIGGER · BETTER · BENCHMARK</p>
      <p style="font-size:12px;color:#cfd4d6 !important;line-height:1.6;margin:0 0 8px 0;">
        <strong style="color:#f5f4ef !important;">In case of queries, contact:</strong><br>
        Pawan: <a href="tel:+918075208923" style="color:#ccb154 !important;">+91 8075208923</a> |
        Tinil: <a href="tel:+918943622795" style="color:#ccb154 !important;">+91 8943622795</a>
      </p>
      <p style="font-size:12px;color:#cfd4d6 !important;line-height:1.6;margin:12px 0 0 0;">
        Visit: <a href="https://ssetmun.dev" style="color:#ccb154 !important;font-weight:bold;">ssetmun.dev</a> &nbsp;|&nbsp;
        Instagram: <a href="https://instagram.com/ssetmun" style="color:#ccb154 !important;font-weight:bold;">@ssetmun</a>
      </p>
      <p style="margin-top:20px;">
        <a href="${CHOCOBUN_URL}" style="display:inline-block;" title="👀 psst... click me">
          <img src="${CHOCOBUN_IMG}" width="40" height="40" alt="🍞" style="border-radius:50%;opacity:0.6;">
        </a>
      </p>
    </td>
  </tr>
`;

export const PRIORITY_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>SSET MUN – Portfolio Allotment</title>
  ${EMAIL_HEAD}
</head>
<body style="background-color:#061619;background-image:linear-gradient(#061619,#061619);color:#f5f4ef !important;-webkit-text-fill-color:#f5f4ef !important;">
  <table cellpadding="0" cellspacing="0" style="width:100%;padding:24px 0;background-color:#061619;background-image:linear-gradient(#061619,#061619);">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" style="max-width:680px;width:100%;border-radius:20px;overflow:hidden;background-color:#0d2729;background-image:radial-gradient(circle at top,#0d2729 0%,#061619 55%,#020607 100%);border:1px solid rgba(204,169,84,0.7);">

          ${EMAIL_HEADER}

          <tr>
            <td style="background-color:#061619;background-image:linear-gradient(#061619,#061619);padding:24px 32px 20px 32px;">
              <p style="font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#ccb154 !important;margin:0;">Portfolio Allotment (Priority Round)</p>
              <p style="font-size:12px;color:#cfd4d6 !important;margin:6px 0 20px 0;">September 11th - 13th, 2026</p>

              <p style="font-size:20px;font-weight:600;color:#f5f4ef !important;margin:0 0 8px 0;">Greetings [Delegate Name],</p>
              <p style="font-size:13px;line-height:1.6;color:#dfe4e6 !important;margin:0;">
                We are pleased to confirm your registration for the
                <span style="color:#ccb154 !important;font-weight:600;">SSET MUN 2.0</span>.
                Your portfolio details are as follows:
              </p>

              <div style="border-radius:16px;border:1px solid rgba(204,169,84,0.6);padding:20px;margin-top:18px;background:#0f2a2d !important;text-align:center;">
                <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#ccb154 !important;margin:0 0 10px 0;">Committee</p>
                <p style="font-size:22px;font-weight:700;color:#f5f4ef !important;margin:0;">[COMMITTEE]</p>
                <p style="font-size:13px;color:#dfe4e6 !important;margin:6px 0 0 0;">As the delegate of</p>
                <p style="font-size:17px;font-weight:600;color:#f5f4ef !important;margin:4px 0 0 0;">[COUNTRY]</p>
              </div>

              <div style="border-radius:16px;border:1px solid rgba(204,169,84,0.6);padding:20px;margin-top:18px;background:#0f2a2d !important;">
                <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#ccb154 !important;margin:0 0 10px 0;">Fee Structure</p>
                <ul style="margin:6px 0 0 0;padding-left:18px;">
                  <li style="font-size:13px;line-height:1.6;color:#dfe4e6 !important;">Delegation: <span style="color:#ccb154 !important;font-weight:600;">₹[FEE_DELEGATION]</span>/- per delegate</li>
                  <li style="font-size:13px;line-height:1.6;color:#dfe4e6 !important;">School Delegation: <span style="color:#ccb154 !important;font-weight:600;">₹[FEE_SCHOOL]</span>/- per delegate</li>
                  <li style="font-size:13px;line-height:1.6;color:#dfe4e6 !important;">Individual: <span style="color:#ccb154 !important;font-weight:600;">₹[FEE_INDIVIDUAL]</span>/- per delegate</li>
                  <li style="font-size:13px;line-height:1.6;color:#dfe4e6 !important;">SSETians: <span style="color:#ccb154 !important;font-weight:600;">₹[FEE_SSETIANS]</span>/- per delegate</li>
                </ul>
                <p style="font-size:11px;line-height:1.6;color:#a9b3b8 !important;margin-top:10px;font-style:italic;border-left:2px solid rgba(204,169,84,0.5);padding-left:10px;">
                  📌 Note: Every institutional delegate who is part of a delegation is required to pay <strong style="color:#ccb154 !important;">₹[FEE_INDIVIDUAL]/-</strong> at the time of registration. The difference of <strong style="color:#ccb154 !important;">₹100/-</strong> will be refunded to your Campus Ambassador upon qualifying as a successful delegation.
                </p>
                <p style="font-size:13px;line-height:1.6;color:#dfe4e6 !important;margin-top:14px;">
                  Please complete payment by <span style="color:#ccb154 !important;font-weight:600;">[PAYMENT_DEADLINE]</span>.
                  Failure to pay will result in cancellation of your portfolio.
                </p>
              </div>

              <div style="text-align:center;margin-top:26px;">
                <a href="[PAYMENT_FORM_URL]" style="display:inline-block;padding:11px 30px;font-size:12px;text-transform:uppercase;letter-spacing:0.18em;color:#000000 !important;background-color:#ccb154 !important;border-radius:999px;font-weight:600;">
                  Complete Registration &amp; Payment
                </a>
              </div>
            </td>
          </tr>

          ${EMAIL_FOOTER}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const MULTI_ROUND_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>SSET MUN – Portfolio Allotment</title>
  ${EMAIL_HEAD}
</head>
<body style="background-color:#061619;background-image:linear-gradient(#061619,#061619);color:#f5f4ef !important;-webkit-text-fill-color:#f5f4ef !important;">
  <table cellpadding="0" cellspacing="0" style="width:100%;padding:24px 0;background-color:#061619;background-image:linear-gradient(#061619,#061619);">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" style="max-width:680px;width:100%;border-radius:20px;overflow:hidden;background-color:#0d2729;background-image:radial-gradient(circle at top,#0d2729 0%,#061619 55%,#020607 100%);border:1px solid rgba(204,169,84,0.7);">

          ${EMAIL_HEADER}

          <tr>
            <td style="background-color:#061619;background-image:linear-gradient(#061619,#061619);padding:24px 32px 20px 32px;">
              <p style="font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#ccb154 !important;margin:0;">Portfolio Allotment ([ROUND_NAME])</p>
              <p style="font-size:12px;color:#cfd4d6 !important;margin:6px 0 20px 0;">September 11th - 13th, 2026</p>

              <p style="font-size:20px;font-weight:600;color:#f5f4ef !important;margin:0 0 8px 0;">Greetings [Delegate Name],</p>
              <p style="font-size:13px;line-height:1.6;color:#dfe4e6 !important;margin:0;">
                We are pleased to confirm your portfolio allotment for
                <span style="color:#ccb154 !important;font-weight:600;">SSET MUN 2.0</span>.
              </p>

              <div style="border-radius:16px;border:1px solid rgba(204,169,84,0.6);padding:20px;margin-top:18px;background:#0f2a2d !important;text-align:center;">
                <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#ccb154 !important;margin:0 0 10px 0;">Allotted Portfolio</p>
                <p style="font-size:22px;font-weight:700;color:#f5f4ef !important;margin:0;">[COMMITTEE]</p>
                <p style="font-size:13px;color:#dfe4e6 !important;margin:6px 0 0 0;">As the delegate of</p>
                <p style="font-size:17px;font-weight:600;color:#f5f4ef !important;margin:4px 0 0 0;">[COUNTRY]</p>
              </div>

              <div style="border-radius:16px;border:1px solid rgba(204,169,84,0.6);padding:20px;margin-top:18px;background:#0f2a2d !important;">
                <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#ccb154 !important;margin:0 0 12px 0;">Registration &amp; Logistics Summary</p>
                <table cellpadding="0" cellspacing="0" style="width:100%;">
                  <tr>
                    <td style="padding-bottom:8px;">
                      <div style="font-size:11px;text-transform:uppercase;color:#ccb154 !important;letter-spacing:0.1em;">Accommodation</div>
                      <div style="font-size:14px;font-weight:600;color:#f5f4ef !important;">[ACCOMMODATION]</div>
                    </td>
                    <td style="padding-bottom:8px;">
                      <div style="font-size:11px;text-transform:uppercase;color:#ccb154 !important;letter-spacing:0.1em;">Food Preference</div>
                      <div style="font-size:14px;font-weight:600;color:#f5f4ef !important;">[FOOD_PREF]</div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style="font-size:11px;text-transform:uppercase;color:#ccb154 !important;letter-spacing:0.1em;">Travel Assistance</div>
                      <div style="font-size:14px;font-weight:600;color:#f5f4ef !important;">[TRAVEL]</div>
                    </td>
                    <td>
                      <div style="font-size:11px;text-transform:uppercase;color:#ccb154 !important;letter-spacing:0.1em;">Pass Tier</div>
                      <div style="font-size:14px;font-weight:600;color:#f5f4ef !important;">[PASS_TIER]</div>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="border-radius:16px;border:1px solid rgba(204,169,84,0.6);padding:20px;margin-top:18px;background:#0f2a2d !important;">
                <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#ccb154 !important;margin:0 0 10px 0;">Fee Structure &amp; Deadline</p>
                <ul style="margin:6px 0 0 0;padding-left:18px;">
                  <li style="font-size:13px;line-height:1.6;color:#dfe4e6 !important;">Delegation: <span style="color:#ccb154 !important;font-weight:600;">₹[FEE_DELEGATION]</span>/- per delegate</li>
                  <li style="font-size:13px;line-height:1.6;color:#dfe4e6 !important;">School Delegation: <span style="color:#ccb154 !important;font-weight:600;">₹[FEE_SCHOOL]</span>/- per delegate</li>
                  <li style="font-size:13px;line-height:1.6;color:#dfe4e6 !important;">Individual: <span style="color:#ccb154 !important;font-weight:600;">₹[FEE_INDIVIDUAL]</span>/- per delegate</li>
                  <li style="font-size:13px;line-height:1.6;color:#dfe4e6 !important;">SSETians: <span style="color:#ccb154 !important;font-weight:600;">₹[FEE_SSETIANS]</span>/- per delegate</li>
                </ul>
                <p style="font-size:11px;line-height:1.6;color:#a9b3b8 !important;margin-top:10px;font-style:italic;border-left:2px solid rgba(204,169,84,0.5);padding-left:10px;">
                  📌 Note: Every institutional delegate who is part of a delegation is required to pay <strong style="color:#ccb154 !important;">₹[FEE_INDIVIDUAL]/-</strong> at the time of registration. The difference of <strong style="color:#ccb154 !important;">₹100/-</strong> will be refunded to your Campus Ambassador upon qualifying as a successful delegation.
                </p>
                <p style="font-size:11px;line-height:1.5;color:#a9b3b8 !important;margin-top:10px;font-style:italic;">
                  * Your current pass tier is <strong style="color:#ccb154 !important;">[PASS_TIER]</strong>.
                </p>
                <p style="font-size:13px;line-height:1.6;color:#dfe4e6 !important;margin-top:14px;">
                  Please complete payment by <span style="color:#ccb154 !important;font-weight:600;">[PAYMENT_DEADLINE]</span>.
                </p>
              </div>

              <div style="text-align:center;margin-top:26px;">
                <a href="[PAYMENT_FORM_URL]" style="display:inline-block;padding:11px 30px;font-size:12px;text-transform:uppercase;letter-spacing:0.18em;color:#000000 !important;background-color:#ccb154 !important;border-radius:999px;font-weight:600;">
                  Complete Registration &amp; Payment
                </a>
              </div>
            </td>
          </tr>

          ${EMAIL_FOOTER}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export function hydrateTemplate(
  rawTemplate: string,
  params: {
    delegateName: string;
    delegateEmail?: string;
    committee: string;
    country: string;
    roundName?: string;
    paymentUrl?: string;
    referenceUrl?: string;
    accommodation?: string;
    foodPref?: string;
    travel?: string;
    passTier?: string;
    paymentDeadline?: string;
    feeDelegation?: number;
    feeSchool?: number;
    feeIndividual?: number;
    feeSSETians?: number;
  }
): string {
  let html = rawTemplate;
  html = html.replace(/\[Delegate Name\]/g, params.delegateName || 'Delegate');
  html = html.replace(/\[DELEGATE_NAME_ENC\]/g, encodeURIComponent(params.delegateName || 'Delegate'));
  html = html.replace(/\[COMMITTEE\]/g, params.committee || 'TBD');
  html = html.replace(/\[COUNTRY\]/g, params.country || 'TBD');
  html = html.replace(/\[ROUND_NAME\]/g, params.roundName || 'Priority Round');
  html = html.replace(/\[PAYMENT_FORM_URL\]/g, params.paymentUrl || 'https://forms.gle/zNNtdiFjRgxqx64D6');
  html = html.replace(/\[REFERENCE_FORM_URL\]/g, params.referenceUrl || 'https://forms.gle/reference');
  html = html.replace(/\[ACCOMMODATION\]/g, params.accommodation || 'N/A');
  html = html.replace(/\[FOOD_PREF\]/g, params.foodPref || 'Standard');
  html = html.replace(/\[TRAVEL\]/g, params.travel || 'N/A');
  html = html.replace(/\[PASS_TIER\]/g, params.passTier || 'Individual');
  html = html.replace(/\[PAYMENT_DEADLINE\]/g, params.paymentDeadline || 'TBD');
  html = html.replace(/\[FEE_DELEGATION\]/g, (params.feeDelegation || 1399).toString());
  html = html.replace(/\[FEE_SCHOOL\]/g, (params.feeSchool || 1399).toString());
  html = html.replace(/\[FEE_INDIVIDUAL\]/g, (params.feeIndividual || 1499).toString());
  html = html.replace(/\[FEE_SSETIANS\]/g, (params.feeSSETians || 1199).toString());
  return html;
}
