// Login system for Study Tracker

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
    const userInfo = {
        username: user.username,
        email: user.email,
        profilePic: user.profilePic || generateInitialsAvatar(user.username),
        userId: user.userId
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userInfo));
    console.log('User info saved to localStorage');
    
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
    
    // Modal triggers
    const showRegisterBtn = document.getElementById('showRegisterForm');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const registerModal = document.getElementById('registerModal');
            if (registerModal) {
                registerModal.style.display = 'flex';
            }
        });
    }
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            const recoveryModal = document.getElementById('recoveryModal');
            if (recoveryModal) {
                recoveryModal.style.display = 'flex';
            }
        });
    }
    
    // Close modal functionality
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
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
    
    const email = document.getElementById('recovery-email').value;
    const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user) {
        showError('Email not found', 'recovery-error');
        return;
    }
    
    const securityQuestionContainer = document.getElementById('security-question-container');
    const securityQuestionText = document.getElementById('security-question-text');
    
    securityQuestionText.textContent = user.securityQuestion;
    securityQuestionContainer.style.display = 'block';
    
    const recoveryForm = document.getElementById('recoveryForm');
    recoveryForm.onsubmit = (e) => {
        e.preventDefault();
        
        const answer = document.getElementById('security-answer').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;
        
        if (hashPassword(answer.toLowerCase()) !== user.securityAnswer) {
            showError('Incorrect security answer', 'recovery-error');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            showError('Passwords do not match', 'recovery-error');
            return;
        }
        
        // Update password
        const updatedUsers = users.map(u => {
            if (u.email === email) {
                return { ...u, hashedPassword: hashPassword(newPassword) };
            }
            return u;
        });
        
        localStorage.setItem('studyTrackerUsers', JSON.stringify(updatedUsers));
        
        // Close modal and show success message
        const recoveryModal = document.getElementById('recoveryModal');
        recoveryModal.style.display = 'none';
        alert('Password updated successfully. Please log in with your new password.');
    };
}

