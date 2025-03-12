// Global app state
const appState = {
    isAuthenticated: false,
    adminPassword: 'admin123', // In a real app, this would be handled more securely
    streak: 0,
    lastCompletedDate: null,
    tasks: [],
    logs: []
};

// DOM Elements
const elements = {
    // Theme toggle
    themeToggle: document.getElementById('theme-toggle-btn'),
    
    // Streak counter
    streakCounter: document.getElementById('streak-counter'),
    
    // Tabs
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    
    // Today's section
    currentDate: document.getElementById('current-date'),
    newTaskInput: document.getElementById('new-task'),
    addTaskBtn: document.getElementById('add-task-btn'),
    taskList: document.getElementById('task-list'),
    dayPlanInput: document.getElementById('day-plan-input'),
    saveDayBtn: document.getElementById('save-day-btn'),
    
    // Feed section
    studyFeed: document.getElementById('study-feed'),
    quickShareInput: document.getElementById('quick-share-input'),
    quickShareBtn: document.getElementById('quick-share-btn'),
    charCount: document.querySelector('.char-count'),
    isDayCompletionCheck: document.getElementById('is-day-completion-check'),
    
    // Statistics section
    totalDays: document.getElementById('total-days'),
    totalHours: document.getElementById('total-hours'),
    completedTasks: document.getElementById('completed-tasks'),
    avgHours: document.getElementById('avg-hours'),
    studyChart: document.getElementById('study-chart'),
    
    // Admin/Settings
    adminBtn: document.getElementById('admin-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    loginModal: document.getElementById('login-modal'),
    settingsModal: document.getElementById('settings-modal'),
    adminPassword: document.getElementById('admin-password'),
    loginBtn: document.getElementById('login-btn'),
    loginError: document.getElementById('login-error'),
    manualStreak: document.getElementById('manual-streak'),
    downloadFormat: document.getElementById('download-format'),
    exportDataBtn: document.getElementById('export-data-btn'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    
    // Modal close buttons
    closeModalBtns: document.querySelectorAll('.close-modal')
};

// Initialize the application
function initApp() {
    console.log('Initializing app...');
    loadData();
    setupEventListeners();
    updateUI();
    
    // Switch to the default tab
    const defaultTab = localStorage.getItem('currentTab') || 'today';
    switchTab(defaultTab);
    
    // Add entrance animations
    document.querySelectorAll('.streak-card, .today-card, .tab-pane').forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });
}

// Add event listener for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Load data from localStorage
function loadData() {
    try {
        // Load app state from localStorage
        const savedData = localStorage.getItem('appData');
        
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Ensure we have all required properties with proper defaults
            appState.streak = parsedData.streak || 0;
            appState.lastCompletedDate = parsedData.lastCompletedDate || null;
            appState.tasks = Array.isArray(parsedData.tasks) ? parsedData.tasks : [];
            appState.logs = Array.isArray(parsedData.logs) ? parsedData.logs : [];
            console.log('Loaded app data:', appState);
        } else {
            // Initialize with default state
            appState.streak = 0;
            appState.lastCompletedDate = null;
            appState.tasks = [];
            appState.logs = [];
            saveData();
            console.log('Initialized default app data');
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        // Reset to default state if there's an error
        appState.streak = 0;
        appState.lastCompletedDate = null;
        appState.tasks = [];
        appState.logs = [];
        saveData();
    }
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    }
}

// Save data to localStorage
function saveData() {
    try {
        localStorage.setItem('appData', JSON.stringify(appState));
        console.log('Saved app data:', appState);
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Tab switching
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Task management
    elements.addTaskBtn.addEventListener('click', addTask);
    elements.newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    // Quick share
    elements.quickShareInput.addEventListener('input', updateCharCount);
    elements.quickShareBtn.addEventListener('click', quickShare);
    
    // Save day entry
    elements.saveDayBtn.addEventListener('click', completeDay);
    
    // Admin/Settings
    elements.adminBtn.addEventListener('click', () => openModal(elements.loginModal));
    elements.settingsBtn.addEventListener('click', () => {
        if (appState.isAuthenticated) {
            openModal(elements.settingsModal);
            elements.manualStreak.value = appState.streak;
        } else {
            openModal(elements.loginModal);
        }
    });
    
    // Login
    elements.loginBtn.addEventListener('click', login);
    elements.adminPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') login();
    });
    
    // Settings
    elements.saveSettingsBtn.addEventListener('click', saveSettings);
    elements.exportDataBtn.addEventListener('click', exportData);
    
    // Close modals
    elements.closeModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
}

