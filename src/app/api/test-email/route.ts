import { NextResponse } from 'next/server';

// Diagnostic endpoint — GET /api/test-email?to=your@email.com
// Remove this file after debugging
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get('to') || 'afora.skincare@outlook.com';

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY is NOT set in environment' }, { status: 500 });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'AFORA <onboarding@resend.dev>',
      to,
      subject: 'AFORA Email Test',
      html: '<p>This is a test email from AFORA. If you see this, Resend is working correctly.</p>',
    }),
  });

  const body = await res.json();
  return NextResponse.json({ status: res.status, resend_response: body });
}