// Update UI based on authentication state
function updateAuthUI() {
    const loginElements = document.querySelectorAll('.login-box, .signup-box, .app-download');
    const userProfileContainer = document.querySelector('.user-profile-container') || createUserProfileContainer();
    const authButtons = document.querySelector('.auth-buttons');
    
    if (userState.isLoggedIn) {
        // Hide login-related elements
        loginElements.forEach(el => el.style.display = 'none');
        if (authButtons) authButtons.style.display = 'none';
        
        // Show user profile
        userProfileContainer.style.display = 'flex';
        const userAvatar = userProfileContainer.querySelector('.user-avatar');
        const userName = userProfileContainer.querySelector('.user-name');
        if (userAvatar) userAvatar.textContent = userState.profilePic;
        if (userName) userName.textContent = userState.username;
    } else {
        // Show login-related elements
        loginElements.forEach(el => el.style.display = 'block');
        if (authButtons) authButtons.style.display = 'flex';
        
        // Hide user profile
        userProfileContainer.style.display = 'none';
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
    avatar.textContent = userState.profilePic;
    
    const info = document.createElement('div');
    info.className = 'user-info';
    
    const name = document.createElement('div');
    name.className = 'user-name';
    name.textContent = userState.username;
    
    const actions = document.createElement('div');
    actions.className = 'user-actions';
    
    const profileBtn = document.createElement('button');
    profileBtn.className = 'nav-btn profile-btn';
    profileBtn.innerHTML = '<i class="fas fa-user"></i> Profile';
    profileBtn.onclick = () => showProfile();
    
    const databaseBtn = document.createElement('button');
    databaseBtn.className = 'nav-btn database-btn';
    databaseBtn.innerHTML = '<i class="fas fa-database"></i> Database';
    databaseBtn.onclick = () => showDatabaseView();
    
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'nav-btn settings-btn';
    settingsBtn.innerHTML = '<i class="fas fa-cog"></i> Settings';
    settingsBtn.onclick = () => showSettings();
    
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'nav-btn logout-btn';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    logoutBtn.onclick = () => handleLogout();
    
    actions.appendChild(profileBtn);
    actions.appendChild(databaseBtn);
    actions.appendChild(settingsBtn);
    actions.appendChild(logoutBtn);
    
    info.appendChild(name);
    info.appendChild(actions);
    
    profile.appendChild(avatar);
    profile.appendChild(info);
    
    container.appendChild(profile);
    
    // Add container to header if it doesn't exist
    const headerRight = document.querySelector('.header-right');
    if (headerRight && !headerRight.querySelector('.user-profile-container')) {
        headerRight.insertBefore(container, headerRight.firstChild);
    }
    
    return container;
}

// Show database view
function showDatabaseView() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    // Clear existing content
    mainContent.innerHTML = '';

    // Create database view
    const databaseView = document.createElement('div');
    databaseView.className = 'database-view';

    // Create header
    const header = document.createElement('div');
    header.className = 'database-header';
    header.innerHTML = `
        <h2><i class="fas fa-database"></i> Database Management</h2>
        <div class="database-actions">
            <button class="action-btn"><i class="fas fa-download"></i> Export</button>
            <button class="action-btn"><i class="fas fa-upload"></i> Import</button>
            <button class="action-btn warning"><i class="fas fa-trash"></i> Reset</button>
        </div>
    `;

    // Create tabs
    const tabs = document.createElement('div');
    tabs.className = 'database-tabs';
    tabs.innerHTML = `
        <button class="tab-btn active" data-tab="study-data">Study Data</button>
        <button class="tab-btn" data-tab="user-data">User Data</button>
        <button class="tab-btn" data-tab="app-settings">App Settings</button>
    `;

    // Create content area
    const content = document.createElement('div');
    content.className = 'database-content';

    // Study Data Section
    const studyData = document.createElement('div');
    studyData.className = 'database-section active';
    studyData.setAttribute('data-section', 'study-data');
    studyData.innerHTML = createDataCard('Study Sessions', localStorage.getItem('studyTrackerSessions') || '[]');

    // User Data Section
    const userData = document.createElement('div');
    userData.className = 'database-section';
    userData.setAttribute('data-section', 'user-data');
    const sanitizedUserData = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]').map(user => ({
        ...user,
        hashedPassword: '********' // Hide sensitive data
    }));
    userData.innerHTML = createDataCard('User Accounts', JSON.stringify(sanitizedUserData, null, 2));

    // App Settings Section
    const appSettings = document.createElement('div');
    appSettings.className = 'database-section';
    appSettings.setAttribute('data-section', 'app-settings');
    appSettings.innerHTML = createDataCard('Application Settings', localStorage.getItem('studyTrackerSettings') || '{}');

    // Add all sections to content
    content.appendChild(studyData);
    content.appendChild(userData);
    content.appendChild(appSettings);

    // Add event listeners for tabs
    tabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active tab
            tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show corresponding section
            const targetSection = btn.getAttribute('data-tab');
            content.querySelectorAll('.database-section').forEach(section => {
                section.classList.toggle('active', section.getAttribute('data-section') === targetSection);
            });
        });
    });

    // Add event listeners for actions
    header.querySelector('button:nth-child(1)').addEventListener('click', exportData);
    header.querySelector('button:nth-child(2)').addEventListener('click', importData);
    header.querySelector('button:nth-child(3)').addEventListener('click', resetData);

    // Assemble the view
    databaseView.appendChild(header);
    databaseView.appendChild(tabs);
    databaseView.appendChild(content);
    mainContent.appendChild(databaseView);
}

function createDataCard(title, data) {
    return `
        <div class="data-card">
            <h3><i class="fas fa-table"></i> ${title}</h3>
            <pre>${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</pre>
        </div>
    `;
}

function exportData() {
    const data = {
        sessions: JSON.parse(localStorage.getItem('studyTrackerSessions') || '[]'),
        users: JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]').map(user => ({
            ...user,
            hashedPassword: '********' // Hide sensitive data
        })),
        settings: JSON.parse(localStorage.getItem('studyTrackerSettings') || '{}')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study-tracker-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        try {
            const file = e.target.files[0];
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate data structure
            if (!data.sessions || !data.users || !data.settings) {
                throw new Error('Invalid backup file format');
            }

            // Import data
            localStorage.setItem('studyTrackerSessions', JSON.stringify(data.sessions));
            localStorage.setItem('studyTrackerUsers', JSON.stringify(data.users));
            localStorage.setItem('studyTrackerSettings', JSON.stringify(data.settings));

            // Refresh view
            showDatabaseView();
            alert('Data imported successfully!');
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    };
    input.click();
}

function resetData() {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
        localStorage.clear();
        showDatabaseView();
        alert('All data has been reset.');
    }
}

function showProfile() {
    // Profile view implementation (to be added)
    alert('Profile view coming soon!');
}

function showSettings() {
    // Settings view implementation (to be added)
    alert('Settings view coming soon!');
}