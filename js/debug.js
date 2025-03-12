// Debug utilities for Study Tracker
(function() {
    /**
     * Print database contents to console
     * This function prints all localStorage items related to Study Tracker
     */
    function printDatabase() {
        console.log('========== STUDY TRACKER DATABASE CONTENTS ==========');
        
        // Print all users
        try {
            const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
            console.log(`\n📋 REGISTERED USERS (${users.length}):`);
            
            users.forEach((user, index) => {
                console.log(`\n👤 USER ${index + 1}:`);
                console.log(`   Username: ${user.username}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   User ID: ${user.userId}`);
                console.log(`   Registered: ${new Date(user.dateRegistered).toLocaleString()}`);
                console.log(`   Password hash: ${user.hashedPassword}`);
            });
        } catch (error) {
            console.error('Error parsing users:', error);
        }
        
        // Print currently logged in user
        try {
            const currentUser = localStorage.getItem('studyTrackerUser');
            console.log('\n🔐 CURRENTLY LOGGED IN USER:');
            if (currentUser) {
                const userData = JSON.parse(currentUser);
                console.log(`   Username: ${userData.username}`);
                console.log(`   Email: ${userData.email}`);
                console.log(`   User ID: ${userData.userId}`);
            } else {
                console.log('   No user currently logged in');
            }
        } catch (error) {
            console.error('Error parsing current user:', error);
        }
        
        // Print global app data
        try {
            const appData = localStorage.getItem('appData');
            console.log('\n📊 GLOBAL APP DATA:');
            if (appData) {
                const parsedData = JSON.parse(appData);
                console.log(`   Streak: ${parsedData.streak}`);
                console.log(`   Last completed: ${parsedData.lastCompletedDate}`);
                console.log(`   Tasks: ${parsedData.tasks ? parsedData.tasks.length : 0} items`);
                console.log(`   Logs: ${parsedData.logs ? parsedData.logs.length : 0} items`);
            } else {
                console.log('   No global app data found');
            }
        } catch (error) {
            console.error('Error parsing app data:', error);
        }
        
        // Print all user-specific data
        console.log('\n👥 USER-SPECIFIC DATA:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('studyTracker_appData_')) {
                try {
                    const userId = key.replace('studyTracker_appData_', '');
                    const userData = JSON.parse(localStorage.getItem(key));
                    console.log(`\n   USER ID: ${userId}`);
                    console.log(`      Streak: ${userData.streak}`);
                    console.log(`      Last completed: ${userData.lastCompletedDate}`);
                    console.log(`      Tasks: ${userData.tasks ? userData.tasks.length : 0} items`);
                    console.log(`      Logs: ${userData.logs ? userData.logs.length : 0} items`);
                    
                    // Print sample of logs if they exist
                    if (userData.logs && userData.logs.length > 0) {
                        console.log(`      Recent logs (${Math.min(3, userData.logs.length)} of ${userData.logs.length}):`);
                        userData.logs.slice(-3).forEach((log, idx) => {
                            console.log(`         ${idx+1}. Day ${log.day}: ${log.content.substring(0, 30)}${log.content.length > 30 ? '...' : ''}`);
                        });
                    }
                } catch (error) {
                    console.error(`Error parsing data for key ${key}:`, error);
                }
            }
        }
        
        console.log('\n========== END OF DATABASE CONTENTS ==========');
    }
    
    // Export the debug function to window object
    window.studyTrackerDebug = {
        printDatabase
    };
    
    // Add debug panel to the UI when in development mode
    function addDebugPanel() {
        const debugPanel = document.createElement('div');
        debugPanel.className = 'debug-panel';
        debugPanel.innerHTML = `
            <div class="debug-header">Debug Tools</div>
            <div class="debug-buttons">
                <button id="view-database-btn">View Database</button>
                <button id="clear-all-data-btn">Clear All Data</button>
            </div>
        `;
        
        // Style the debug panel
        const style = document.createElement('style');
        style.textContent = `
            .debug-panel {
                position: fixed;
                bottom: 10px;
                right: 10px;
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                z-index: 9999;
            }
            .debug-header {
                font-weight: bold;
                margin-bottom: 8px;
                text-align: center;
            }
            .debug-buttons {
                display: flex;
                gap: 8px;
            }
            .debug-buttons button {
                background-color: #444;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            }
            .debug-buttons button:hover {
                background-color: #666;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(debugPanel);
        
        // Add event listeners
        document.getElementById('view-database-btn').addEventListener('click', () => {
            printDatabase();
            alert('Database printed to console. Press F12 to view it in the Console tab.');
        });
        
        document.getElementById('clear-all-data-btn').addEventListener('click', () => {
            if (confirm('WARNING: This will clear ALL data for ALL users. This cannot be undone. Continue?')) {
                // Clear only study tracker related items
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (key && (key.startsWith('studyTracker') || key === 'appData')) {
                        localStorage.removeItem(key);
                    }
                }
                alert('All data has been cleared. The page will now reload.');
                window.location.reload();
            }
        });
    }
    
    // Initialize debug panel when the document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addDebugPanel);
    } else {
        addDebugPanel();
    }
})(); 