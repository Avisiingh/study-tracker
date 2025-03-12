// Login system for Study Tracker
console.log('Loading Study Tracker Login System v1.0.1');

// Utility functions
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
}

function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

function generateInitialsAvatar(username) {
    if (!username) return 'U';
    const nameParts = username.trim().split(' ');
    let initials = nameParts[0][0].toUpperCase();
    if (nameParts.length > 1) {
        initials += nameParts[nameParts.length - 1][0].toUpperCase();
    }
    return initials;
}

function showError(message, elementId = 'login-error') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Clear error after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// Navigation functions
function getBasePath() {
    // Check if we're on GitHub Pages
    if (window.location.hostname.includes('github.io')) {
        return '/study-tracker/';
    }
    // Local development
    return '/';
}

function redirectToHome() {
    window.location.href = window.location.protocol + '//' + window.location.host + getBasePath();
}

function redirectToLogin() {
    window.location.href = window.location.protocol + '//' + window.location.host + getBasePath() + 'login.html';
}

// Login user and set session
function loginUser(user) {
    console.log('Attempting to log in user:', user.email);
    
    // Update user state
    userState.isLoggedIn = true;
    userState.username = user.username;
    userState.email = user.email;
    userState.profilePic = user.profilePic || generateInitialsAvatar(user.username);
    userState.userId = user.userId;
    
    // Load user's study data
    userState.studyData = loadStudyData(user.userId);
    
    // Save to localStorage
    const userInfo = {
        username: user.username,
        email: user.email,
        profilePic: userState.profilePic,
        userId: user.userId,
        lastLogin: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userInfo));
    console.log('User info saved to localStorage');
    
    // Update UI before redirecting
    updateAuthUI();
    
    // Redirect after a short delay
    setTimeout(() => {
        console.log('Redirecting to home page');
        window.location.href = window.location.protocol + '//' + window.location.host + getBasePath();
    }, 500);
}

// Handle user login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    let users = [];
    try {
        const storedUsers = localStorage.getItem('studyTrackerUsers');
        users = storedUsers ? JSON.parse(storedUsers) : [];
        console.log('Found users:', users.length);
    } catch (error) {
        console.error('Error reading users:', error);
        showError('Error accessing user data. Please try again.');
        return;
    }
    
    const hashedPassword = hashPassword(password);
    const user = users.find(u => u.email === email && u.hashedPassword === hashedPassword);
    
    if (user) {
        console.log('Login successful:', email);
        loginUser(user);
    } else {
        showError('Invalid email or password. Please try again.');
        // Clear password field
        const passwordField = document.getElementById('password');
        if (passwordField) {
            passwordField.value = '';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Set up form event listeners
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const recoveryForm = document.getElementById('recoveryForm');
    
    console.log('Forms found:', {
        loginForm: !!loginForm,
        registerForm: !!registerForm,
        recoveryForm: !!recoveryForm
    });
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            handleLogin(e);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Register form submitted');
            handleRegister(e);
        });
    }
    
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Recovery form submitted');
            handlePasswordRecovery(e);
        });
    }
    
    // Modal triggers and close functionality
    const showRegisterBtn = document.getElementById('showRegisterForm');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const registerModal = document.getElementById('registerModal');
    const recoveryModal = document.getElementById('recoveryModal');
    
    // Function to close modal
    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            // Reset forms when closing modals
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
            // Hide any error messages
            const errorMessage = modal.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
            // Hide security question container in recovery modal
            if (modal.id === 'recoveryModal') {
                const securityQuestionContainer = document.getElementById('security-question-container');
                if (securityQuestionContainer) {
                    securityQuestionContainer.style.display = 'none';
                }
            }
        }
    }
    
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (registerModal) {
                registerModal.style.display = 'flex';
            }
        });
    }
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (recoveryModal) {
                recoveryModal.style.display = 'flex';
            }
        });
    }
    
    // Close modal with × button
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (registerModal && registerModal.style.display === 'flex') {
                closeModal(registerModal);
            }
            if (recoveryModal && recoveryModal.style.display === 'flex') {
                closeModal(recoveryModal);
            }
        }
    });

    // Initialize authentication
    initAuth();

    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
});

// User authentication system
const userState = {
    isLoggedIn: false,
    username: '',
    email: '',
    profilePic: '',
    userId: ''
};

// Add this after userState declaration
const studyDataKey = 'studyTrackerData';

