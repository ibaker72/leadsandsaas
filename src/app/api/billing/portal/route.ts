import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createPortalSession } from '@/lib/billing/stripe';

export const POST = withAuth(async (_req: NextRequest, ctx) => {
  const result = await createPortalSession(ctx.orgId);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.message.includes('No billing account') ? 400 : 500 }
    );
  }

  return NextResponse.json({ url: result.value.url });
}, { requiredRole: 'owner' });
