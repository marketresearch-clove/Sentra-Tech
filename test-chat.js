import fetch from 'node-fetch';

async function testChatEndpoint() {
    try {
        console.log('Testing chat endpoint with OpenRouter...\n');

        const response = await fetch('http://127.0.0.1:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Hello! What are Sentra main products?'
            })
        });

        console.log('Response Status:', response.status);

        const data = await response.json();

        if (data.error) {
            console.error('❌ API Error:', data.error);
            if (data.details) console.error('Details:', data.details);
        } else {
            console.log('✅ Success! Chat endpoint working with OpenRouter\n');
            console.log('Response preview:');
            console.log(data.message.substring(0, 300) + '\n...\n');
        }
    } catch (error) {
        console.error('Test Error:', error.message);
    }
}

testChatEndpoint();
