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
    
    // Save to localStorage
    const userInfo = {
        username: user.username,
        email: user.email,
        profilePic: userState.profilePic,
        userId: user.userId
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
    console.log('Login form submitted');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log('Email entered:', email);
    
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
    console.log('Found users:', users.length);
    
    const hashedPassword = hashPassword(password);
    const user = users.find(u => u.email === email && u.hashedPassword === hashedPassword);
    console.log('User found:', !!user);
    
    if (user) {
        console.log('Logging in user:', user.email);
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
});

// User authentication system
const userState = {
    isLoggedIn: false,
    username: '',
    email: '',
    profilePic: '',
    userId: ''
};

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
    
    const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
    
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
    
    users.push(newUser);
    localStorage.setItem('studyTrackerUsers', JSON.stringify(users));
    
    // Auto login after registration
    loginUser(newUser);
    
    // Close registration modal
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.style.display = 'none';
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    userState.isLoggedIn = false;
    userState.username = '';
    userState.email = '';
    userState.profilePic = '';
    userState.userId = '';
    
    redirectToLogin();
}

// Password recovery
function handlePasswordRecovery(event) {
    event.preventDefault();
    console.log('Starting password recovery process');
    
    const email = document.getElementById('recovery-email').value;
    console.log('Recovery email:', email);
    
    const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user) {
        showError('Email not found', 'recovery-error');
        return;
    }
    
    const securityQuestionContainer = document.getElementById('security-question-container');
    const securityQuestionText = document.getElementById('security-question-text');
    const recoveryForm = document.getElementById('recoveryForm');
    const recoverySubmitBtn = document.getElementById('recovery-submit');
    
    if (!securityQuestionContainer || !securityQuestionText || !recoveryForm) {
        console.error('Required recovery elements not found');
        return;
    }
    
    // Show security question
    securityQuestionText.textContent = user.securityQuestion;
    securityQuestionContainer.style.display = 'block';
    
    // Update submit button text
    if (recoverySubmitBtn) {
        recoverySubmitBtn.textContent = 'Reset Password';
    }
    
    // Handle the actual password reset
    recoveryForm.onsubmit = function(e) {
        e.preventDefault();
        console.log('Processing password reset submission');
        
        const answer = document.getElementById('security-answer').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;
        
        if (!answer || !newPassword || !confirmNewPassword) {
            showError('Please fill in all fields', 'recovery-error');
            return;
        }
        
        if (hashPassword(answer.toLowerCase()) !== user.securityAnswer) {
            showError('Incorrect security answer', 'recovery-error');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            showError('Passwords do not match', 'recovery-error');
            return;
        }
        
        if (newPassword.length < 6) {
            showError('Password must be at least 6 characters long', 'recovery-error');
            return;
        }
        
        // Update password
        const updatedUsers = users.map(u => {
            if (u.email === email) {
                return { ...u, hashedPassword: hashPassword(newPassword) };
            }
            return u;
        });
        
        try {
            localStorage.setItem('studyTrackerUsers', JSON.stringify(updatedUsers));
            console.log('Password updated successfully');
            
            // Close recovery modal
            const recoveryModal = document.getElementById('recoveryModal');
            if (recoveryModal) {
                recoveryModal.style.display = 'none';
            }
            
            // Reset form
            recoveryForm.reset();
            securityQuestionContainer.style.display = 'none';
            
            // Show success message and auto-login
            alert('Password updated successfully! Please log in with your new password.');
            
            // Clear any existing error messages
            const errorElement = document.getElementById('recovery-error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
            
            // Redirect to login page
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            console.error('Error updating password:', error);
            showError('An error occurred while updating your password', 'recovery-error');
        }
    };
}

