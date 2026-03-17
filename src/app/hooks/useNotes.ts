import { useState, useEffect, useRef, useMemo } from 'react';
import { useNoteLogger } from './useActivityLogger';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';

interface UseNotesReturn {
    wordCount: number;
    charCount: number;
    lastSaved: string;
    aiSuggestion: string;
    isGenerating: boolean;
    showAIPanel: boolean;
    aiMode: string;
    notesEditorRef: React.RefObject<HTMLDivElement | null>;
    handleFormatting: (command: string, value?: string) => void;
    updateWordCount: (text: string) => void;
    handleSaveNotes: () => void;
    handleDownloadNotes: (format: string) => void;
    generateAISuggestion: () => Promise<void>;
    enhanceNotesWithAI: () => Promise<void>;
    summarizeNotes: (type: 'bullet' | 'short' | 'detailed') => Promise<void>;
    generateFlashcards: () => Promise<void>;
    generateQuiz: () => Promise<void>;
    checkGrammar: () => Promise<void>;
    extractKeyTerms: () => Promise<void>;
    setAiSuggestion: (suggestion: string) => void;
    setShowAIPanel: (show: boolean) => void;
    toggleAIPanel: () => void;
}

export const useNotes = (): UseNotesReturn => {
    const { user, status } = useAuth();
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [lastSaved, setLastSaved] = useState('Never saved');
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [aiMode, setAiMode] = useState('');
    const [noteId, setNoteId] = useState<string | null>(null);

    const notesEditorRef = useRef<HTMLDivElement>(null);
    const lastSyncedContent = useRef<string>('');

    // Activity logger for tracking note actions
    const { logNoteCreated, logNoteUpdated } = useNoteLogger();
    const hasInitialNotes = useRef(false);

    // Initial fetch on mount/auth
    useEffect(() => {
        const fetchNotes = async () => {
            if (status !== 'authenticated') return;

            try {
                const response = await fetch('/api/notes');
                const data = await response.json();

                if (Array.isArray(data) && data.length > 0) {
                    const latestNote = data[0];
                    setNoteId(latestNote._id);
                    if (notesEditorRef.current) {
                        notesEditorRef.current.innerHTML = latestNote.content;
                        lastSyncedContent.current = latestNote.content;
                        updateWordCount(latestNote.content);
                        hasInitialNotes.current = true;
                        setLastSaved('Last synced at ' + new Date(latestNote.updatedAt).toLocaleTimeString());
                    }
                }
            } catch (err) {
                console.error("Error fetching notes:", err);
            }
        };

        fetchNotes();
    }, [status]);

    // Auto-save every 60 seconds
    useEffect(() => {
        if (status !== 'authenticated') return;

        const autoSaveInterval = setInterval(() => {
            if (notesEditorRef.current && notesEditorRef.current.innerText.trim()) {
                handleSaveNotes();
            }
        }, 60000);

        return () => clearInterval(autoSaveInterval);
    }, [status, noteId]);

    const handleFormatting = (command: string, value?: string) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            // Fallback for commands that don't require a selection (undo/redo)
            if (command === 'undo' || command === 'redo') {
                document.execCommand(command, false, value);
            }
            if (notesEditorRef.current) {
                updateWordCount(notesEditorRef.current.innerText);
            }
            return;
        }

        const range = selection.getRangeAt(0);

        // Map inline formatting commands to HTML tag names
        const inlineTagMap: Record<string, string> = {
            bold: 'strong',
            italic: 'em',
            underline: 'u',
            strikeThrough: 's',
        };

        if (inlineTagMap[command]) {
            // Modern inline formatting via Range API
            const tagName = inlineTagMap[command];
            const selectedContent = range.extractContents();

            // Check if already wrapped — if so, unwrap (toggle behavior)
            const existingWrapper = range.startContainer.parentElement;
            if (
                existingWrapper &&
                existingWrapper.tagName.toLowerCase() === tagName &&
                existingWrapper !== notesEditorRef.current
            ) {
                // Unwrap: replace the wrapper with its children
                const parent = existingWrapper.parentNode;
                if (parent) {
                    while (existingWrapper.firstChild) {
                        parent.insertBefore(existingWrapper.firstChild, existingWrapper);
                    }
                    parent.removeChild(existingWrapper);
                }
            } else {
                // Wrap selection in the formatting element
                const wrapper = document.createElement(tagName);
                wrapper.appendChild(selectedContent);
                range.insertNode(wrapper);

                // Move selection after the inserted node
                selection.removeAllRanges();
                const newRange = document.createRange();
                newRange.selectNodeContents(wrapper);
                newRange.collapse(false);
                selection.addRange(newRange);
            }
        } else if (command === 'formatBlock' && value) {
            // Block formatting via DOM manipulation
            // Extract tag name from value like '<h1>', '<blockquote>'
            const tagMatch = value.match(/^<(\w+)>$/);
            if (tagMatch) {
                const blockTag = tagMatch[1];
                const selectedContent = range.extractContents();
                const blockElement = document.createElement(blockTag);
                blockElement.appendChild(selectedContent);
                range.insertNode(blockElement);

                // Move cursor inside the new block
                selection.removeAllRanges();
                const newRange = document.createRange();
                newRange.selectNodeContents(blockElement);
                newRange.collapse(false);
                selection.addRange(newRange);
            }
        } else {
            // Fallback to execCommand for complex operations:
            // insertUnorderedList, insertOrderedList, justifyLeft/Center/Right, undo, redo
            document.execCommand(command, false, value);
        }

        if (notesEditorRef.current) {
            updateWordCount(notesEditorRef.current.innerText);
        }
    };

    const updateWordCount = (text: string) => {
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
        setCharCount(text.length);
    };

    const handleSaveNotes = async () => {
        if (!notesEditorRef.current || status !== 'authenticated') return;

        const content = notesEditorRef.current.innerHTML;
        if (!content.trim() || content === lastSyncedContent.current) return;

        try {
            const method = noteId ? 'PATCH' : 'POST';
            const response = await fetch('/api/notes', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: noteId,
                    title: 'My Study Notes',
                    content,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setNoteId(data._id);
                setLastSaved(new Date().toLocaleTimeString());
                lastSyncedContent.current = content;

                // Log activity
                if (hasInitialNotes.current) {
                    logNoteUpdated('study_notes');
                } else {
                    logNoteCreated('study_notes');
                    hasInitialNotes.current = true;
                }
            }
        } catch (err) {
            console.error("Error saving notes:", err);
        }
    };

    const handleDownloadNotes = (format: string = 'html') => {
        if (!notesEditorRef.current) return;

        const content = notesEditorRef.current.innerHTML;
        const text = notesEditorRef.current.innerText;

        let blob: Blob;
        let filename: string;

        switch (format) {
            case 'markdown':
                // Simple HTML to Markdown conversion
                const markdown = text;
                blob = new Blob([markdown], { type: 'text/markdown' });
                filename = 'study-notes.md';
                break;
            case 'txt':
                blob = new Blob([text], { type: 'text/plain' });
                filename = 'study-notes.txt';
                break;
            default:
                blob = new Blob([content], { type: 'text/html' });
                filename = 'study-notes.html';
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };



    const callGeminiAPI = async (prompt: string): Promise<string> => {
        try {
            // Call our Next.js API route instead of Gemini directly (fixes CORS)
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            return data.text;
        } catch (error: any) {
            console.error('Gemini API Error:', error);
            throw new Error(`Failed to generate AI response: ${error.message}`);
        }
    };

    const generateAISuggestion = async () => {
        if (!notesEditorRef.current?.innerText.trim()) {
            showToast('Please write some notes first!', 'warning');
            return;
        }

        setIsGenerating(true);
        setAiMode('suggestions');
        try {
            const prompt = `Based on these study notes, provide helpful suggestions, summaries, or improvements:\n\n${notesEditorRef.current.innerText}`;
            const text = await callGeminiAPI(prompt);
            setAiSuggestion(text);
            setShowAIPanel(true);
        } catch (error) {
            console.error('Error generating AI suggestion:', error);
            showToast('Error generating AI suggestion. Please check your API key.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const enhanceNotesWithAI = async () => {
        if (!notesEditorRef.current?.innerText.trim()) {
            showToast('Please write some notes first!', 'warning');
            return;
        }

        setIsGenerating(true);
        try {
            const prompt = `Improve and enhance these study notes by making them more organized, clear, and comprehensive. Format the output in HTML with proper headings, lists, and emphasis:\n\n${notesEditorRef.current.innerText}`;
            const text = await callGeminiAPI(prompt);

            if (notesEditorRef.current) {
                notesEditorRef.current.innerHTML = text.replace(/\n/g, '<br>');
                updateWordCount(notesEditorRef.current.innerText);
            }
        } catch (error) {
            console.error('Error enhancing notes:', error);
            showToast('Error enhancing notes. Please check your API key.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const summarizeNotes = async (type: 'bullet' | 'short' | 'detailed') => {
        if (!notesEditorRef.current?.innerText.trim()) {
            showToast('Please write some notes first!', 'warning');
            return;
        }

        setIsGenerating(true);
        setAiMode('summary');
        try {
            let prompt = '';
            switch (type) {
                case 'bullet':
                    prompt = `Summarize these study notes in 5-7 concise bullet points:\n\n${notesEditorRef.current.innerText}`;
                    break;
                case 'short':
                    prompt = `Provide a brief 2-3 sentence summary of these study notes:\n\n${notesEditorRef.current.innerText}`;
                    break;
                case 'detailed':
                    prompt = `Provide a comprehensive summary of these study notes, including key concepts and important details:\n\n${notesEditorRef.current.innerText}`;
                    break;
            }

            const text = await callGeminiAPI(prompt);
            setAiSuggestion(text);
            setShowAIPanel(true);
        } catch (error) {
            console.error('Error summarizing notes:', error);
            showToast('Error summarizing notes.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const generateFlashcards = async () => {
        if (!notesEditorRef.current?.innerText.trim()) {
            showToast('Please write some notes first!', 'warning');
            return;
        }

        setIsGenerating(true);
        setAiMode('flashcards');
        try {
            const prompt = `Create 8-10 flashcard pairs (Question & Answer) from these study notes. Format each as:\nQ: [question]\nA: [answer]\n\nNotes:\n${notesEditorRef.current.innerText}`;
            const text = await callGeminiAPI(prompt);
            setAiSuggestion(text);
            setShowAIPanel(true);
        } catch (error) {
            console.error('Error generating flashcards:', error);
            showToast('Error generating flashcards.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const generateQuiz = async () => {
        if (!notesEditorRef.current?.innerText.trim()) {
            showToast('Please write some notes first!', 'warning');
            return;
        }

        setIsGenerating(true);
        setAiMode('quiz');
        try {
            const prompt = `Create 5 multiple-choice quiz questions based on these study notes. Format each as:\n\nQ[number]: [question]\nA) [option]\nB) [option]\nC) [option]\nD) [option]\nCorrect: [letter]\n\nNotes:\n${notesEditorRef.current.innerText}`;
            const text = await callGeminiAPI(prompt);
            setAiSuggestion(text);
            setShowAIPanel(true);
        } catch (error) {
            console.error('Error generating quiz:', error);
            showToast('Error generating quiz.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const checkGrammar = async () => {
        if (!notesEditorRef.current?.innerText.trim()) {
            showToast('Please write some notes first!', 'warning');
            return;
        }

        setIsGenerating(true);
        setAiMode('grammar');
        try {
            const prompt = `Check grammar, spelling, and clarity of these notes. Provide corrections and suggestions for improvement:\n\n${notesEditorRef.current.innerText}`;
            const text = await callGeminiAPI(prompt);
            setAiSuggestion(text);
            setShowAIPanel(true);
        } catch (error) {
            console.error('Error checking grammar:', error);
            showToast('Error checking grammar.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const extractKeyTerms = async () => {
        if (!notesEditorRef.current?.innerText.trim()) {
            showToast('Please write some notes first!', 'warning');
            return;
        }

        setIsGenerating(true);
        setAiMode('keyterms');
        try {
            const prompt = `Extract and define the key terms and concepts from these study notes. Format as a glossary:\n\n${notesEditorRef.current.innerText}`;
            const text = await callGeminiAPI(prompt);
            setAiSuggestion(text);
            setShowAIPanel(true);
        } catch (error) {
            console.error('Error extracting key terms:', error);
            showToast('Error extracting key terms.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleAIPanel = () => {
        setShowAIPanel(!showAIPanel);
    };

    return {
        wordCount,
        charCount,
        lastSaved,
        aiSuggestion,
        isGenerating,
        showAIPanel,
        aiMode,
        notesEditorRef,
        handleFormatting,
        updateWordCount,
        handleSaveNotes,
        handleDownloadNotes,
        generateAISuggestion,
        enhanceNotesWithAI,
        summarizeNotes,
        generateFlashcards,
        generateQuiz,
        checkGrammar,
        extractKeyTerms,
        setAiSuggestion,
        setShowAIPanel,
        toggleAIPanel,
    };
};
