// Test email sending functionality
const testEmail = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        message: 'This is a test message to verify email functionality with port 587.'
      })
    });

    const data = await response.json();
    
    console.log('\n📧 Email Test Result:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (data.success) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testEmail();
