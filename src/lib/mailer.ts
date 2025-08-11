import nodemailer from 'nodemailer'

export async function sendInviteEmail(to: string, inviteUrl: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[EMAIL] SMTP not configured. Invite link:', inviteUrl)
    return
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  })

  const from = process.env.SMTP_FROM || process.env.SMTP_USER!

  await transporter.sendMail({
    from,
    to,
    subject: 'You’ve been invited to join a TeamFlow workspace',
    html: `
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
        <p>Hello,</p>
        <p>You’ve been invited to join a workspace on TeamFlow.</p>
        <p>
          <a href="${inviteUrl}" style="display:inline-block;padding:10px 16px;background:#6d28d9;color:#fff;border-radius:6px;text-decoration:none">Accept invitation</a>
        </p>
        <p>Or copy this link into your browser:<br/>${inviteUrl}</p>
        <p>If you did not expect this invitation, you can ignore this email.</p>
      </div>
    `
  })
}


