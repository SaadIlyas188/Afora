import { NextResponse } from 'next/server';

// GET /api/test-email  →  sends a test email via Resend to afora.skincare@outlook.com
// DELETE THIS ENDPOINT after confirming email works in production
export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY is not set on this server' }, { status: 500 });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AFORA Orders <onboarding@resend.dev>',
        to: 'afora.skincare@outlook.com',
        subject: 'AFORA — Resend test email',
        html: '<p>This is a test. Resend is working correctly on this deployment.</p>',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: 'Resend API error', details: data }, { status: 502 });
    }

    return NextResponse.json({ success: true, resend_id: data.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
