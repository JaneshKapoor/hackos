import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
            console.log(`[EMAIL MOCK] Body: ${html.substring(0, 200)}...`);
            return { success: true, mock: true };
        }

        const data = await resend.emails.send({
            from: 'Hackos <noreply@hackos.app>',
            to,
            subject,
            html,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
}

// Email Templates
export function registrationConfirmationEmail(name: string, eventTitle: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="color:#7c3aed;font-size:28px;margin:0;">⚡ Hackos</h1>
        </div>
        <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:32px;">
          <h2 style="color:#fff;font-size:22px;margin:0 0 16px;">You're on the list! 🎉</h2>
          <p style="color:#a1a1aa;font-size:15px;line-height:1.6;">
            Hey ${name},<br><br>
            Your registration for <strong style="color:#06b6d4;">${eventTitle}</strong> has been received!
            The host will review your application and you'll get an email once you're approved.
          </p>
          <div style="margin-top:24px;padding:16px;background:#0a0a0a;border-radius:8px;">
            <p style="color:#a1a1aa;font-size:13px;margin:0;">
              📌 Status: <strong style="color:#eab308;">Pending Review</strong>
            </p>
          </div>
        </div>
        <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px;">
          Powered by Hackos — The hackathon management platform
        </p>
      </div>
    </body>
    </html>
  `;
}

export function approvalEmail(name: string, eventTitle: string, qrCodeUrl: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="color:#7c3aed;font-size:28px;margin:0;">⚡ Hackos</h1>
        </div>
        <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:32px;">
          <h2 style="color:#fff;font-size:22px;margin:0 0 16px;">You're Approved! 🚀</h2>
          <p style="color:#a1a1aa;font-size:15px;line-height:1.6;">
            Hey ${name},<br><br>
            Great news! You've been approved for <strong style="color:#06b6d4;">${eventTitle}</strong>!
            Log in to your dashboard to see your QR code for check-in.
          </p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${qrCodeUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">
              View My Dashboard
            </a>
          </div>
        </div>
        <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px;">
          Powered by Hackos — The hackathon management platform
        </p>
      </div>
    </body>
    </html>
  `;
}

export function rejectionEmail(name: string, eventTitle: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="color:#7c3aed;font-size:28px;margin:0;">⚡ Hackos</h1>
        </div>
        <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:32px;">
          <h2 style="color:#fff;font-size:22px;margin:0 0 16px;">Application Update</h2>
          <p style="color:#a1a1aa;font-size:15px;line-height:1.6;">
            Hey ${name},<br><br>
            Thank you for your interest in <strong style="color:#06b6d4;">${eventTitle}</strong>.
            Unfortunately, we weren't able to accept your registration this time.
            Don't be discouraged — keep building and apply to future events!
          </p>
          <div style="margin-top:24px;padding:16px;background:#0a0a0a;border-radius:8px;">
            <p style="color:#a1a1aa;font-size:13px;margin:0;">
              💪 Keep coding, keep creating, and we hope to see you at a future event!
            </p>
          </div>
        </div>
        <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px;">
          Powered by Hackos — The hackathon management platform
        </p>
      </div>
    </body>
    </html>
  `;
}

export function judgeInviteEmail(eventTitle: string, loginUrl: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="color:#7c3aed;font-size:28px;margin:0;">⚡ Hackos</h1>
        </div>
        <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:32px;">
          <h2 style="color:#fff;font-size:22px;margin:0 0 16px;">You're Invited to Judge! 🎯</h2>
          <p style="color:#a1a1aa;font-size:15px;line-height:1.6;">
            You've been invited to judge <strong style="color:#06b6d4;">${eventTitle}</strong>.
            Click below to access your judging dashboard.
          </p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">
              Access Judging Dashboard
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function announcementEmail(eventTitle: string, title: string, body: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="color:#7c3aed;font-size:28px;margin:0;">⚡ Hackos</h1>
        </div>
        <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:32px;">
          <p style="color:#06b6d4;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">
            📢 ${eventTitle}
          </p>
          <h2 style="color:#fff;font-size:22px;margin:0 0 16px;">${title}</h2>
          <div style="color:#a1a1aa;font-size:15px;line-height:1.6;">
            ${body}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function networkingMatchEmail(name: string, matchName: string, matchBio: string, matchLinkedin: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="color:#7c3aed;font-size:28px;margin:0;">⚡ Hackos</h1>
        </div>
        <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:32px;">
          <h2 style="color:#fff;font-size:22px;margin:0 0 16px;">You've Been Matched! 🤝</h2>
          <p style="color:#a1a1aa;font-size:15px;line-height:1.6;">
            Hey ${name}, you've been matched with <strong style="color:#06b6d4;">${matchName}</strong> for networking!
          </p>
          <div style="margin:20px 0;padding:16px;background:#0a0a0a;border-radius:8px;border-left:3px solid #7c3aed;">
            <p style="color:#fff;font-weight:600;margin:0 0 8px;">${matchName}</p>
            <p style="color:#a1a1aa;font-size:14px;margin:0 0 12px;">${matchBio}</p>
            ${matchLinkedin ? `<a href="${matchLinkedin}" style="color:#06b6d4;font-size:13px;">View LinkedIn Profile →</a>` : ''}
          </div>
          <p style="color:#a1a1aa;font-size:14px;">
            Connect with them at the event to earn +5 networking points! 🏆
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
