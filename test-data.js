// Test data script for 100-Day Study Streak Tracker
(function() {
    // Sample app data with logs
    const testData = {
        streak: 15,
        tasks: [
            { id: 1, text: "Read chapter 5", completed: false },
            { id: 2, text: "Complete math exercises", completed: true }
        ],
        logs: [
            {
                date: new Date().toISOString(),
                studyLog: "Made good progress on the calculus problems today. Understood the concepts of limits and derivatives.",
                studyHours: 2.5,
                dayPlan: "Complete calculus homework and start reading the next chapter.",
                tasks: [
                    { id: 101, text: "Complete calculus problems", completed: true },
                    { id: 102, text: "Read chapter 3", completed: true }
                ],
                streak: 15,
                isQuickShare: false,
                isDayCompletion: true
            },
            {
                date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                studyLog: "Focused on history today. Prepared notes for the upcoming test.",
                studyHours: 3,
                dayPlan: "Review history notes and make flashcards for dates and events.",
                tasks: [
                    { id: 103, text: "Review history chapter 7", completed: true },
                    { id: 104, text: "Make flashcards", completed: true }
                ],
                streak: 14,
                isQuickShare: false,
                isDayCompletion: true
            },
            {
                date: new Date(Date.now() - 86400000 * 2).toISOString(), // Day before yesterday
                studyLog: "Quick 1-hour session on Spanish vocabulary.",
                studyHours: 1,
                dayPlan: "Practice Spanish vocabulary and grammar.",
                tasks: [
                    { id: 105, text: "Review Spanish vocabulary", completed: true }
                ],
                streak: 13,
                isQuickShare: false,
                isDayCompletion: true
            },
            {
                date: new Date(Date.now() - 86400000 * 3).toISOString(),
                studyLog: "Studied for physics exam, focused on mechanics.",
                studyHours: 4,
                dayPlan: "Prepare for physics test, especially mechanics problems.",
                tasks: [
                    { id: 106, text: "Solve physics practice problems", completed: true },
                    { id: 107, text: "Review formulas", completed: true }
                ],
                streak: 12,
                isQuickShare: false,
                isDayCompletion: true
            },
            {
                date: new Date(Date.now() - 86400000 * 4).toISOString(),
                studyLog: "Just finished a productive study session! Managed to complete the biology chapter.",
                studyHours: 1.5,
                dayPlan: "",
                tasks: [],
                streak: 11,
                isQuickShare: true,
                isDayCompletion: true
            }
        ]
    };

    // Function to load test data
    function loadTestData() {
        try {
            // Save to localStorage
            localStorage.setItem('appData', JSON.stringify(testData));
            console.log('Test data loaded successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error loading test data:', error);
            alert('Error loading test data: ' + error.message);
        }
    }
    
    // Function to reset all data
    function resetAllData() {
        try {
            localStorage.removeItem('appData');
            localStorage.removeItem('theme');
            localStorage.removeItem('currentTab');
            console.log('All app data reset successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error resetting data:', error);
            alert('Error resetting data: ' + error.message);
        }
    }
    
    // Function to show current app data
    function showDebugInfo() {
        try {
            const appData = JSON.parse(localStorage.getItem('appData')) || {};
            const debugInfo = {
                appData: appData,
                theme: localStorage.getItem('theme'),
                currentTab: localStorage.getItem('currentTab'),
                browserInfo: navigator.userAgent
            };
            
            console.log('Debug info:', debugInfo);
            
            // Create modal to show debug info
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
            modal.style.zIndex = '10000';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            
            const debugContent = document.createElement('div');
            debugContent.style.backgroundColor = 'white';
            debugContent.style.padding = '20px';
            debugContent.style.borderRadius = '8px';
            debugContent.style.width = '80%';
            debugContent.style.maxWidth = '600px';
            debugContent.style.maxHeight = '80vh';
            debugContent.style.overflow = 'auto';
            debugContent.style.position = 'relative';
            
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'X';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '10px';
            closeBtn.style.right = '10px';
            closeBtn.style.backgroundColor = '#ff6b6b';
            closeBtn.style.color = 'white';
            closeBtn.style.border = 'none';
            closeBtn.style.borderRadius = '50%';
            closeBtn.style.width = '30px';
            closeBtn.style.height = '30px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => document.body.removeChild(modal);
            
            const pre = document.createElement('pre');
            pre.style.whiteSpace = 'pre-wrap';
            pre.style.wordBreak = 'break-all';
            pre.textContent = JSON.stringify(debugInfo, null, 2);
            
            debugContent.appendChild(closeBtn);
            debugContent.appendChild(pre);
            modal.appendChild(debugContent);
            document.body.appendChild(modal);
            
        } catch (error) {
            console.error('Error showing debug info:', error);
            alert('Error showing debug info: ' + error.message);
        }
    }

    // Create debug tools
    function createDebugButtons() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '10px';
        container.style.left = '10px';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '5px';
        
        const testButton = document.createElement('button');
        testButton.textContent = 'Load Test Data';
        testButton.style.padding = '8px 16px';
        testButton.style.backgroundColor = '#4361ee';
        testButton.style.color = 'white';
        testButton.style.border = 'none';
        testButton.style.borderRadius = '4px';
        testButton.style.cursor = 'pointer';
        testButton.addEventListener('click', loadTestData);
        
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset App Data';
        resetButton.style.padding = '8px 16px';
        resetButton.style.backgroundColor = '#ff6b6b';
        resetButton.style.color = 'white';
        resetButton.style.border = 'none';
        resetButton.style.borderRadius = '4px';
        resetButton.style.cursor = 'pointer';
        resetButton.addEventListener('click', resetAllData);
        
        const debugButton = document.createElement('button');
        debugButton.textContent = 'Show Debug Info';
        debugButton.style.padding = '8px 16px';
        debugButton.style.backgroundColor = '#4cc9f0';
        debugButton.style.color = 'white';
        debugButton.style.border = 'none';
        debugButton.style.borderRadius = '4px';
        debugButton.style.cursor = 'pointer';
        debugButton.addEventListener('click', showDebugInfo);
        
        container.appendChild(testButton);
        container.appendChild(resetButton);
        container.appendChild(debugButton);
        document.body.appendChild(container);
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createDebugButtons);
    } else {
        createDebugButtons();
    }
})();
