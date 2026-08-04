"use client";
import React, { useState, useEffect } from 'react';

const MOTIVATION_QUOTES = [
    { text: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing or learning to do.", author: "Pelé" },
    { text: "There are no shortcuts to any place worth going.", author: "Beverly Sills" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
    { text: "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.", author: "Paul J. Meyer" },
    { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" }
];

interface MotivationSectionProps {
    tasks?: any[];
}

const MotivationSection: React.FC<MotivationSectionProps> = ({ tasks = [] }) => {
    const [quote, setQuote] = useState({ text: "", author: "" });
    const [loading, setLoading] = useState(false);

    // Set initial quote on mount from static list
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
        setQuote(MOTIVATION_QUOTES[randomIndex]);
    }, []);

    const fetchAIQuote = async () => {
        setLoading(true);
        try {
            // Build task context string
            const pendingTaskTitles = tasks
                .filter(t => !t.completed)
                .slice(0, 3)
                .map(t => t.title);

            const currentHour = new Date().getHours();
            let timeOfDay = "day";
            if (currentHour < 12) timeOfDay = "morning";
            else if (currentHour < 17) timeOfDay = "afternoon";
            else if (currentHour < 21) timeOfDay = "evening";
            else timeOfDay = "night";

            let promptContext = `Time of day: ${timeOfDay}. `;
            if (pendingTaskTitles.length > 0) {
                promptContext += `The student has these pending study tasks: ${pendingTaskTitles.join(', ')}.`;
            } else {
                promptContext += `The student has completed all their active tasks. Keep them motivated to continue learning.`;
            }

            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: promptContext,
                    type: 'motivation'
                })
            });

            if (!res.ok) throw new Error('API request failed');

            const data = await res.json();
            if (data && data.text) {
                // Safely parse JSON from model response
                const parsed = JSON.parse(data.text);
                if (parsed && parsed.text) {
                    setQuote({
                        text: parsed.text,
                        author: parsed.author || 'AI Study Partner'
                    });
                    setLoading(false);
                    return;
                }
            }
            throw new Error('Invalid response structure');
        } catch (e) {
            console.warn('AI Quote generation failed, falling back to static quote:', e);
            // Fallback to random static quote
            let newQuote = quote;
            while (newQuote.text === quote.text && MOTIVATION_QUOTES.length > 1) {
                const idx = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
                newQuote = MOTIVATION_QUOTES[idx];
            }
            setQuote(newQuote);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="motivation-box">
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin-quote {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spinning-icon {
                    animation: spin-quote 1s linear infinite;
                    display: inline-block;
                }
                .quote-transition {
                    transition: opacity 0.3s ease;
                }
                .quote-loading {
                    opacity: 0.5;
                }
            ` }} />
            <div className="section-header">
                <h2><i className="fas fa-quote-left"></i> Daily Motivation</h2>
                <button 
                    className="btn btn-outline" 
                    onClick={fetchAIQuote} 
                    disabled={loading}
                    title="Get AI Study partner motivation"
                >
                    <i className={`fas fa-sync-alt ${loading ? 'spinning-icon' : ''}`}></i>
                </button>
            </div>
            <div className={`quote-box quote-transition ${loading ? 'quote-loading' : ''}`}>
                <div className="quote-text">
                    "{quote.text || 'Loading motivation...'}"
                </div>
                <div className="quote-author">- {quote.author || 'AI Study Partner'}</div>
            </div>
        </section>
    );
};

export default MotivationSection;
