import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

console.log('🔍 Fetching available Gemini models...\n');
console.log('API Key:', API_KEY.substring(0, 10) + '...' + API_KEY.substring(API_KEY.length - 5));

async function listModels() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, response.statusText);
      console.error('Response:', errorText);
      return;
    }

    const data = await response.json();
    
    console.log('\n✅ Available Models:\n');
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (data.models && data.models.length > 0) {
      data.models.forEach((model, index) => {
        console.log(`\n${index + 1}. ${model.name}`);
        console.log(`   Display Name: ${model.displayName || 'N/A'}`);
        console.log(`   Description: ${model.description || 'N/A'}`);
        console.log(`   Version: ${model.version || 'N/A'}`);
        
        if (model.supportedGenerationMethods) {
          console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
        
        // Check if it supports generateContent
        if (model.supportedGenerationMethods?.includes('generateContent')) {
          console.log(`   ✅ Supports generateContent - USE THIS MODEL`);
        }
      });
      
      console.log('\n═══════════════════════════════════════════════════════════════');
      
      // Find models that support generateContent
      const contentModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      if (contentModels.length > 0) {
        console.log('\n💡 RECOMMENDED MODELS FOR CHATBOT:');
        contentModels.forEach(model => {
          // Extract model name without 'models/' prefix
          const modelName = model.name.replace('models/', '');
          console.log(`   - ${modelName}`);
        });
        
        console.log(`\n🎯 Use this in server.js:`);
        console.log(`   const model = genAI.getGenerativeModel({ model: '${contentModels[0].name.replace('models/', '')}' });`);
      }
    } else {
      console.log('No models found or API key may be invalid.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Possible issues:');
    console.error('   1. Invalid API key');
    console.error('   2. API key not enabled for Gemini API');
    console.error('   3. Network connectivity issues');
    console.error('\n📝 To fix:');
    console.error('   1. Go to https://makersuite.google.com/app/apikey');
    console.error('   2. Create a new API key or verify existing one');
    console.error('   3. Make sure Gemini API is enabled in Google Cloud Console');
  }
}

listModels();
