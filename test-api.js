import fetch from 'node-fetch';

// Replace with your actual server URL when testing
const API_URL = 'http://localhost:3000/api/schedule-event';

// Create a sample event that will occur 25 hours from now
const eventTime = new Date();
eventTime.setHours(eventTime.getHours() + 25); // 25 hours from now

const eventData = {
  eventName: 'Test Event',
  description: 'This is a test event created by the test script',
  eventTime: eventTime.toISOString()
};

async function testApi() {
  try {
    console.log('Sending request to schedule event...');
    console.log('Event data:', JSON.stringify(eventData, null, 2));
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });
    
    const data = await response.json();
    
    console.log('\nResponse status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\nSuccess! Event scheduled successfully.');
      console.log('A GitHub Actions workflow will run at:', data.scheduledTime);
    } else {
      console.error('\nError scheduling event. Please check the response for details.');
    }
  } catch (error) {
    console.error('Error making API request:', error.message);
    console.error('Make sure your server is running and the API endpoint is accessible.');
  }
}

// Run the test
testApi();

console.log('\nNote: To use this test script, you need to:');
console.log('1. Install node-fetch: npm install node-fetch@2');
console.log('2. Start your server: npm run dev');
console.log('3. Run this script: node test-api.js');