// Add this after studyDataKey declaration
const defaultSubjects = {
    'Mathematics': ['Algebra', 'Calculus', 'Statistics'],
    'Science': ['Physics', 'Chemistry', 'Biology'],
    'Programming': ['JavaScript', 'Python', 'Java'],
    'Languages': ['English', 'Spanish', 'French']
};

// Add these new functions for handling study data
function saveStudyData(userId, data) {
    try {
        let allStudyData = JSON.parse(localStorage.getItem(studyDataKey) || '{}');
        allStudyData[userId] = {
            ...allStudyData[userId],
            ...data,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(studyDataKey, JSON.stringify(allStudyData));
        console.log('Study data saved for user:', userId);
    } catch (error) {
        console.error('Error saving study data:', error);
    }
}

function loadStudyData(userId) {
    try {
        const allStudyData = JSON.parse(localStorage.getItem(studyDataKey) || '{}');
        return allStudyData[userId] || {
            subjects: defaultSubjects,
            concepts: {
                'Data Structures': { progress: 75, level: 'Advanced' },
                'Algorithm Analysis': { progress: 60, level: 'Intermediate' },
                'System Design': { progress: 45, level: 'Beginner' }
            },
            goals: [
                {
                    id: 'goal1',
                    title: 'Complete Practice Problems',
                    description: 'Solve 5 algorithm challenges',
                    target: 5,
                    current: 0,
                    completed: false
                },
                {
                    id: 'goal2',
                    title: 'Study Session Target',
                    description: '4 hours of focused learning',
                    target: 4,
                    current: 0,
                    completed: false
                }
            ],
            stats: {
                conceptsMastered: 0,
                studyHours: 0,
                successRate: 0
            },
            activities: []
        };
    } catch (error) {
        console.error('Error loading study data:', error);
        return null;
    }
}

// Initialize authentication
function initAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const parsedUser = JSON.parse(savedUser);
            userState.isLoggedIn = true;
            userState.username = parsedUser.username;
            userState.email = parsedUser.email;
            userState.profilePic = parsedUser.profilePic || generateInitialsAvatar(parsedUser.username);
            userState.userId = parsedUser.userId;
            
            if (window.location.href.includes('login.html')) {
                redirectToHome();
            } else {
                updateAuthUI();
            }
        } catch (error) {
            console.error('Error parsing saved user data:', error);
            localStorage.removeItem('currentUser');
        }
    } else if (!window.location.href.includes('login.html')) {
        redirectToLogin();
    }
}

// Handle user registration
function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const phone = document.getElementById('register-phone').value;
    const securityQuestion = document.getElementById('register-security-question').value;
    const securityAnswer = document.getElementById('register-security-answer').value;
    
    if (!username || !email || !password || !confirmPassword || !phone || !securityQuestion || !securityAnswer) {
        showError('Please fill in all fields', 'register-error');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match', 'register-error');
        return;
    }
    
    // Get existing users or initialize empty array
    let users = [];
    try {
        const storedUsers = localStorage.getItem('studyTrackerUsers');
        users = storedUsers ? JSON.parse(storedUsers) : [];
    } catch (error) {
        console.error('Error reading users:', error);
        users = [];
    }
    
    if (users.some(u => u.email === email)) {
        showError('Email already registered', 'register-error');
        return;
    }
    
    const hashedPassword = hashPassword(password);
    const userId = generateUserId();
    
    const newUser = {
        username,
        email,
        hashedPassword,
        userId,
        phone,
        securityQuestion,
        securityAnswer: hashPassword(securityAnswer.toLowerCase()),
        profilePic: '',
        createdAt: new Date().toISOString()
    };
    
    // Add new user and save to localStorage
    users.push(newUser);
    try {
        localStorage.setItem('studyTrackerUsers', JSON.stringify(users));
        console.log('User registered successfully:', email);
        
        // Also save as current user
        const userInfo = {
            username: newUser.username,
            email: newUser.email,
            profilePic: newUser.profilePic,
            userId: newUser.userId
        };
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        
        // Auto login
        loginUser(newUser);
        
        // Close registration modal
        const registerModal = document.getElementById('registerModal');
        if (registerModal) {
            registerModal.style.display = 'none';
        }
    } catch (error) {
        console.error('Error saving user:', error);
        showError('Error creating account. Please try again.', 'register-error');
    }
}

