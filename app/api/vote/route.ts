import { NextResponse } from 'next/server';
import { pollController } from '@/lib/pollController';

export async function POST(request: Request) {
  try {
    const { userId, selectedOption } = await request.json();
    if (!userId || !selectedOption) {
      return NextResponse.json({ error: 'Missing userId or selectedOption' }, { status: 400 });
    }

    await pollController.castVote(userId, selectedOption);
    const updatedPoll = await pollController.getCurrentPoll();
    return NextResponse.json(updatedPoll);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