// Update UI elements
function updateUI() {
    try {
        console.log('Updating UI...');
        
        // Update date display
        updateDateDisplay();
        
        // Update streak counter
        if (elements.streakCounter) {
            elements.streakCounter.textContent = appState.streak || 0;
        } else {
            console.error('Streak counter element not found');
        }
        
        // Update task list
        renderTasks();
        
        // Update feed
        renderFeed();
        
        // Update statistics
        updateStatistics();
        
        // Check streak status
        checkStreakStatus();
        
        // Update progress bar
        const streakPercentage = Math.min(Math.round(((appState.streak || 0) / 100) * 100), 100);
        const streakPercentageEl = document.getElementById('streak-percentage');
        const streakProgressFill = document.getElementById('streak-progress-fill');
        
        if (streakPercentageEl) {
            streakPercentageEl.textContent = streakPercentage;
        }
        
        if (streakProgressFill) {
            streakProgressFill.style.width = `${streakPercentage}%`;
        }
        
        // Update 100-day challenge progress
        const challengeProgressDays = document.getElementById('challenge-progress-days');
        const challengeProgressFill = document.getElementById('challenge-progress-fill');
        
        if (challengeProgressDays) {
            challengeProgressDays.textContent = appState.streak || 0;
        }
        
        if (challengeProgressFill) {
            challengeProgressFill.style.width = `${streakPercentage}%`;
        }
        
        // Update week completion rate
        updateWeekCompletion();
        
        // Update activity heatmap
        renderActivityHeatmap();
        
        console.log('UI updated successfully');
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

// Update the current date display
function updateDateDisplay() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elements.currentDate.textContent = now.toLocaleDateString('en-US', options);
}

// Switch between tabs
function switchTab(tabId) {
    // Remove active class from all tabs and content
    elements.tabButtons.forEach(tab => {
        tab.classList.remove('active');
    });
    
    elements.tabPanes.forEach(pane => {
        pane.classList.remove('active');
        pane.style.display = 'none';
    });
    
    // Add active class to selected tab and content
    elements.tabButtons.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        }
    });
    
    const activePane = document.getElementById(`${tabId}-tab`);
    
    // Use fade in animation
    activePane.style.opacity = '0';
    activePane.style.transform = 'translateY(10px)';
    activePane.style.display = 'block';
    
    setTimeout(() => {
        activePane.classList.add('active');
        activePane.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        activePane.style.opacity = '1';
        activePane.style.transform = 'translateY(0)';
    }, 50);
    
    // Update localStorage with current tab
    localStorage.setItem('currentTab', tabId);
}

// Toggle between light and dark theme
function toggleTheme() {
    if (document.body.classList.contains('light-mode')) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    }
}

// Add a new task to the list
function addTask() {
    try {
        const taskInput = document.getElementById('new-task');
        const taskText = taskInput.value.trim();
        
        if (taskText) {
            const newTask = {
                id: Date.now().toString(),
                text: taskText,
                completed: false
            };
            
            // Ensure tasks array exists
            if (!appState.tasks) {
                appState.tasks = [];
            }
            
            appState.tasks.push(newTask);
            saveData();
            
            taskInput.value = '';
            
            // Add animation for new task
            renderTasks();
            const taskList = document.getElementById('task-list');
            const newTaskElement = taskList.lastElementChild;
            
            if (newTaskElement) {
                newTaskElement.style.opacity = '0';
                newTaskElement.style.transform = 'translateX(-20px)';
                newTaskElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                setTimeout(() => {
                    newTaskElement.style.opacity = '1';
                    newTaskElement.style.transform = 'translateX(0)';
                }, 50);
            }
        }
    } catch (error) {
        console.error('Error adding task:', error);
    }
}

