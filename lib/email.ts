/// <reference types="nodemailer" />
import * as nodemailer from 'nodemailer';

export function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.EMAIL_FROM,
  );
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  if (!isEmailConfigured()) {
    return false;
  }

  const smtpHost = process.env.SMTP_HOST!;
  const smtpPort = parseInt(process.env.SMTP_PORT!, 10) || 587;
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
  const smtpUser = process.env.SMTP_USER!;
  const smtpPass = process.env.SMTP_PASS!;
  const from = process.env.EMAIL_FROM!;
  const fromName = process.env.EMAIL_FROM_NAME || 'ARFA Support';

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const mailOptions = {
    from: `${fromName} <${from}>`,
    to: email,
    subject: 'ARFA Password Reset',
    text: `Reset your password using this link:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.5; color: #111;">
        <p>Hi,</p>
        <p>We received a request to reset the password for your ARFA account.</p>
        <p><a href="${resetLink}" style="display:inline-block;padding:12px 18px;background:#6C63FF;color:#fff;text-decoration:none;border-radius:8px;">Reset your password</a></p>
        <p>If that button does not work, paste this link into your browser:</p>
        <p><a href="${resetLink}" style="color:#6C63FF;">${resetLink}</a></p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Password reset email failed:', error);
    return false;
  }
}

async function createEmailTransport() {
  if (isEmailConfigured()) {
    const smtpHost = process.env.SMTP_HOST!;
    const smtpPort = parseInt(process.env.SMTP_PORT!, 10) || 587;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
    const smtpUser = process.env.SMTP_USER!;
    const smtpPass = process.env.SMTP_PASS!;

    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  throw new Error('Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM.');
}

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const from = process.env.EMAIL_FROM || 'no-reply@arfa.app';
  const fromName = process.env.EMAIL_FROM_NAME || 'ARFA Support';
  const transporter = await createEmailTransport();

  const mailOptions = {
    from: `${fromName} <${from}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    if (previewUrl) {
      console.log('Email preview URL:', previewUrl);
    }
    return { success: true, previewUrl };
  } catch (error: any) {
    console.error('Primary email send failed:', error);

    if (process.env.NODE_ENV !== 'production') {
      try {
        const testAccount = await nodemailer.createTestAccount();
        const fallbackTransport = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const fallbackInfo = await fallbackTransport.sendMail(mailOptions);
        const fallbackPreviewUrl = nodemailer.getTestMessageUrl(fallbackInfo) || undefined;
        console.warn('Fallback email sent via Ethereal. Preview URL:', fallbackPreviewUrl);
        return { success: true, previewUrl: fallbackPreviewUrl, fallback: true };
      } catch (fallbackError) {
        console.error('Fallback email send failed:', fallbackError);
      }
    }

    throw error;
  }
}
