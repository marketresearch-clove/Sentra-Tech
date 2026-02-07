import fetch from 'node-fetch';

const apiKey = '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';

async function testOpenRouter() {
    try {
        console.log('Testing OpenRouter API...');
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'nvidia/nemotron-3-nano-30b-a3b:free',
                messages: [
                    {
                        role: 'user',
                        content: 'How many r are in strawberry?'
                    }
                ]
            })
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.error) {
            console.error('API Error:', data.error);
        } else if (data.choices && data.choices[0]) {
            console.log('\n✅ Success! Response:', data.choices[0].message.content);
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testOpenRouter();