// Render tasks in the task list
function renderTasks() {
    try {
        const taskList = document.getElementById('task-list');
        
        if (!taskList) {
            console.error('Task list element not found');
            return;
        }
        
        // Ensure tasks array exists and is valid
        if (!appState.tasks || !Array.isArray(appState.tasks)) {
            appState.tasks = [];
            saveData();
        }
        
        taskList.innerHTML = '';
        
        appState.tasks.forEach(task => {
            if (task && typeof task === 'object') {
                const li = document.createElement('li');
                li.className = 'task-item';
                li.innerHTML = `
                    <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                    <span class="task-text ${task.completed ? 'completed' : ''}">${task.text || 'Unnamed Task'}</span>
                    <button class="task-delete" data-id="${task.id}"><i class="fas fa-times"></i></button>
                `;
                
                taskList.appendChild(li);
            }
        });
        
        // Add event listeners
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const taskText = this.nextElementSibling;
                taskText.classList.toggle('completed');
                toggleTaskCompletion(this.dataset.id);
                
                // Add animation
                taskText.style.transition = 'opacity 0.3s, color 0.3s, text-decoration 0.3s';
                taskText.style.opacity = '0.5';
                setTimeout(() => {
                    taskText.style.opacity = '1';
                }, 300);
            });
        });
        
        document.querySelectorAll('.task-delete').forEach(button => {
            button.addEventListener('click', function() {
                const taskItem = this.parentElement;
                
                // Add delete animation
                taskItem.style.transition = 'opacity 0.3s, transform 0.3s';
                taskItem.style.transform = 'translateX(20px)';
                taskItem.style.opacity = '0';
                
                setTimeout(() => {
                    deleteTask(this.dataset.id);
                }, 300);
            });
        });
    } catch (error) {
        console.error('Error rendering tasks:', error);
    }
}

// Toggle task completion status
function toggleTaskCompletion(taskId) {
    const taskIndex = appState.tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        appState.tasks[taskIndex].completed = !appState.tasks[taskIndex].completed;
        renderTasks();
    }
}

// Delete a task
function deleteTask(taskId) {
    appState.tasks = appState.tasks.filter(task => task.id !== taskId);
    renderTasks();
}

// Update character count for quick share
function updateCharCount() {
    const text = elements.quickShareInput.value;
    const charCount = text.length;
    elements.charCount.textContent = `${charCount} characters`;
    
    // Remove the character limit validation
    elements.charCount.style.color = 'var(--secondary-color)';
}

// Quick share a study update
function quickShare() {
    const shareInput = document.getElementById('quick-share-input');
    const content = shareInput.value.trim();
    const isDayCompletion = document.getElementById('is-day-completion-check').checked;
    const hoursStudied = parseFloat(document.getElementById('hours-studied-input').value) || 0;
    
    if (content) {
        // Create a new quick log entry
        const now = new Date();
        
        // Check if this is a new day completion
        if (isDayCompletion) {
            // Increase streak
            appState.streak++;
            checkStreakStatus();
        }
        
        // Add log entry
        appState.logs.unshift({
            date: now.toISOString(),
            studyLog: content,
            studyHours: hoursStudied,
            dayPlan: '',
            tasks: [],
            streak: appState.streak,
            isQuickShare: true,
            isDayCompletion: isDayCompletion
        });
        
        // Clear form
        shareInput.value = '';
        document.getElementById('hours-studied-input').value = '';
        updateCharCount();
        document.getElementById('is-day-completion-check').checked = false;
        
        // Save data and update UI
        saveData();
        renderFeed();
        
        // Show success feedback
        const shareButton = document.getElementById('quick-share-btn');
        const originalText = shareButton.textContent;
        
        shareButton.disabled = true;
        shareButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sharing...';
        
        setTimeout(() => {
            shareButton.innerHTML = '<i class="fas fa-check"></i> Shared!';
            shareButton.style.backgroundColor = 'var(--success-color)';
            
            setTimeout(() => {
                shareButton.textContent = originalText;
                shareButton.style.backgroundColor = '';
                shareButton.disabled = false;
                
                // Highlight the newest feed item
                const firstFeedItem = document.querySelector('.feed-item');
                if (firstFeedItem) {
                    firstFeedItem.style.boxShadow = '0 0 0 3px var(--twitter-blue)';
                    firstFeedItem.scrollIntoView({ behavior: 'smooth' });
                    
                    setTimeout(() => {
                        firstFeedItem.style.boxShadow = '';
                    }, 2000);
                }
            }, 1000);
        }, 800);
    }
}

