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
    title,
    state,
    duration,
    err,
    environment: Cypress.env('ENVIRONMENT') || 'development'
  };

  console.log('Attempting to save test data:', testData);

  try {
    const baseUrl = Cypress.config('baseUrl') || '';
    console.log('Using base URL:', baseUrl);
    
    const response = await fetch(`${baseUrl}/api/test-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData),
      // Add these options to handle Next.js API routes properly
      credentials: 'same-origin',
      mode: 'cors'
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
    }

    const result = JSON.parse(responseText);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save test result');
    }
    
    console.log('Successfully saved test result:', result.data);
  } catch (error) {
    console.error('Failed to save test results. Error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
});
