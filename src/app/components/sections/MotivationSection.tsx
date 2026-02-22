"use client";
import React, { useState } from 'react';

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

const MotivationSection: React.FC = () => {
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    const handleRefresh = () => {
        let newIndex = currentQuoteIndex;
        // Make sure we get a different quote
        while (newIndex === currentQuoteIndex && MOTIVATION_QUOTES.length > 1) {
            newIndex = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
        }
        setCurrentQuoteIndex(newIndex);
    };

    const quote = MOTIVATION_QUOTES[currentQuoteIndex];

    return (
        <section className="motivation-box">
            <div className="section-header">
                <h2><i className="fas fa-quote-left"></i> Daily Motivation</h2>
                <button className="btn btn-outline" onClick={handleRefresh} title="Get new motivation">
                    <i className="fas fa-sync-alt"></i>
                </button>
            </div>
            <div className="quote-box">
                <div className="quote-text">
                    "{quote.text}"
                </div>
                <div className="quote-author">- {quote.author}</div>
            </div>
        </section>
    );
};

export default MotivationSection;
