import { Handler } from '@netlify/functions';
import { db } from '../../db';
import { testRuns } from '../../db/schema';

export const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    // Parse the body
    const testData = JSON.parse(event.body || '');

    // Insert into database
    const result = await db.insert(testRuns).values({
      testName: testData.testName,
      status: testData.status,
      errorMessage: testData.errorMessage || null,
      duration: testData.duration,
      environment: testData.environment,
      startedAt: new Date(testData.startedAt)
    }).returning();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: result[0] })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        body: event.body // Log what we received
      })
    };
  }
};
