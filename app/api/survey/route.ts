import { NextResponse } from 'next/server';
import { surveyController } from '@/lib/surveyController';

export async function GET() {
  try {
    const survey = await surveyController.getActiveSurvey();
    return NextResponse.json(survey);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const { monthId, monthName, slots } = await request.json();
    const result = await surveyController.createSurvey(monthId, monthName, slots);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Survey Creation API Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to create survey' }, { status: 400 });
  }
}