// Handle logout
function handleLogout() {
    // Save current study data before logging out
    if (userState.isLoggedIn && userState.userId) {
        saveStudyData(userState.userId, userState.studyData);
    }
    
    localStorage.removeItem('currentUser');
    userState.isLoggedIn = false;
    userState.username = '';
    userState.email = '';
    userState.profilePic = '';
    userState.userId = '';
    userState.studyData = null;
    
    redirectToLogin();
}

// Handle password recovery
function handlePasswordRecovery(event) {
    event.preventDefault();
    const email = document.getElementById('recovery-email').value;
    const securityQuestionContainer = document.getElementById('security-question-container');
    const securityQuestionText = document.getElementById('security-question-text');
    const recoverySubmitBtn = document.getElementById('recovery-submit');
    
    if (!email) {
        showError('Please enter your email address', 'recovery-error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user) {
        showError('No account found with this email', 'recovery-error');
        return;
    }
    
    if (securityQuestionContainer.style.display === 'none') {
        // Show security question
        securityQuestionText.textContent = user.securityQuestion;
        securityQuestionContainer.style.display = 'block';
        recoverySubmitBtn.textContent = 'Reset Password';
        return;
    }
    
    // Handle password reset
    const answer = document.getElementById('security-answer').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    
    if (!answer || !newPassword || !confirmPassword) {
        showError('Please fill in all fields', 'recovery-error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('Passwords do not match', 'recovery-error');
        return;
    }
    
    if (hashPassword(answer.toLowerCase()) !== user.securityAnswer) {
        showError('Incorrect security answer', 'recovery-error');
        return;
    }
    
    // Update password
    const updatedUsers = users.map(u => 
        u.email === email ? {...u, hashedPassword: hashPassword(newPassword)} : u
    );
    
    localStorage.setItem('studyTrackerUsers', JSON.stringify(updatedUsers));
    
    // Show success and redirect
    const recoveryModal = document.getElementById('recoveryModal');
    recoveryModal.style.display = 'none';
    alert('Password updated successfully! Please log in with your new password.');
    document.getElementById('recoveryForm').reset();
    securityQuestionContainer.style.display = 'none';
    recoverySubmitBtn.textContent = 'Continue';
}

// Update UI based on authentication state
function updateAuthUI() {
    console.log('Updating UI with user state:', userState);
    
    // Create main app container if it doesn't exist
    let appContainer = document.querySelector('.app-container');
    if (!appContainer) {
        appContainer = document.createElement('div');
        appContainer.className = 'app-container';
        document.body.appendChild(appContainer);
    }
    
    if (userState.isLoggedIn) {
        // Update app container with new layout
        appContainer.innerHTML = `
            <div class="sidebar">
                <div class="user-profile">
                    <div class="user-avatar large">${userState.profilePic || generateInitialsAvatar(userState.username)}</div>
                    <div class="user-info">
                        <h3>${userState.username}</h3>
                        <p>${userState.email}</p>
                    </div>
                    <div class="user-actions">
                        <button onclick="showSettings()" class="btn-icon"><i class="fas fa-cog"></i></button>
                        <button onclick="handleLogout()" class="btn-icon"><i class="fas fa-sign-out-alt"></i></button>
                    </div>
                </div>
                <nav class="sidebar-nav">
                    <a href="#dashboard" class="nav-item active">
                        <i class="fas fa-home"></i> Dashboard
                    </a>
                    <a href="#subjects" class="nav-item">
                        <i class="fas fa-book"></i> Subjects
                    </a>
                    <a href="#progress" class="nav-item">
                        <i class="fas fa-chart-line"></i> Progress
                    </a>
                    <a href="#goals" class="nav-item">
                        <i class="fas fa-bullseye"></i> Goals
                    </a>
                </nav>
            </div>
            <div class="main-area">
                <div class="top-bar">
                    <div class="search-bar">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search subjects, topics, or concepts...">
                    </div>
                    <div class="quick-actions">
                        <button onclick="startStudySession()" class="btn primary">
                            <i class="fas fa-play"></i> Start Study Session
                        </button>
                        <button onclick="addNewSubject()" class="btn">
                            <i class="fas fa-plus"></i> Add Subject
                        </button>
                    </div>
                </div>
                <div class="main-content">
                    <div class="dashboard-header">
                        <h2>Welcome back, ${userState.username}! 📚</h2>
                        <p>Here's your learning progress</p>
                    </div>
                    
                    <div class="subjects-grid">
                        ${Object.entries(userState.studyData.subjects || {}).map(([subject, data]) => `
                            <div class="subject-card">
                                <div class="subject-icon">
                                    <i class="fas fa-book"></i>
                                </div>
                                <div class="subject-info">
                                    <h3>${subject}</h3>
                                    <p>${(data.topics || []).length} Topics</p>
                                    <div class="progress-bar">
                                        <div class="progress-bar-fill" style="width: ${data.progress || 0}%"></div>
                                    </div>
                                </div>
                                <button onclick="viewSubject('${subject}')" class="btn-icon">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="dashboard-grid">
                        <div class="stats-card">
                            <h3><i class="fas fa-chart-pie"></i> Learning Overview</h3>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-value">${Object.keys(userState.studyData.subjects || {}).length}</span>
                                    <span class="stat-label">Active Subjects</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${userState.studyData.stats.studyHours || 0}</span>
                                    <span class="stat-label">Study Hours</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${userState.studyData.stats.successRate || 0}%</span>
                                    <span class="stat-label">Success Rate</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="recent-activity">
                            <h3><i class="fas fa-history"></i> Recent Activity</h3>
                            <div class="activity-timeline">
                                ${(userState.studyData.activities || []).map(activity => `
                                    <div class="activity-item">
                                        <div class="activity-icon ${activity.type}">
                                            <i class="fas fa-${activity.type === 'completed' ? 'check' : 'star'}"></i>
                                        </div>
                                        <div class="activity-content">
                                            <h4>${activity.title}</h4>
                                            <p>${activity.description}</p>
                                            <span class="activity-time">${new Date(activity.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add new styles
        const newStyles = document.createElement('style');
        newStyles.textContent = `
            .app-container {
                display: flex;
                min-height: 100vh;
                background: var(--background-color);
            }
            
            .sidebar {
                width: 280px;
                background: var(--card-background);
                border-right: 1px solid var(--border-color);
                padding: var(--spacing-md);
                display: flex;
                flex-direction: column;
                gap: var(--spacing-lg);
            }
            
            .user-profile {
                padding: var(--spacing-md);
                background: var(--background-color);
                border-radius: var(--radius-md);
                text-align: center;
            }
            
            .user-avatar.large {
                width: 80px;
                height: 80px;
                font-size: 1.5rem;
                margin: 0 auto var(--spacing-sm);
            }
            
            .user-info h3 {
                margin: 0;
                color: var(--text-primary);
                font-size: 1.2rem;
            }
            
            .user-info p {
                margin: var(--spacing-xs) 0;
                color: var(--text-secondary);
                font-size: 0.9rem;
            }
            
            .user-actions {
                display: flex;
                justify-content: center;
                gap: var(--spacing-sm);
                margin-top: var(--spacing-sm);
            }
            
            .btn-icon {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: none;
                background: var(--background-color);
                color: var(--text-secondary);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            .btn-icon:hover {
                background: var(--primary-color);
                color: white;
            }
            
            .sidebar-nav {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-xs);
            }
            
            .sidebar-nav .nav-item {
                padding: var(--spacing-sm) var(--spacing-md);
                border-radius: var(--radius-sm);
                color: var(--text-secondary);
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                transition: all 0.2s;
            }
            
            .sidebar-nav .nav-item:hover,
            .sidebar-nav .nav-item.active {
                background: var(--primary-color);
                color: white;
            }
            
            .main-area {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow-y: auto;
            }
            
            .top-bar {
                height: 64px;
                background: var(--card-background);
                border-bottom: 1px solid var(--border-color);
                padding: 0 var(--spacing-lg);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--spacing-md);
            }
            
            .search-bar {
                flex: 1;
                max-width: 600px;
                position: relative;
            }
            
            .search-bar input {
                width: 100%;
                padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 40px;
                border: 1px solid var(--border-color);
                border-radius: var(--radius-md);
                font-size: 1rem;
                background: var(--background-color);
            }
            
            .search-bar i {
                position: absolute;
                left: var(--spacing-sm);
                top: 50%;
                transform: translateY(-50%);
                color: var(--text-secondary);
            }
            
            .quick-actions {
                display: flex;
                gap: var(--spacing-sm);
            }
            
            .btn {
                padding: var(--spacing-sm) var(--spacing-md);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm);
                background: var(--card-background);
                color: var(--text-primary);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                transition: all 0.2s;
            }
            
            .btn.primary {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }
            
            .btn:hover {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }
            
            .subjects-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: var(--spacing-md);
                margin: var(--spacing-lg) 0;
            }
            
            .subject-card {
                background: var(--card-background);
                border-radius: var(--radius-md);
                padding: var(--spacing-md);
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                transition: all 0.2s;
                cursor: pointer;
            }
            
            .subject-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }
            
            .subject-icon {
                width: 48px;
                height: 48px;
                background: var(--primary-color);
                border-radius: var(--radius-sm);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.2rem;
            }
            
            .subject-info {
                flex: 1;
            }
            
            .subject-info h3 {
                margin: 0;
                color: var(--text-primary);
                font-size: 1.1rem;
            }
            
            .subject-info p {
                margin: var(--spacing-xs) 0;
                color: var(--text-secondary);
                font-size: 0.9rem;
            }
            
            @media (max-width: 768px) {
                .sidebar {
                    position: fixed;
                    left: -280px;
                    top: 0;
                    bottom: 0;
                    z-index: 1000;
                    transition: all 0.3s;
                }
                
                .sidebar.active {
                    left: 0;
                }
                
                .top-bar {
                    flex-direction: column;
                    height: auto;
                    padding: var(--spacing-sm);
                    gap: var(--spacing-sm);
                }
                
                .search-bar {
                    width: 100%;
                }
                
                .quick-actions {
                    width: 100%;
                    flex-direction: column;
                }
                
                .btn {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        
        if (!document.querySelector('style[data-new-styles]')) {
            newStyles.setAttribute('data-new-styles', '');
            document.head.appendChild(newStyles);
        }
    } else {
        appContainer.innerHTML = ''; // Clear for login view
    }
}

// Add new subject dialog
function addNewSubject() {
    const subjectName = prompt('Enter subject name:');
    if (subjectName) {
        const topics = prompt('Enter topics (comma-separated):');
        const topicsList = topics ? topics.split(',').map(t => t.trim()) : [];
        addSubject(subjectName, topicsList);
    }
}

// View subject details
function viewSubject(subjectName) {
    const subject = userState.studyData.subjects[subjectName];
    if (!subject) return;
    
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div class="subject-header">
            <h2>${subjectName}</h2>
            <div class="subject-actions">
                <button onclick="editSubject('${subjectName}')" class="btn">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="startSubjectStudy('${subjectName}')" class="btn primary">
                    <i class="fas fa-play"></i> Start Studying
                </button>
            </div>
        </div>
        
        <div class="topics-list">
            ${(subject.topics || []).map(topic => `
                <div class="topic-item">
                    <div class="topic-info">
                        <h4>${topic}</h4>
                        <div class="progress-bar">
                            <div class="progress-bar-fill" style="width: 0%"></div>
                        </div>
                    </div>
                    <button onclick="startTopicStudy('${subjectName}', '${topic}')" class="btn-icon">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

// Add function to manage subjects
function addSubject(name, topics = []) {
    if (!userState.isLoggedIn || !userState.studyData) return;
    
    if (!userState.studyData.subjects) {
        userState.studyData.subjects = {};
    }
    
    userState.studyData.subjects[name] = {
        topics,
        progress: 0,
        lastStudied: new Date().toISOString()
    };
    
    saveStudyData(userState.userId, userState.studyData);
    updateAuthUI();
}

// Show admin panel
function showAdminPanel() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="admin-panel">
            <div class="admin-header">
                <h2><i class="fas fa-shield-alt"></i> Admin Panel</h2>
                <div class="admin-nav">
                    <div class="admin-nav-item active" data-section="overview">Overview</div>
                    <div class="admin-nav-item" data-section="users">Users</div>
                    <div class="admin-nav-item" data-section="data">Data Management</div>
                    <div class="admin-nav-item" data-section="settings">Settings</div>
                </div>
            </div>
            <div class="admin-content">
                <div class="admin-section active" data-section="overview">
                    <h3>System Overview</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h4>Total Users</h4>
                            <p>${JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]').length}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Study Sessions</h4>
                            <p>${JSON.parse(localStorage.getItem('studyTrackerSessions') || '[]').length}</p>
                        </div>
                    </div>
                </div>
                <div class="admin-section" data-section="users">
                    <h3>User Management</h3>
                    <div class="user-list">
                        ${createUserList()}
                    </div>
                </div>
                <div class="admin-section" data-section="data">
                    <h3>Data Management</h3>
                    <div class="data-actions">
                        <button onclick="exportData()" class="admin-btn">
                            <i class="fas fa-download"></i> Export Data
                        </button>
                        <button onclick="importData()" class="admin-btn">
                            <i class="fas fa-upload"></i> Import Data
                        </button>
                        <button onclick="resetData()" class="admin-btn danger">
                            <i class="fas fa-trash"></i> Reset Data
                        </button>
                    </div>
                </div>
                <div class="admin-section" data-section="settings">
                    <h3>System Settings</h3>
                    <p>System settings coming soon...</p>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners for navigation
    const navItems = mainContent.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding section
            const targetSection = item.getAttribute('data-section');
            const sections = mainContent.querySelectorAll('.admin-section');
            sections.forEach(section => {
                section.classList.toggle('active', section.getAttribute('data-section') === targetSection);
            });
        });
    });
}

function createUserList() {
    const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
    return users.map(user => `
        <div class="user-item">
            <div class="user-info">
                <div class="user-avatar">${generateInitialsAvatar(user.username)}</div>
                <div class="user-details">
                    <div class="user-name">${user.username}</div>
                    <div class="user-email">${user.email}</div>
                </div>
            </div>
            <div class="user-actions">
                <button class="admin-btn small" onclick="editUser('${user.userId}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="admin-btn small danger" onclick="deleteUser('${user.userId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function showProfile() {
    // Profile view implementation (to be added)
    alert('Profile view coming soon!');
}

function showSettings() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="settings-panel">
            <div class="settings-header">
                <h2><i class="fas fa-cog"></i> Settings</h2>
            </div>
            <div class="settings-content">
                <div class="settings-section">
                    <h3>Profile Settings</h3>
                    <div class="settings-form">
                        <div class="form-group">
                            <label for="display-name">Display Name</label>
                            <input type="text" id="display-name" value="${userState.username}" />
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" value="${userState.email}" readonly />
                        </div>
                        <button class="admin-btn" onclick="updateProfile()">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>Appearance</h3>
                    <div class="theme-selector">
                        <button class="admin-btn" onclick="setTheme('light')">
                            <i class="fas fa-sun"></i> Light Mode
                        </button>
                        <button class="admin-btn" onclick="setTheme('dark')">
                            <i class="fas fa-moon"></i> Dark Mode
                        </button>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>Security</h3>
                    <div class="security-settings">
                        <button class="admin-btn" onclick="changePassword()">
                            <i class="fas fa-key"></i> Change Password
                        </button>
                        <button class="admin-btn" onclick="enable2FA()">
                            <i class="fas fa-shield-alt"></i> Enable 2FA
                        </button>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>Notifications</h3>
                    <div class="notification-settings">
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="email-notifications" />
                                Email Notifications
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="push-notifications" />
                                Push Notifications
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add styles for settings panel
    const settingsStyles = document.createElement('style');
    settingsStyles.textContent = `
        .settings-panel {
            max-width: 800px;
            margin: 0 auto;
            background: var(--card-background);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            overflow: hidden;
        }

        .settings-header {
            padding: var(--spacing-lg);
            border-bottom: 1px solid var(--border-color);
            background: var(--background-color);
        }

        .settings-header h2 {
            margin: 0;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            font-size: 1.5rem;
        }

        .settings-content {
            padding: var(--spacing-lg);
        }

        .settings-section {
            margin-bottom: var(--spacing-xl);
        }

        .settings-section:last-child {
            margin-bottom: 0;
        }

        .settings-section h3 {
            color: var(--text-primary);
            margin: 0 0 var(--spacing-md);
            font-size: 1.2rem;
        }

        .form-group {
            margin-bottom: var(--spacing-md);
        }

        .form-group label {
            display: block;
            margin-bottom: var(--spacing-xs);
            color: var(--text-secondary);
            font-weight: 500;
        }

        .form-group input[type="text"],
        .form-group input[type="email"] {
            width: 100%;
            padding: var(--spacing-sm);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            font-size: 1rem;
            color: var(--text-primary);
            background: var(--background-color);
        }

        .form-group input[type="text"]:focus,
        .form-group input[type="email"]:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
        }

        .form-group input[readonly] {
            background: var(--background-color);
            cursor: not-allowed;
            opacity: 0.7;
        }

        .theme-selector,
        .security-settings {
            display: flex;
            gap: var(--spacing-md);
            margin-top: var(--spacing-sm);
        }

        .notification-settings {
            margin-top: var(--spacing-sm);
        }

        .notification-settings .form-group {
            margin-bottom: var(--spacing-sm);
        }

        .notification-settings label {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            cursor: pointer;
            color: var(--text-primary);
        }

        .notification-settings input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: var(--primary-color);
        }

        @media (max-width: 768px) {
            .theme-selector,
            .security-settings {
                flex-direction: column;
            }

            .admin-btn {
                width: 100%;
            }
        }
    `;

    if (!document.querySelector('style[data-settings-styles]')) {
        settingsStyles.setAttribute('data-settings-styles', '');
        document.head.appendChild(settingsStyles);
    }
}

// Placeholder functions for settings actions
function updateProfile() {
    const displayName = document.getElementById('display-name').value;
    if (displayName && displayName !== userState.username) {
        userState.username = displayName;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        currentUser.username = displayName;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
        const updatedUsers = users.map(u => {
            if (u.userId === userState.userId) {
                return { ...u, username: displayName };
            }
            return u;
        });
        localStorage.setItem('studyTrackerUsers', JSON.stringify(updatedUsers));
        
        updateAuthUI();
        alert('Profile updated successfully!');
    }
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    alert(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied!`);
}

function changePassword() {
    alert('Change password functionality coming soon!');
}

function enable2FA() {
    alert('Two-factor authentication coming soon!');
}

// Add missing functions for admin panel
function exportData() {
    const data = {
        users: JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]'),
        sessions: JSON.parse(localStorage.getItem('studyTrackerSessions') || '[]')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study-tracker-backup.json';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.users && data.sessions) {
                    localStorage.setItem('studyTrackerUsers', JSON.stringify(data.users));
                    localStorage.setItem('studyTrackerSessions', JSON.stringify(data.sessions));
                    alert('Data imported successfully!');
                    window.location.reload();
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function resetData() {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
        localStorage.clear();
        alert('All data has been reset.');
        window.location.reload();
    }
}

function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
    const user = users.find(u => u.userId === userId);
    
    if (!user) {
        alert('User not found');
        return;
    }
    
    const newUsername = prompt('Enter new username:', user.username);
    if (newUsername && newUsername !== user.username) {
        const updatedUsers = users.map(u => {
            if (u.userId === userId) {
                return { ...u, username: newUsername };
            }
            return u;
        });
        
        localStorage.setItem('studyTrackerUsers', JSON.stringify(updatedUsers));
        showAdminPanel(); // Refresh the admin panel
    }
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
        const updatedUsers = users.filter(u => u.userId !== userId);
        localStorage.setItem('studyTrackerUsers', JSON.stringify(updatedUsers));
        showAdminPanel(); // Refresh the admin panel
    }
}

// Add function to update study progress
function updateStudyProgress(conceptName, progress) {
    if (!userState.isLoggedIn || !userState.studyData) return;
    
    userState.studyData.concepts[conceptName].progress = progress;
    if (progress >= 75) {
        userState.studyData.concepts[conceptName].level = 'Advanced';
    } else if (progress >= 50) {
        userState.studyData.concepts[conceptName].level = 'Intermediate';
    } else {
        userState.studyData.concepts[conceptName].level = 'Beginner';
    }
    
    // Save progress
    saveStudyData(userState.userId, userState.studyData);
    
    // Update UI
    updateAuthUI();
}

// Add function to update study goals
function updateStudyGoal(goalId, progress) {
    if (!userState.isLoggedIn || !userState.studyData) return;
    
    const goal = userState.studyData.goals.find(g => g.id === goalId);
    if (goal) {
        goal.current = progress;
        goal.completed = progress >= goal.target;
        
        // Save progress
        saveStudyData(userState.userId, userState.studyData);
        
        // Update UI
        updateAuthUI();
    }
}

// Add function to log study activity
function logStudyActivity(activity) {
    if (!userState.isLoggedIn || !userState.studyData) return;
    
    userState.studyData.activities.unshift({
        ...activity,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 10 activities
    userState.studyData.activities = userState.studyData.activities.slice(0, 10);
    
    // Save activity
    saveStudyData(userState.userId, userState.studyData);
    
    // Update UI
    updateAuthUI();
}