// Complete the day and log progress
function completeDay() {
    const dayPlan = document.getElementById('day-plan-input').value.trim();
    
    if (!dayPlan) {
        alert('Please add a day plan before completing your entry.');
        return;
    }
    
    // Get current tasks
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Create a new log entry
    const now = new Date();
    const logEntry = {
        date: now.toISOString(),
        dayPlan: dayPlan,
        tasks: [...tasks], // Make a copy of the tasks
        studyLog: '', // Empty study log for now
        studyHours: 0,
        streak: appState.streak,
        isQuickShare: false,
        isDayCompletion: false
    };
    
    // Add to logs
    appState.logs.unshift(logEntry);
    
    // Clear form
    document.getElementById('day-plan-input').value = '';
    
    // Clear tasks
    localStorage.setItem('tasks', JSON.stringify([]));
    
    // Save data and update UI
    saveData();
    updateUI();
    
    // Show success feedback
    const saveButton = document.getElementById('save-day-btn');
    const originalText = saveButton.textContent;
    
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Saving...';
    
    setTimeout(() => {
        saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
        saveButton.style.backgroundColor = 'var(--success-color)';
        
        setTimeout(() => {
            saveButton.textContent = originalText;
            saveButton.style.backgroundColor = '';
            saveButton.disabled = false;
            
            // Switch to the feed tab to show the new entry
            switchTab('feed');
            
            // Highlight the newest feed item
            setTimeout(() => {
                const firstFeedItem = document.querySelector('.feed-item');
                if (firstFeedItem) {
                    firstFeedItem.style.boxShadow = '0 0 0 3px var(--primary-color)';
                    firstFeedItem.scrollIntoView({ behavior: 'smooth' });
                    
                    setTimeout(() => {
                        firstFeedItem.style.boxShadow = '';
                    }, 2000);
                }
            }, 300);
        }, 1000);
    }, 800);
    
    if (window.toastManager) {
        window.toastManager.success('Day plan saved successfully! Please use the "Study Feed" tab to log your study progress.', 5000);
    } else {
        alert('Day plan saved successfully! Please use the "Study Feed" tab to log your study progress.');
    }
}

// Check streak status and show warning if needed
function checkStreakStatus() {
    if (!appState.lastCompletedDate) return;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDate = new Date(appState.lastCompletedDate);
    const lastDateDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDateDay.getTime() < yesterday.getTime()) {
        // Show streak warning
        const daysSince = Math.floor((today - lastDateDay) / (1000 * 60 * 60 * 24));
        alert(`Warning: It's been ${daysSince} days since your last entry. Complete today's entry to avoid breaking your streak!`);
    }
}

