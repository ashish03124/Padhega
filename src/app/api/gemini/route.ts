import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { prompt, type = 'general' } = await request.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        // Construct a more specific system prompt based on type
        let systemInstruction = "";
        let userPrompt = prompt;

        if (type === 'resource') {
            systemInstruction = `You are a world-class minimalist educational curator. Create a CONCISE, ELEGANT, and HIGH-IMPACT study guide for: "${prompt}".

CRITICAL FORMATTING REQUIREMENTS:
- Use '# ' for the Title (Gradient text)
- Use '---' to separate brief sections
- Use '## ' for a maximum of 3 sections
- Use '**Key Concepts:**' for a single high-impact insight (appears in a glass card)
- Use '* ' for short bullet points
- Use '\`\`\`language' for ONLY one essential, clean code example
- Focus on beauty through brevity. Avoid fluff. Long paragraphs are forbidden.

CONTENT STRUCTURE:
# ${prompt}

## Core Essence
[One sentence definition]
---
**Key Concepts:**
* [Most important takeaway]

---
## Fundamental Mechanics
[Brief, clear explanation]

\`\`\`[best_language]
// Single, clean, illustrative example
\`\`\`
---
## Practical Application
[One short paragraph on how to use it]`;
            userPrompt = `Create a short, elegant, minimalist study guide for: ${prompt}`;
        } else if (type === 'quiz') {
            systemInstruction = `You are a quiz generator. Create a 5-question multiple choice quiz for "${prompt}".
             Format as JSON: { "questions": [{ "question": "...", "options": ["..."], "answer": "..." }] }`;
            userPrompt = `Generate a quiz for: ${prompt}`;
        }

        // Get list of available models
        const listModelsUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
        const listResponse = await fetch(listModelsUrl);

        if (!listResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to list models' },
                { status: listResponse.status }
            );
        }

        const modelsData = await listResponse.json();

        // Find a model that supports generateContent
        const availableModel = modelsData.models?.find((model: any) =>
            model.supportedGenerationMethods?.includes('generateContent')
        );

        if (!availableModel) {
            return NextResponse.json(
                { error: 'No models available that support generateContent' },
                { status: 500 }
            );
        }

        console.log('Using model:', availableModel.name);

        // Call Gemini API
        const url = `https://generativelanguage.googleapis.com/v1/${availableModel.name}:generateContent?key=${apiKey}`;

        const finalPrompt = systemInstruction ? `${systemInstruction}\n\nUser Request: ${userPrompt}` : userPrompt;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: finalPrompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            let errorData;
            const text = await response.text();
            try {
                errorData = text ? JSON.parse(text) : { message: 'Unknown error' };
            } catch {
                errorData = { message: text || 'Empty response from API' };
            }
            console.error('Gemini API returned error:', response.status, errorData);
            return NextResponse.json(
                { error: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated.";

        return NextResponse.json({ text });

    } catch (error: unknown) {
        console.error('Session API Error:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}
