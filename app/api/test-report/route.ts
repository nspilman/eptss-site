import { db } from "@/db";
import { testRuns } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // First get the raw body
    const rawBody = await request.text();
    
    // Try to parse JSON with detailed error handling
    let testData;
    try {
      testData = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body',
          details: e instanceof Error ? e.message : String(e),
          receivedBody: rawBody.slice(0, 500) // Show first 500 chars of what we received
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!testData?.testName) {
      return NextResponse.json(
        { success: false, error: 'testName is required' },
        { status: 400 }
      );
    }

    const result = await db.insert(testRuns).values({
      testName: testData.testName,
      status: testData.status,
      errorMessage: testData.errorMessage || null,
      duration: testData.duration,
      environment: testData.environment,
      startedAt: new Date(testData.startedAt)
    }).returning();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}
