// Demo data seeder for stats page - run this in browser console to add sample data
// This creates sample study sessions for testing

const addDemoSessions = () => {
    const demoSessions = [
        {
            date: new Date().toISOString(),
            duration: 45,
            subject: "Mathematics",
            type: "focus",
            timestamp: Date.now(),
        },
        {
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            duration: 30,
            subject: "Science",
            type: "study",
            timestamp: Date.now() - 24 * 60 * 60 * 1000,
        },
        {
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 60,
            subject: "Programming",
            type: "focus",
            timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        },
        {
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 25,
            subject: "Mathematics",
            type: "focus",
            timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        },
        {
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 50,
            subject: "English",
            type: "study",
            timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
        },
        {
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 40,
            subject: "Science",
            type: "focus",
            timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        },
        {
            date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 35,
            subject: "Programming",
            type: "study",
            timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
        },
    ];

    // Add sessions with IDs
    const sessionsWithIds = demoSessions.map((session, index) => ({
        ...session,
        id: `demo_session_${Date.now()}_${index}`,
    }));

    // Store in localStorage
    localStorage.setItem('padhega_study_sessions', JSON.stringify(sessionsWithIds));

    console.log('Demo sessions added! Refresh the page to see them.');
    console.log(`Added ${sessionsWithIds.length} sessions`);
};

// Run it
addDemoSessions();
