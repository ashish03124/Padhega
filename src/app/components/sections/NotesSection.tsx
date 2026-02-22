import React, { useState } from 'react';

interface NotesSectionProps {
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

const NotesSection: React.FC<NotesSectionProps> = ({
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
    summarizeNotes,
    generateFlashcards,
    generateQuiz,
    checkGrammar,
    extractKeyTerms,
    enhanceNotesWithAI,
    setShowAIPanel,
    toggleAIPanel,
}) => {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showAIMenu, setShowAIMenu] = useState(false);

    // Close dropdowns when clicking outside
    React.useEffect(() => {
        const handleClick = () => {
            setShowExportMenu(false);
            setShowAIMenu(false);
        };

        if (showExportMenu || showAIMenu) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [showExportMenu, showAIMenu]);

    const getModeTitle = () => {
        switch (aiMode) {
            case 'summary': return '📝 Summary';
            case 'flashcards': return '🎴 Flashcards';
            case 'quiz': return '❓ Quiz';
            case 'grammar': return '✍️ Grammar Check';
            case 'keyterms': return '🔑 Key Terms';
            default: return '🤖 AI Assistant';
        }
    };

    return (
        <section className="notes-box">
            <div className="section-header">
                <h2><i className="fas fa-edit"></i> Smart Notes</h2>
                <div className="note-actions">
                    {/* AI Assistant Button */}
                    <div className="dropdown-container">
                        <button
                            className="btn btn-icon ai-trigger"
                            onClick={() => setShowAIMenu(!showAIMenu)}
                            title="AI Tools"
                        >
                            <i className="fas fa-robot"></i>
                            <span>AI</span>
                        </button>
                        {showAIMenu && (
                            <div className="ai-dropdown">
                                <button onClick={() => { summarizeNotes('bullet'); setShowAIMenu(false); }}>
                                    <i className="fas fa-list"></i> Summarize (Bullets)
                                </button>
                                <button onClick={() => { summarizeNotes('short'); setShowAIMenu(false); }}>
                                    <i className="fas fa-compress"></i> Quick Summary
                                </button>
                                <button onClick={() => { generateFlashcards(); setShowAIMenu(false); }}>
                                    <i className="fas fa-id-card"></i> Generate Flashcards
                                </button>
                                <button onClick={() => { generateQuiz(); setShowAIMenu(false); }}>
                                    <i className="fas fa-question-circle"></i> Generate Quiz
                                </button>
                                <button onClick={() => { checkGrammar(); setShowAIMenu(false); }}>
                                    <i className="fas fa-spell-check"></i> Check Grammar
                                </button>
                                <button onClick={() => { extractKeyTerms(); setShowAIMenu(false); }}>
                                    <i className="fas fa-key"></i> Extract Key Terms
                                </button>
                                <button onClick={() => { enhanceNotesWithAI(); setShowAIMenu(false); }}>
                                    <i className="fas fa-magic"></i> Enhance Notes
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <button className="btn btn-primary" onClick={handleSaveNotes}>
                        <i className="fas fa-save"></i> Save
                    </button>

                    {/* Export Menu */}
                    <div className="dropdown-container">
                        <button
                            className="btn btn-icon"
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            title="Export"
                        >
                            <i className="fas fa-download"></i>
                        </button>
                        {showExportMenu && (
                            <div className="export-dropdown">
                                <button onClick={() => { handleDownloadNotes('html'); setShowExportMenu(false); }}>
                                    <i className="fas fa-code"></i> HTML
                                </button>
                                <button onClick={() => { handleDownloadNotes('markdown'); setShowExportMenu(false); }}>
                                    <i className="fab fa-markdown"></i> Markdown
                                </button>
                                <button onClick={() => { handleDownloadNotes('txt'); setShowExportMenu(false); }}>
                                    <i className="fas fa-file-alt"></i> Text
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="editor-container">
                {/* Enhanced Toolbar */}
                <div className="toolbar">
                    <div className="toolbar-group">
                        <button onClick={() => handleFormatting('bold')} title="Bold">
                            <i className="fas fa-bold"></i>
                        </button>
                        <button onClick={() => handleFormatting('italic')} title="Italic">
                            <i className="fas fa-italic"></i>
                        </button>
                        <button onClick={() => handleFormatting('underline')} title="Underline">
                            <i className="fas fa-underline"></i>
                        </button>
                        <button onClick={() => handleFormatting('strikeThrough')} title="Strikethrough">
                            <i className="fas fa-strikethrough"></i>
                        </button>
                    </div>

                    <div className="toolbar-divider"></div>

                    <div className="toolbar-group">
                        <button onClick={() => handleFormatting('formatBlock', '<h1>')} title="Heading 1">
                            H1
                        </button>
                        <button onClick={() => handleFormatting('formatBlock', '<h2>')} title="Heading 2">
                            H2
                        </button>
                        <button onClick={() => handleFormatting('formatBlock', '<h3>')} title="Heading 3">
                            H3
                        </button>
                    </div>

                    <div className="toolbar-divider"></div>

                    <div className="toolbar-group">
                        <button onClick={() => handleFormatting('insertUnorderedList')} title="Bullet List">
                            <i className="fas fa-list-ul"></i>
                        </button>
                        <button onClick={() => handleFormatting('insertOrderedList')} title="Numbered List">
                            <i className="fas fa-list-ol"></i>
                        </button>
                        <button onClick={() => handleFormatting('formatBlock', '<blockquote>')} title="Quote">
                            <i className="fas fa-quote-right"></i>
                        </button>
                    </div>

                    <div className="toolbar-divider"></div>

                    <div className="toolbar-group">
                        <button onClick={() => handleFormatting('justifyLeft')} title="Align Left">
                            <i className="fas fa-align-left"></i>
                        </button>
                        <button onClick={() => handleFormatting('justifyCenter')} title="Align Center">
                            <i className="fas fa-align-center"></i>
                        </button>
                        <button onClick={() => handleFormatting('justifyRight')} title="Align Right">
                            <i className="fas fa-align-right"></i>
                        </button>
                    </div>

                    <div className="toolbar-divider"></div>

                    <div className="toolbar-group">
                        <button onClick={() => handleFormatting('undo')} title="Undo">
                            <i className="fas fa-undo"></i>
                        </button>
                        <button onClick={() => handleFormatting('redo')} title="Redo">
                            <i className="fas fa-redo"></i>
                        </button>
                    </div>
                </div>

                {/* Editor */}
                <div
                    className="notes-content"
                    ref={notesEditorRef}
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={(e) => updateWordCount(e.currentTarget.innerText)}
                    data-placeholder="Start typing your notes here... Use the AI tools to enhance, summarize, and more!"
                ></div>
            </div>

            {/* Loading Indicator */}
            {isGenerating && (
                <div className="ai-loading">
                    <div className="loading-spinner"></div>
                    <span>AI is thinking...</span>
                </div>
            )}

            {/* Floating AI Panel */}
            {showAIPanel && aiSuggestion && (
                <div className="ai-floating-panel">
                    <div className="ai-panel-header">
                        <h4>{getModeTitle()}</h4>
                        <button className="close-panel" onClick={() => setShowAIPanel(false)}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="ai-panel-content">
                        {aiSuggestion}
                    </div>
                    <div className="ai-panel-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => setShowAIPanel(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Footer Stats */}
            <div className="notes-footer">
                <div className="document-stats">
                    <span><i className="fas fa-file-word"></i> {wordCount} words</span>
                    <span><i className="fas fa-font"></i> {charCount} chars</span>
                    <span><i className="fas fa-clock"></i> {lastSaved}</span>
                    <span className="auto-save-indicator">
                        <i className="fas fa-check-circle"></i> Auto-save enabled
                    </span>
                </div>
            </div>
        </section>
    );
};

export default NotesSection;
