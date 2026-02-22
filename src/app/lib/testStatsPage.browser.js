/**
 * Stats Page Diagnostic Script (Browser Console Version)
 * 
 * This is a browser console utility to test and debug the stats page.
 * 
 * Usage:
 * 1. Navigate to /stats page
 * 2. Open browser DevTools (F12)
 * 3. Open Console tab
 * 4. Copy and paste this entire file
 * 5. Press Enter to execute
 * 
 * The script will:
 * - Check localStorage for existing data
 * - Verify DOM elements are present
 * - Check for React errors
 * - Add demo data if needed
 */

// Storage keys matching those used in useStatsData.ts
const STORAGE_KEYS = {
    SESSIONS: 'padhega_study_sessions',
    GOALS: 'padhega_goals',
    LAST_ACTIVE: 'padhega_last_active',
};

console.log('=== STATS PAGE DIAGNOSTIC ===\n');

// 1. Check localStorage
console.log('1. Checking localStorage...');

let sessions = [];
let goals = [];

try {
    const sessionsData = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (sessionsData) {
        sessions = JSON.parse(sessionsData);
        console.log('✅ Sessions found:', sessions.length, 'sessions');
        console.log(sessions);
    } else {
        console.log('❌ No sessions in localStorage');
    }
} catch (error) {
    console.error('❌ Error parsing sessions:', error);
}

try {
    const goalsData = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (goalsData) {
        goals = JSON.parse(goalsData);
        console.log('✅ Goals found:', goals.length, 'goals');
        console.log(goals);
    } else {
        console.log('❌ No goals in localStorage');
    }
} catch (error) {
    console.error('❌ Error parsing goals:', error);
}

// 2. Check if stats page exists in DOM
console.log('\n2. Checking DOM elements...');
const statsPage = document.querySelector('.stats-page');
const statsContainer = document.querySelector('.stats-container');
const quickStats = document.querySelector('.quick-stats');
const statsGrid = document.querySelector('.stats-grid');

console.log('Stats page div:', statsPage ? '✅ Found' : '❌ Not found');
console.log('Stats container:', statsContainer ? '✅ Found' : '❌ Not found');
console.log('Quick stats:', quickStats ? '✅ Found' : '❌ Not found');
console.log('Stats grid:', statsGrid ? '✅ Found' : '❌ Not found');

// 3. Check for React errors
console.log('\n3. Checking for errors...');
const errors = document.querySelectorAll('[class*="error"]');
if (errors.length > 0) {
    console.log('⚠️  Found error elements:', errors.length);
    errors.forEach(err => console.log(err));
} else {
    console.log('✅ No error elements found');
}

// 4. Add demo data if missing
console.log('\n4. Demo Data Setup');
if (sessions.length === 0) {
    console.log('Adding demo sessions...');
    const now = Date.now();
    const today = new Date();
    const yesterday = new Date(now - 86400000);
    const twoDaysAgo = new Date(now - 172800000);

    const demoSessions = [
        {
            id: `session_${now}_1`,
            subject: 'Mathematics',
            type: 'study',
            duration: 45,
            date: today.toISOString(),
            timestamp: now
        },
        {
            id: `session_${now}_2`,
            subject: 'Science',
            type: 'study',
            duration: 30,
            date: today.toISOString(),
            timestamp: now - 3600000
        },
        {
            id: `session_${now}_3`,
            subject: 'English',
            type: 'review',
            duration: 25,
            date: yesterday.toISOString(),
            timestamp: now - 86400000
        },
        {
            id: `session_${now}_4`,
            subject: 'Mathematics',
            type: 'study',
            duration: 50,
            date: yesterday.toISOString(),
            timestamp: now - 90000000
        },
        {
            id: `session_${now}_5`,
            subject: 'History',
            type: 'study',
            duration: 40,
            date: twoDaysAgo.toISOString(),
            timestamp: now - 172800000
        }
    ];

    try {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(demoSessions));
        console.log('✅ Added', demoSessions.length, 'demo sessions');
    } catch (error) {
        console.error('❌ Error saving demo sessions:', error);
    }
} else {
    console.log('✅ Sessions already exist, skipping demo data');
}

if (goals.length === 0) {
    console.log('Adding demo goals...');
    const demoGoals = [
        {
            id: `goal_${Date.now()}_1`,
            name: 'Daily Study Goal',
            targetValue: 4,
            unit: 'hours',
            timeFrame: 'daily',
            createdAt: Date.now(),
            currentValue: 0
        },
        {
            id: `goal_${Date.now()}_2`,
            name: 'Weekly Target',
            targetValue: 25,
            unit: 'hours',
            timeFrame: 'weekly',
            createdAt: Date.now(),
            currentValue: 0
        }
    ];

    try {
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(demoGoals));
        console.log('✅ Added', demoGoals.length, 'demo goals');
    } catch (error) {
        console.error('❌ Error saving demo goals:', error);
    }
} else {
    console.log('✅ Goals already exist, skipping demo data');
}

// 5. Manual reload prompt (instead of auto-reload)
console.log('\n5. Next Steps');
if (sessions.length === 0 || goals.length === 0) {
    console.log('⚡ Demo data has been added!');
    console.log('💡 To see the changes, manually reload the page (Ctrl+R or Cmd+R)');
    console.log('   Or run: location.reload()');
} else {
    console.log('✅ All data is present. Page is ready!');
}

console.log('\n=== DIAGNOSTIC COMPLETE ===');
