// Comprehensive email test
const runTests = async () => {
  console.log('\n🧪 Starting Email Service Tests...\n');
  
  // Test 1: Health Check
  console.log('1️⃣ Testing Health Endpoint...');
  try {
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log('   ✅ Health Check:', healthData.emailService);
    console.log('   📊 Status:', JSON.stringify(healthData, null, 2));
  } catch (error) {
    console.log('   ❌ Health check failed:', error.message);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Test 2: Email Test Endpoint
  console.log('2️⃣ Testing Email Configuration...');
  try {
    const testResponse = await fetch('http://localhost:3001/api/test-email');
    const testData = await testResponse.json();
    console.log('   ✅ Email Config:', testData.success ? 'Valid' : 'Invalid');
    console.log('   📊 Details:', JSON.stringify(testData, null, 2));
  } catch (error) {
    console.log('   ❌ Email config test failed:', error.message);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Test 3: Send Actual Email
  console.log('3️⃣ Sending Test Email...');
  try {
    const emailResponse = await fetch('http://localhost:3001/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        message: 'This is a test email sent with port 587 configuration. Testing Brevo SMTP integration.'
      })
    });
    
    const emailData = await emailResponse.json();
    console.log('   Status Code:', emailResponse.status);
    console.log('   Response:', JSON.stringify(emailData, null, 2));
    
    if (emailData.success) {
      console.log('   ✅ Email sent successfully!');
      console.log('   📧 Check your inbox at nexoventlabs@gmail.com');
    } else {
      console.log('   ❌ Email failed:', emailData.message);
    }
  } catch (error) {
    console.log('   ❌ Email send failed:', error.message);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏁 Tests Complete!\n');
};

runTests();
