import { NextResponse } from 'next/server';

// Live matches disabled to save API quota
// Will be re-enabled when Pro plan is active
export async function GET() {
  return NextResponse.json({ live: [], disabled: true });
}
