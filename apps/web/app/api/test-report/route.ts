import { saveTestRun } from "@eptss/core";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Content-Type must be application/json',
          receivedContentType: contentType
        },
        { status: 400 }
      );
    }

    // First get the raw body
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Request body is empty. request: ' + JSON.stringify(request),
          headers: Object.fromEntries(request.headers.entries())
        },
        { status: 400 }
      );
    }

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
          receivedBody: rawBody.slice(0, 500), // Show first 500 chars of what we received
          bodyLength: rawBody.length,
          headers: Object.fromEntries(request.headers.entries())
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!testData?.testName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'testName is required',
          receivedData: testData
        },
        { status: 400 }
      );
    }

    const result = await saveTestRun({
      testName: testData.testName,
      status: testData.status,
      errorMessage: testData.errorMessage || null,
      duration: testData.duration,
      environment: testData.environment,
      startedAt: new Date(testData.startedAt)
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        // type: error.constructor.name,
        request: JSON.stringify(request)
      }, 
      { status: 500 }
    );
  }
}
