import { db } from "@/db";
import { testRuns } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const testData = await request.json();
    const result = await db.insert(testRuns).values({
      testName: testData.title,
      status: testData.state === 'passed' ? 'passed' : 'failed',
      errorMessage: testData.err?.message || null,
      duration: testData.duration,
      environment: testData.environment || 'development',
      startedAt: new Date()
    }).returning();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Failed to save test result:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message }, 
      { status: 500 }
    );
  }
}