// Update UI based on authentication state
function updateAuthUI() {
    console.log('Updating UI with user state:', userState);
    
    // First, ensure we have a header
    let header = document.querySelector('header');
    if (!header) {
        header = document.createElement('header');
        header.className = 'app-header';
        document.body.insertBefore(header, document.body.firstChild);
        
        // Create app title
        const appTitle = document.createElement('div');
        appTitle.className = 'app-title';
        appTitle.innerHTML = '<i class="fas fa-book"></i> Study Tracker';
        header.appendChild(appTitle);
        
        // Create navigation
        const nav = document.createElement('nav');
        nav.className = 'main-nav';
        nav.innerHTML = `
            <a href="#" class="nav-item active" data-page="dashboard">
                <i class="fas fa-home"></i> Dashboard
            </a>
            <a href="#" class="nav-item" data-page="subjects">
                <i class="fas fa-book-open"></i> Subjects
            </a>
            <a href="#" class="nav-item" data-page="progress">
                <i class="fas fa-chart-line"></i> Progress
            </a>
        `;
        header.appendChild(nav);
        
        // Create header right section
        const headerRight = document.createElement('div');
        headerRight.className = 'header-right';
        header.appendChild(headerRight);
    }
    
    // Ensure we have a header-right section
    let headerRight = header.querySelector('.header-right');
    if (!headerRight) {
        headerRight = document.createElement('div');
        headerRight.className = 'header-right';
        header.appendChild(headerRight);
    }
    
    // Create or update main content area
    let mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        mainContent = document.createElement('div');
        mainContent.className = 'main-content';
        document.body.appendChild(mainContent);
    }
    
    const loginElements = document.querySelectorAll('.login-box, .signup-box, .app-download');
    let userProfileContainer = document.querySelector('.user-profile-container');
    
    if (!userProfileContainer) {
        userProfileContainer = createUserProfileContainer();
        headerRight.appendChild(userProfileContainer);
    }
    
    if (userState.isLoggedIn) {
        // Hide login-related elements
        loginElements.forEach(el => el.style.display = 'none');
        
        // Show and update user profile
        userProfileContainer.style.display = 'flex';
        const userAvatar = userProfileContainer.querySelector('.user-avatar');
        const userName = userProfileContainer.querySelector('.user-name');
        
        if (userAvatar) {
            userAvatar.textContent = userState.profilePic || generateInitialsAvatar(userState.username);
        }
        if (userName) {
            userName.textContent = userState.username;
        }
        
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            :root {
                --primary-color: #2196F3;
                --primary-dark: #1976D2;
                --secondary-color: #FFC107;
                --success-color: #4CAF50;
                --danger-color: #F44336;
                --text-primary: #333333;
                --text-secondary: #666666;
                --background-color: #F5F7FA;
                --card-background: #FFFFFF;
                --border-color: #E0E0E0;
                --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
                --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
                --radius-sm: 4px;
                --radius-md: 8px;
                --spacing-xs: 0.5rem;
                --spacing-sm: 1rem;
                --spacing-md: 1.5rem;
                --spacing-lg: 2rem;
            }

            body {
                background-color: var(--background-color);
                color: var(--text-primary);
                font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                margin: 0;
                padding: 0;
                min-height: 100vh;
            }
            
            .app-header {
                background: var(--card-background);
                padding: 0 var(--spacing-lg);
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                height: 64px;
                box-shadow: var(--shadow-sm);
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
            }
            
            .app-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--primary-color);
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                min-width: 200px;
            }
            
            .main-nav {
                display: flex;
                gap: var(--spacing-sm);
                flex: 1;
            }
            
            .nav-item {
                color: var(--text-secondary);
                text-decoration: none;
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--radius-sm);
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .nav-item:hover {
                color: var(--primary-color);
                background: rgba(33, 150, 243, 0.05);
            }
            
            .nav-item.active {
                color: var(--primary-color);
                background: rgba(33, 150, 243, 0.1);
            }
            
            .user-profile-container {
                position: relative;
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .user-profile-container:hover {
                background: rgba(0, 0, 0, 0.05);
            }
            
            .user-avatar {
                width: 36px;
                height: 36px;
                background: var(--primary-color);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 0.875rem;
            }
            
            .user-name {
                font-weight: 500;
                color: var(--text-primary);
            }
            
            .main-content {
                margin-top: 80px;
                padding: var(--spacing-lg);
                max-width: 1200px;
                margin-left: auto;
                margin-right: auto;
            }
            
            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
            }
            
            .dashboard-card {
                background: var(--card-background);
                border-radius: var(--radius-md);
                padding: var(--spacing-md);
                box-shadow: var(--shadow-sm);
            }
            
            .dashboard-card h3 {
                margin: 0 0 var(--spacing-sm);
                color: var(--text-primary);
                font-size: 1.125rem;
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
            }
            
            .progress-bar {
                height: 8px;
                background: var(--border-color);
                border-radius: 4px;
                margin-top: var(--spacing-xs);
            }
            
            .progress-bar-fill {
                height: 100%;
                background: var(--primary-color);
                border-radius: 4px;
                transition: width 0.3s ease;
            }
            
            @media (max-width: 768px) {
                .app-header {
                    padding: 0 var(--spacing-sm);
                }
                
                .app-title {
                    min-width: auto;
                }
                
                .main-nav {
                    display: none;
                }
                
                .main-content {
                    padding: var(--spacing-sm);
                }
            }
        `;
        
        if (!document.querySelector('style[data-app-styles]')) {
            styles.setAttribute('data-app-styles', '');
            document.head.appendChild(styles);
        }
        
        // Show dashboard content
        mainContent.innerHTML = `
            <div class="dashboard-header">
                <h2>Welcome back, ${userState.username}! 👋</h2>
                <p>Here's your study progress overview</p>
            </div>
            
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3><i class="fas fa-clock"></i> Today's Study Time</h3>
                    <div class="stat-value">2.5 hours</div>
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: 60%;"></div>
                    </div>
                </div>
                
                <div class="dashboard-card">
                    <h3><i class="fas fa-tasks"></i> Tasks Completed</h3>
                    <div class="stat-value">8/12</div>
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: 75%;"></div>
                    </div>
                </div>
                
                <div class="dashboard-card">
                    <h3><i class="fas fa-star"></i> Current Streak</h3>
                    <div class="stat-value">5 days</div>
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: 50%;"></div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-card">
                <h3><i class="fas fa-calendar"></i> Recent Activity</h3>
                <div class="activity-list">
                    <div class="activity-item">
                        <i class="fas fa-book text-primary"></i>
                        <span>Completed Mathematics Chapter 5</span>
                        <span class="activity-time">2 hours ago</span>
                    </div>
                    <div class="activity-item">
                        <i class="fas fa-file-alt text-success"></i>
                        <span>Submitted Physics Assignment</span>
                        <span class="activity-time">Yesterday</span>
                    </div>
                    <div class="activity-item">
                        <i class="fas fa-trophy text-warning"></i>
                        <span>Achieved 3-day study streak</span>
                        <span class="activity-time">2 days ago</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                // Handle page navigation here
            });
        });
        
    } else {
        // Show login-related elements
        loginElements.forEach(el => el.style.display = 'block');
        
        // Hide user profile
        if (userProfileContainer) {
            userProfileContainer.style.display = 'none';
        }
        
        // Clear main content
        mainContent.innerHTML = '';
    }
}

