import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

console.log('🤖 Testing Chatbot with gemini-2.0-flash...\n');

async function testChatbot() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const websiteKnowledge = `
You are a helpful AI assistant for NexoventLabs, an AI solutions company.

## COMPANY INFORMATION
Company Name: NexoventLabs
Email: nexoventlabs@gmail.com
Phone: +91 8106811285

## INSTRUCTIONS
- Be friendly and helpful
- Provide accurate information
- Keep responses concise
`;

    const prompt = websiteKnowledge + '\n\nUser Question: Hello, what services do you offer?\n\nPlease provide a helpful response.';
    
    console.log('📤 Sending test message...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ SUCCESS!\n');
    console.log('📥 Response:');
    console.log('═══════════════════════════════════════');
    console.log(text);
    console.log('═══════════════════════════════════════');
    console.log('\n✨ Chatbot is working correctly!');
    console.log('💡 You can now start your server with: npm start');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  }
}

testChatbot();
