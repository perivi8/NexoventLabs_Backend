import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

console.log('🔍 Testing Gemini API Models...\n');

// List of models to test
const modelsToTest = [
  'gemini-pro',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'models/gemini-pro',
  'models/gemini-1.5-flash',
  'models/gemini-1.5-pro'
];

async function testModel(modelName) {
  try {
    console.log(`\n📝 Testing model: ${modelName}`);
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent('Say "Hello" if you can hear me.');
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ SUCCESS - ${modelName}`);
    console.log(`   Response: ${text.substring(0, 50)}...`);
    return true;
  } catch (error) {
    console.log(`❌ FAILED - ${modelName}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  const results = [];
  
  for (const modelName of modelsToTest) {
    const success = await testModel(modelName);
    results.push({ model: modelName, success });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n\n📊 SUMMARY:');
  console.log('═══════════════════════════════════════');
  
  const workingModels = results.filter(r => r.success);
  const failedModels = results.filter(r => !r.success);
  
  if (workingModels.length > 0) {
    console.log('\n✅ Working Models:');
    workingModels.forEach(r => console.log(`   - ${r.model}`));
  }
  
  if (failedModels.length > 0) {
    console.log('\n❌ Failed Models:');
    failedModels.forEach(r => console.log(`   - ${r.model}`));
  }
  
  console.log('\n═══════════════════════════════════════');
  
  if (workingModels.length > 0) {
    console.log(`\n💡 Recommended: Use "${workingModels[0].model}" in your server.js`);
  } else {
    console.log('\n⚠️  No working models found. Please check your API key.');
  }
}

main().catch(console.error);