// Create user profile container
function createUserProfileContainer() {
    const container = document.createElement('div');
    container.className = 'user-profile-container';
    
    const profile = document.createElement('div');
    profile.className = 'user-profile';
    
    const avatar = document.createElement('div');
    avatar.className = 'user-avatar';
    avatar.textContent = userState.profilePic || generateInitialsAvatar(userState.username);
    
    const info = document.createElement('div');
    info.className = 'user-info';
    
    const name = document.createElement('div');
    name.className = 'user-name';
    name.textContent = userState.username;
    
    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    dropdown.innerHTML = `
        <div class="dropdown-item" onclick="showProfile()">
            <i class="fas fa-user"></i>
            <span>Profile</span>
        </div>
        <div class="dropdown-item" onclick="showSettings()">
            <i class="fas fa-cog"></i>
            <span>Settings</span>
        </div>
        <div class="dropdown-item" onclick="showAdminPanel()">
            <i class="fas fa-shield-alt"></i>
            <span>Admin Panel</span>
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item" onclick="handleLogout()">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
        </div>
    `;
    
    info.appendChild(name);
    profile.appendChild(avatar);
    profile.appendChild(info);
    container.appendChild(profile);
    container.appendChild(dropdown);
    
    // Toggle dropdown on click
    const toggleDropdown = () => {
        dropdown.classList.toggle('active');
    };
    
    avatar.addEventListener('click', toggleDropdown);
    info.addEventListener('click', toggleDropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    return container;
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