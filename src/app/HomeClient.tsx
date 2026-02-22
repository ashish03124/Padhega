"use client";
import React from 'react';
import './components/sections/notes-styles.css';

// Custom Hooks
import { useTimer } from './hooks/useTimer';
import { useMusicPlayer } from './hooks/useMusicPlayer';
import { useNotes } from './hooks/useNotes';
import { useTasks } from './hooks/useTasks';
import TimerSection from './components/sections/TimerSection';
import MusicSection from './components/sections/MusicSection';
import NotesSection from './components/sections/NotesSection';
import TasksSection from './components/sections/TasksSection';
import MotivationSection from './components/sections/MotivationSection';

const HomeClient: React.FC = () => {
    // Initialize custom hooks
    const timer = useTimer();
    const music = useMusicPlayer();
    const notes = useNotes();
    const tasks = useTasks();

    return (
        <>
            <div id="particles-js"></div>
            <div id="cursor"></div>

            <main className="bento-grid">
                {/* Row 1: Timer + Music (50/50) */}
                <div className="bento-item">
                    <TimerSection {...timer} />
                </div>
                <div className="bento-item">
                    <MusicSection {...music} />
                </div>

                {/* Row 2: Notes (Full Width) */}
                <div className="bento-item bento-row-full">
                    <NotesSection {...notes} />
                </div>

                {/* Row 3: Tasks + Motivation (50/50) */}
                <div className="bento-item">
                    <TasksSection {...tasks} />
                </div>
                <div className="bento-item">
                    <MotivationSection />
                </div>
            </main>
        </>
    );
};

export default HomeClient;
