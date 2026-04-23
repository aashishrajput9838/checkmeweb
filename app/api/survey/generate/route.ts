import { NextResponse } from 'next/server';
import { surveyController } from '@/lib/surveyController';

export async function POST(request: Request) {
  try {
    const { monthId } = await request.json();
    if (!monthId) {
      return NextResponse.json({ error: 'Missing monthId' }, { status: 400 });
    }

    const result = await surveyController.generateMenuFromResults(monthId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Menu Generation API Error:", error);
    return NextResponse.json({ error: error.message || 'Menu generation failed' }, { status: 400 });
  }
}
