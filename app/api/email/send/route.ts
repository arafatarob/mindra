import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, isEmailConfigured } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, text, html, scheduledAt } = await request.json();

    if (!to || !subject || !text) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, text' }, { status: 400 });
    }

    if (!isEmailConfigured() && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Email service is not configured for production.' }, { status: 500 });
    }

    if (scheduledAt) {
      // Handle scheduled email
      const scheduledDate = new Date(scheduledAt);
      const now = new Date();

      if (scheduledDate <= now) {
        return NextResponse.json({ error: 'Scheduled time must be in the future.' }, { status: 400 });
      }

      // For now, we'll simulate scheduling by storing in memory
      // In production, you'd want to use a proper job queue like Bull or database
      const delay = scheduledDate.getTime() - now.getTime();

      setTimeout(async () => {
        try {
          await sendEmail(to, subject, text, html);
          console.log(`Scheduled email sent to ${to} at ${scheduledDate.toISOString()}`);
        } catch (error) {
          console.error('Scheduled email failed:', error);
        }
      }, delay);

      return NextResponse.json({
        success: true,
        message: `Email scheduled for ${scheduledDate.toLocaleString()}`
      });
    } else {
      // Send immediately
      const result = await sendEmail(to, subject, text, html);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: 'Failed to send email. Please check your email configuration.' }, { status: 500 });
  }
}