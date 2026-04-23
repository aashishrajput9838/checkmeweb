import { NextResponse } from 'next/server';
import { pollController } from '@/lib/pollController';

export async function GET() {
  try {
    const poll = await pollController.getCurrentPoll();
    return NextResponse.json(poll);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
