import { db } from "@/db";
import { testRuns } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const testData = await request.json();
    console.log('Received test data:', testData);  
    const result = await db.insert(testRuns).values({
      testName: testData.testName,
      status: testData.status,
      errorMessage: testData.errorMessage || null,
      duration: testData.duration,
      environment: testData.environment,
      startedAt: new Date(testData.startedAt)
    }).returning();

    console.log('Saved test result:', result[0]);  
    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Failed to save test result:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message }, 
      { status: 500 }
    );
  }
}
