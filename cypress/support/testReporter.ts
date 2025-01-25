import { db } from '../../db';
import { testRuns } from '../../db/schema';

console.log('Test reporter loaded!');

Cypress.on('test:after:run', async (attributes) => {
  console.log('Test:after:run event fired!');
  
  const {
    title,
    state,
    duration,
    err,
  } = attributes;

  const testData = {
    testName: title,
    status: state,
    duration,
    errorMessage: err?.message || null,
    environment: Cypress.env('ENVIRONMENT') || 'development'
  };

  console.log('Attempting to save test data:', testData);

  try {
    const baseUrl = 'https://everyoneplaysthesamesong.com';
    const reportUrl = `${baseUrl}/api/test-report`;
    console.log('Sending test report to:', reportUrl);
    
    const response = await fetch(reportUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to save test data. Status:', response.status, 'Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Successfully saved test data:', result);
  } catch (error) {
    console.error('Error saving test data:', error);
    throw error; // Re-throw to make Cypress aware of the failure
  }
});
