import { NextResponse } from 'next/server';
import { surveyController } from '@/lib/surveyController';

export async function POST(request: Request) {
  try {
    const { monthId, userId, selections } = await request.json();
    if (!monthId || !userId || !selections) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await surveyController.castVote(monthId, userId, selections);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
