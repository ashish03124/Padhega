import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/gemini/route';
import { NextRequest } from 'next/server';

// Mock global fetch
global.fetch = vi.fn();

describe('Gemini API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.GEMINI_API_KEY = 'test-api-key';
    });

    it('should return 500 if API key is missing', async () => {
        delete process.env.GEMINI_API_KEY;
        const req = new NextRequest('http://localhost:3000/api/gemini', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'test' }),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.error).toBe('API key not configured');
    });

    it('should successfully generate content', async () => {
        // Mock models list response
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                models: [{ name: 'models/gemini-pro', supportedGenerationMethods: ['generateContent'] }]
            })
        });

        // Mock generate content response
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                candidates: [{ content: { parts: [{ text: 'AI response' }] } }]
            })
        });

        const req = new NextRequest('http://localhost:3000/api/gemini', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'Tell me about React' }),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.text).toBe('AI response');
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle API errors gracefully', async () => {
        // Mock models list response
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                models: [{ name: 'models/gemini-pro', supportedGenerationMethods: ['generateContent'] }]
            })
        });

        // Mock failure
        (fetch as any).mockResolvedValueOnce({
            ok: false,
            status: 400,
            text: async () => JSON.stringify({ error: { message: 'Invalid request' } })
        });

        const req = new NextRequest('http://localhost:3000/api/gemini', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'test' }),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error.error.message).toBe('Invalid request');
    });
});