// Render the study log feed
function renderFeed() {
    const feedContainer = document.getElementById('study-feed');
    
    // Ensure we have a valid feedContainer before proceeding
    if (!feedContainer) {
        console.error('Feed container not found');
        return;
    }

    console.log('Rendering feed, appState:', appState);
    
    // Make sure we have valid logs data
    if (!appState.logs || !Array.isArray(appState.logs) || appState.logs.length === 0) {
        feedContainer.innerHTML = '<div class="empty-feed-message">No entries yet. Complete your first day to see it here!</div>';
        return;
    }
    
    // Clear previous feed
    feedContainer.innerHTML = '';
    
    // Sort logs by date (newest first)
    const sortedLogs = [...appState.logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create feed items for each log
    sortedLogs.forEach((log, index) => {
        const feedItem = document.createElement('div');
        feedItem.className = 'feed-item';
        feedItem.style.opacity = '0';
        feedItem.style.transform = 'translateY(20px)';
        
        // Format date properly
        let logDate;
        try {
            logDate = new Date(log.date);
            // Check if date is valid
            if (isNaN(logDate.getTime())) {
                logDate = new Date(); // Use current date as fallback
            }
        } catch (e) {
            console.error('Invalid date format:', log.date);
            logDate = new Date(); // Use current date as fallback
        }
        
        const formattedDate = logDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
        
        // Create feed header with avatar, name and date
        const feedHeader = document.createElement('div');
        feedHeader.className = 'feed-header';
        
        const feedUser = document.createElement('div');
        feedUser.className = 'feed-user';
        
        const initial = 'S'; // Initial for "Student"
        
        feedUser.innerHTML = `
            <div class="feed-avatar">${initial}</div>
            <div class="feed-user-info">
                <div class="feed-name">Student</div>
                <div class="feed-date">${formattedDate}</div>
            </div>
        `;
        
        // Create streak badge
        const streakBadge = document.createElement('div');
        streakBadge.className = 'feed-streak';
        streakBadge.innerHTML = `<i class="fas fa-fire"></i> Day ${log.streak || 0}`;
        
        feedHeader.appendChild(feedUser);
        feedHeader.appendChild(streakBadge);
        
        // Create feed content
        const feedContent = document.createElement('div');
        feedContent.className = 'feed-content';
        
        // Check if this is a day completion or quick share
        if (log.isDayCompletion) {
            feedContent.innerHTML = `<div class="day-completion-badge"><i class="fas fa-calendar-check"></i> Day Completed!</div>`;
        }
        
        // Add the study log content
        if (log.studyLog && log.studyLog.trim() !== '') {
            feedContent.innerHTML += formatContent(log.studyLog);
        }
        
        // Add tasks section if there are tasks
        if (log.tasks && Array.isArray(log.tasks) && log.tasks.length > 0) {
            const tasksSection = document.createElement('div');
            tasksSection.className = 'feed-tasks';
            tasksSection.innerHTML = '<h4>Tasks</h4>';
            
            const taskList = document.createElement('ul');
            taskList.className = 'feed-task-list';
            
            log.tasks.forEach(task => {
                if (task && typeof task === 'object') {
                    const taskItem = document.createElement('li');
                    taskItem.className = 'feed-task-item';
                    taskItem.textContent = task.text || 'Unnamed Task';
                    if (task.completed) {
                        taskItem.innerHTML = `<span style="text-decoration: line-through;">${task.text || 'Unnamed Task'}</span> ✓`;
                    }
                    taskList.appendChild(taskItem);
                }
            });
            
            tasksSection.appendChild(taskList);
            feedContent.appendChild(tasksSection);
        }
        
        // Add day plan section if there is a day plan
        if (log.dayPlan && log.dayPlan.trim() !== '') {
            const planSection = document.createElement('div');
            planSection.className = 'feed-day-plan';
            planSection.innerHTML = `
                <h4>Day Plan</h4>
                <div>${formatContent(log.dayPlan)}</div>
            `;
            feedContent.appendChild(planSection);
        }
        
        // Add study hours info if available
        if (log.studyHours !== null && log.studyHours !== undefined) {
            const hoursSection = document.createElement('div');
            hoursSection.className = 'feed-achievements';
            hoursSection.innerHTML = `
                <h4>Study Time</h4>
                <div><strong>${log.studyHours}</strong> hours studied</div>
            `;
            feedContent.appendChild(hoursSection);
        } else if (!log.isQuickShare) {
            // For plan-only entries
            const planOnlyMessage = document.createElement('div');
            planOnlyMessage.className = 'plan-only-message';
            planOnlyMessage.innerHTML = 'Waiting for study log updates...';
            feedContent.appendChild(planOnlyMessage);
        }
        
        // Create feed actions
        const feedActions = document.createElement('div');
        feedActions.className = 'feed-actions';
        
        // Like button
        const likeAction = document.createElement('div');
        likeAction.className = 'feed-action';
        likeAction.innerHTML = '<i class="far fa-heart"></i> Like';
        
        // Comment button
        const commentAction = document.createElement('div');
        commentAction.className = 'feed-action';
        commentAction.innerHTML = '<i class="far fa-comment"></i> Comment';
        
        // Share button
        const shareAction = document.createElement('div');
        shareAction.className = 'feed-action';
        shareAction.innerHTML = '<i class="far fa-share-square"></i> Share';
        
        feedActions.appendChild(likeAction);
        feedActions.appendChild(commentAction);
        feedActions.appendChild(shareAction);
        
        // Append all elements to the feed item
        feedItem.appendChild(feedHeader);
        feedItem.appendChild(feedContent);
        feedItem.appendChild(feedActions);
        
        // Append feed item to container
        feedContainer.appendChild(feedItem);
        
        // Add staggered animation
        setTimeout(() => {
            feedItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            feedItem.style.opacity = '1';
            feedItem.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Add interactive animations to feed actions
    setTimeout(() => {
        document.querySelectorAll('.feed-action').forEach(action => {
            action.addEventListener('click', function() {
                this.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
            });
        });
    }, 500);
}

// Update statistics display
function updateStatistics() {
    // Calculate total days
    const uniqueDays = new Set();
    appState.logs.forEach(log => {
        uniqueDays.add(new Date(log.date).toLocaleDateString());
    });
    
    const totalDays = uniqueDays.size;
    document.getElementById('total-days').textContent = totalDays;
    
    // Calculate total hours
    let totalHours = 0;
    let daysWithHours = 0;
    
    appState.logs.forEach(log => {
        if (log.studyHours && log.studyHours > 0) {
            totalHours += log.studyHours;
            daysWithHours++;
        }
    });
    
    document.getElementById('total-hours').textContent = totalHours.toFixed(1);
    
    // Calculate average hours per day
    const avgHours = daysWithHours > 0 ? (totalHours / daysWithHours).toFixed(1) : '0';
    document.getElementById('avg-hours').textContent = avgHours;
    
    // Count completed tasks
    let completedTasks = 0;
    appState.logs.forEach(log => {
        log.tasks.forEach(task => {
            if (task.completed) {
                completedTasks++;
            }
        });
    });
    
    document.getElementById('completed-tasks').textContent = completedTasks;
    
    // Celebrate milestones
    celebrateMilestones();
}

// Celebrate streak milestones
function celebrateMilestones() {
    // Get the last celebrated milestone from localStorage
    const lastCelebrated = parseInt(localStorage.getItem('lastCelebratedMilestone') || '0');
    
    // Milestones to celebrate
    const milestones = [7, 14, 21, 30, 50, 75, 100];
    
    // Find if we've hit a new milestone
    for (const milestone of milestones) {
        if (appState.streak >= milestone && lastCelebrated < milestone) {
            // Update last celebrated
            localStorage.setItem('lastCelebratedMilestone', milestone.toString());
            
            // Show celebration
            if (window.confetti) {
                window.confetti.createConfetti();
            }
            
            // Show congratulatory message
            if (window.toastManager) {
                window.toastManager.success(`Congratulations! You've reached a ${milestone}-day streak! 🎉`, 5000);
            }
            
            break; // Only celebrate one milestone at a time
        }
    }
}

// Render the hours study chart
function renderChart() {
    const chartContainer = document.getElementById('study-chart');
    const studyLogs = JSON.parse(localStorage.getItem('studyLogs')) || [];
    
    if (studyLogs.length === 0) {
        // Show placeholder if no data
        chartContainer.innerHTML = `
            <div class="placeholder-chart">
                <div class="chart-bar" style="height: 30%"></div>
                <div class="chart-bar" style="height: 50%"></div>
                <div class="chart-bar" style="height: 70%"></div>
                <div class="chart-bar" style="height: 40%"></div>
                <div class="chart-bar" style="height: 60%"></div>
                <div class="chart-bar" style="height: 80%"></div>
                <div class="chart-bar" style="height: 45%"></div>
            </div>
        `;
        return;
    }
    
    // Sort logs by date (oldest first)
    studyLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Take last 14 days
    const recentLogs = studyLogs.slice(-14);
    
    // Find max hours to normalize chart heights
    const maxHours = Math.max(...recentLogs.map(log => log.hoursStudied));
    
    chartContainer.innerHTML = '';
    const chartContent = document.createElement('div');
    chartContent.className = 'placeholder-chart';
    
    recentLogs.forEach((log, index) => {
        const height = maxHours > 0 ? (log.hoursStudied / maxHours) * 100 : 0;
        
        const barContainer = document.createElement('div');
        barContainer.className = 'chart-bar-container';
        barContainer.style.position = 'relative';
        barContainer.style.display = 'flex';
        barContainer.style.flexDirection = 'column';
        barContainer.style.alignItems = 'center';
        barContainer.style.width = '40px';
        
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.top = '-40px';
        tooltip.style.backgroundColor = 'var(--card-background)';
        tooltip.style.boxShadow = 'var(--box-shadow)';
        tooltip.style.borderRadius = '6px';
        tooltip.style.padding = '5px 10px';
        tooltip.style.fontSize = '0.85rem';
        tooltip.style.transition = 'opacity 0.2s';
        tooltip.style.opacity = '0';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '10';
        tooltip.innerHTML = `<strong>${log.hoursStudied}</strong> hrs<br>${new Date(log.date).toLocaleDateString()}`;
        
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = '0%';
        
        // Add day label
        const dayLabel = document.createElement('div');
        dayLabel.className = 'chart-day-label';
        dayLabel.style.fontSize = '0.75rem';
        dayLabel.style.color = 'var(--text-secondary)';
        dayLabel.style.marginTop = '5px';
        dayLabel.textContent = new Date(log.date).toLocaleDateString('en-US', { day: 'numeric' });
        
        barContainer.appendChild(tooltip);
        barContainer.appendChild(bar);
        barContainer.appendChild(dayLabel);
        chartContent.appendChild(barContainer);
        
        // Hover effect
        barContainer.addEventListener('mouseenter', () => {
            tooltip.style.opacity = '1';
            bar.style.transform = 'scaleY(1.05)';
        });
        
        barContainer.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
            bar.style.transform = '';
        });
        
        // Animate bars on initial render with delay
        setTimeout(() => {
            bar.style.transition = 'height 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            bar.style.height = `${height}%`;
        }, index * 100);
    });
    
    chartContainer.appendChild(chartContent);
}

// Format text content with basic markdown-like support
function formatContent(content) {
    if (!content) return '';
    
    // Replace line breaks with <br>
    return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\~\~(.*?)\~\~/g, '<del>$1</del>');
}

// Open a modal
function openModal(modal) {
    modal.style.display = 'flex';
}

// Close a modal
function closeModal(modal) {
    modal.style.display = 'none';
    
    // Clear login form if it's the login modal
    if (modal === elements.loginModal) {
        elements.adminPassword.value = '';
        elements.loginError.textContent = '';
    }
}

// Handle login
function login() {
    const password = elements.adminPassword.value;
    
    if (password === appState.adminPassword) {
        appState.isAuthenticated = true;
        closeModal(elements.loginModal);
        openModal(elements.settingsModal);
        elements.manualStreak.value = appState.streak;
    } else {
        elements.loginError.textContent = 'Incorrect password';
    }
}

// Save settings
function saveSettings() {
    const newStreak = parseInt(elements.manualStreak.value) || 0;
    
    if (newStreak !== appState.streak) {
        appState.streak = newStreak;
        saveData();
        updateUI();
    }
    
    closeModal(elements.settingsModal);
    alert('Settings saved successfully!');
}

// Export data
function exportData() {
    const format = elements.downloadFormat.value;
    let content, filename, type;
    
    switch (format) {
        case 'json':
            content = JSON.stringify({
                streak: appState.streak,
                lastCompletedDate: appState.lastCompletedDate,
                logs: appState.logs
            }, null, 2);
            filename = 'study-streak-data.json';
            type = 'application/json';
            break;
        
        case 'csv':
            // CSV header
            content = 'Date,Streak,Hours,Study Log,Day Plan,Tasks,Type\n';
            
            // Add data rows
            appState.logs.forEach(log => {
                const date = new Date(log.date).toLocaleDateString('en-US');
                const streak = log.streak || '';
                const hours = log.studyHours || '';
                const studyLog = `"${log.studyLog.replace(/"/g, '""')}"`;
                const dayPlan = `"${log.dayPlan.replace(/"/g, '""')}"`;
                const tasks = log.tasks && log.tasks.length ? `"${log.tasks.map(t => t.text).join(', ').replace(/"/g, '""')}"` : '""';
                const type = log.isQuickShare ? 'QuickShare' : 'FullLog';
                
                content += `${date},${streak},${hours},${studyLog},${dayPlan},${tasks},${type}\n`;
            });
            
            filename = 'study-streak-data.csv';
            type = 'text/csv';
            break;
        
        case 'markdown':
            content = '# Study Streak Data\n\n';
            content += `Current Streak: **${appState.streak}** days\n\n`;
            content += '## Log Entries\n\n';
            
            appState.logs.forEach(log => {
                const date = new Date(log.date).toLocaleDateString('en-US');
                
                if (log.isQuickShare) {
                    content += `### ${date} (Quick Share)\n\n`;
                    content += `${log.studyLog}\n\n`;
                } else {
                    content += `### ${date} (Day ${log.streak})\n\n`;
                    content += `**Hours Studied:** ${log.studyHours}\n\n`;
                    content += `**Study Log:**\n${log.studyLog}\n\n`;
                    
                    if (log.dayPlan) {
                        content += `**Day Plan:**\n${log.dayPlan}\n\n`;
                    }
                    
                    if (log.tasks && log.tasks.length > 0) {
                        content += '**Tasks:**\n';
                        log.tasks.forEach(task => {
                            content += `- [${task.completed ? 'x' : ' '}] ${task.text}\n`;
                        });
                        content += '\n';
                    }
                }
                
                content += '---\n\n';
            });
            
            filename = 'study-streak-data.md';
            type = 'text/markdown';
            break;
    }
    
    // Create download link
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Calculate and update weekly completion rate
function updateWeekCompletion() {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    // Filter logs from the past 7 days
    const recentLogs = appState.logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= oneWeekAgo && logDate <= now;
    });
    
    // Count days with entries
    const daysWithEntries = new Set();
    recentLogs.forEach(log => {
        const date = new Date(log.date).toLocaleDateString();
        daysWithEntries.add(date);
    });
    
    // Calculate completion rate
    const completionRate = Math.round((daysWithEntries.size / 7) * 100);
    
    // Update circle progress
    document.getElementById('week-completion-rate').textContent = `${completionRate}%`;
    
    // Calculate circumference of circle (2πr)
    const circle = document.getElementById('circle-progress');
    const radius = circle.getAttribute('r');
    const circumference = 2 * Math.PI * radius;
    
    // Calculate stroke-dashoffset (circumference - completionRate/100 * circumference)
    const dashOffset = circumference - (completionRate / 100) * circumference;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = dashOffset;
}

// Render activity heatmap
function renderActivityHeatmap() {
    const heatmapContainer = document.getElementById('activity-heatmap');
    heatmapContainer.innerHTML = '';
    
    // Get today's date
    const today = new Date();
    
    // Calculate dates for the past 3 months (about 13 weeks)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 91); // 91 days = ~13 weeks
    
    // Create map of dates with study activity
    const activityMap = {};
    appState.logs.forEach(log => {
        const date = new Date(log.date).toLocaleDateString();
        
        // If there's already an entry, add the hours
        if (activityMap[date]) {
            activityMap[date].hours += log.studyHours || 0;
            activityMap[date].entries += 1;
        } else {
            activityMap[date] = {
                hours: log.studyHours || 0,
                entries: 1
            };
        }
    });
    
    // Get the first day of the week for the start date
    const firstDayOfWeek = new Date(startDate);
    const day = firstDayOfWeek.getDay();
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - (day === 0 ? 6 : day - 1)); // Adjust to Monday
    
    // Generate grid for each day
    const currentDate = new Date(firstDayOfWeek);
    
    while (currentDate <= today) {
        const dateString = currentDate.toLocaleDateString();
        const activity = activityMap[dateString] || { hours: 0, entries: 0 };
        
        // Calculate activity level (0-5)
        let level = 0;
        if (activity.entries > 0) {
            if (activity.hours === 0) {
                level = 1; // Just a plan
            } else if (activity.hours < 2) {
                level = 2; // 0-2 hours
            } else if (activity.hours < 4) {
                level = 3; // 2-4 hours
            } else if (activity.hours < 6) {
                level = 4; // 4-6 hours
            } else {
                level = 5; // 6+ hours
            }
        }
        
        // Create day square
        const daySquare = document.createElement('div');
        daySquare.className = `calendar-day level-${level}`;
        daySquare.dataset.date = dateString;
        daySquare.dataset.hours = activity.hours;
        daySquare.dataset.entries = activity.entries;
        
        // Add hover tooltip
        daySquare.addEventListener('mouseenter', function(e) {
            const date = new Date(this.dataset.date);
            const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const hours = parseFloat(this.dataset.hours);
            const entries = parseInt(this.dataset.entries);
            
            const tooltip = document.createElement('div');
            tooltip.className = 'day-tooltip';
            tooltip.innerHTML = `
                <div><strong>${formattedDate}</strong></div>
                <div>${hours} hours studied</div>
                <div>${entries} entries</div>
            `;
            
            document.body.appendChild(tooltip);
            
            // Position tooltip
            const rect = this.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
            
            // Show tooltip with a slight delay
            setTimeout(() => {
                tooltip.style.opacity = '1';
            }, 50);
        });
        
        daySquare.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.day-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
        
        heatmapContainer.appendChild(daySquare);
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }
} 