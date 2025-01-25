import { db } from "@/db";
import { testRuns } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text(); // Get raw body first
    console.log('Raw request body:', rawBody);
    
    const testData = JSON.parse(rawBody);
    console.log('Parsed test data:', JSON.stringify(testData, null, 2));
    console.log('testName type:', typeof testData.testName);
    console.log('testName value:', testData.testName);
    console.log('Full testData keys:', Object.keys(testData));
    
    const result = await db.insert(testRuns).values({
      testName: testData?.testName ?? testData?.['test_name'] ?? "Placeholder",
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
