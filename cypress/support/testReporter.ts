// =================== TEST REPORTER START ===================
console.log('\n\n');
console.log('🔍 =============== TEST REPORTER LOADED ===============');
console.log('Current time:', new Date().toISOString());
console.log('\n\n');

const saveTestResult = async (testData: any) => {
  const baseUrl = 'https://everyoneplaysthesamesong.com';
  const reportUrl = `${baseUrl}/api/test-report`;
  
  console.log('\n\n');
  console.log('📤 =============== SENDING TEST REPORT ===============');
  console.log('URL:', reportUrl);
  console.log('Test data:', JSON.stringify(testData, null, 2));

  try {
    console.log('\n🚀 Making request...');
    const requestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    };
    console.log('Request details:', JSON.stringify(requestInit, null, 2));
    
    const response = await fetch(reportUrl, requestInit);
    console.log('\n📥 Response received:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
    });

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      console.log('\n❌ Request failed!');
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
    }

    try {
      const result = JSON.parse(responseText);
      console.log('\n✅ Success! Response:', JSON.stringify(result, null, 2));
      return result;
    } catch (parseError) {
      console.log('\n⚠️ Warning: Invalid JSON response');
      console.error('Parse error:', parseError);
      return responseText;
    }
  } catch (error) {
    console.log('\n');
    console.log('❌ =============== ERROR SAVING TEST RESULT ===============');
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

Cypress.on('test:after:run', async (attributes) => {
  console.log('\n\n');
  console.log('🏃 =============== TEST FINISHED ===============');
  console.log('Test attributes:', JSON.stringify(attributes, null, 2));
  
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
    environment: Cypress.env('ENVIRONMENT') || 'production',
    timestamp: new Date().toISOString(),
  };

  try {
    console.log('\n📝 Preparing to save test result...');
    const result = await saveTestResult(testData);
    console.log('\n✨ Test result saved successfully!');
    console.log('Final result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('\n');
    console.log('💥 =============== TEST REPORTING FAILED ===============');
    console.error('Error:', error);
  }
  console.log('\n\n');
});
// =================== TEST REPORTER END ===================
