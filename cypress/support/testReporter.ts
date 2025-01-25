console.log('Test reporter loaded!');

const saveTestResult = async (testData: any) => {
  const baseUrl = 'https://everyoneplaysthesamesong.com';
  const reportUrl = `${baseUrl}/api/test-report`;
  
  console.log('Preparing to send test report to:', reportUrl);
  console.log('Test data:', JSON.stringify(testData, null, 2));

  try {
    console.log('Initiating fetch request...');
    const response = await fetch(reportUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
    }

    try {
      const result = JSON.parse(responseText);
      console.log('Parsed response:', result);
      return result;
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      return responseText;
    }
  } catch (error) {
    console.error('Network or processing error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
};

Cypress.on('test:after:run', async (attributes) => {
  console.log('Test:after:run event fired!', { attributes });
  
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
    environment: Cypress.env('ENVIRONMENT') || 'production'
  };

  try {
    console.log('Attempting to save test result...');
    const result = await saveTestResult(testData);
    console.log('Test result saved successfully:', result);
  } catch (error) {
    console.error('Failed to save test result:', error);
    // Don't throw here - we don't want to fail the test if reporting fails
    // But we do want to make it very visible in the logs
    console.error('❌ TEST REPORTING FAILED ❌');
  }
});
