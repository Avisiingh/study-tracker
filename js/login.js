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
    // First, ensure we have a header
    let header = document.querySelector('header');
    if (!header) {
        header = document.createElement('header');
        header.className = 'app-header';
        document.body.insertBefore(header, document.body.firstChild);
        
        // Create app title
        const appTitle = document.createElement('div');
        appTitle.className = 'app-title';
        appTitle.innerHTML = '<i class="fas fa-book-reader"></i> Study Tracker';
        appTitle.onclick = () => redirectToHome();
        header.appendChild(appTitle);
        
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
        headerRight.insertBefore(userProfileContainer, headerRight.firstChild);
    }
    
    console.log('Updating UI with user state:', userState);
    
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
        
        // Add header styles
        const headerStyles = document.createElement('style');
        headerStyles.textContent = `
            :root {
                --primary-color: #4a90e2;
                --primary-dark: #357abd;
                --secondary-color: #6c757d;
                --success-color: #28a745;
                --danger-color: #dc3545;
                --warning-color: #ffc107;
                --info-color: #17a2b8;
                --background-color: #f8f9fa;
                --card-background: #ffffff;
                --text-primary: #333333;
                --text-secondary: #666666;
                --text-muted: #999999;
                --border-color: #e9ecef;
                --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
                --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
                --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
                --radius-sm: 4px;
                --radius-md: 8px;
                --radius-lg: 12px;
                --spacing-xs: 0.25rem;
                --spacing-sm: 0.5rem;
                --spacing-md: 1rem;
                --spacing-lg: 1.5rem;
                --spacing-xl: 2rem;
            }

            body {
                background-color: var(--background-color);
                color: var(--text-primary);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.5;
                margin: 0;
                padding: 0;
            }
            
            .app-header {
                background: var(--card-background);
                padding: var(--spacing-md) var(--spacing-xl);
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: var(--shadow-md);
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                height: 60px;
            }
            
            .app-title {
                font-size: 1.5rem;
                font-weight: 600;
                color: var(--primary-color);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                cursor: pointer;
                transition: color 0.2s;
            }

            .app-title:hover {
                color: var(--primary-dark);
            }
            
            .user-profile-container {
                position: relative;
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
            }
            
            .user-avatar {
                width: 40px;
                height: 40px;
                background: var(--primary-color);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s, background-color 0.2s;
            }

            .user-avatar:hover {
                transform: scale(1.05);
                background: var(--primary-dark);
            }
            
            .user-info {
                display: flex;
                flex-direction: column;
                cursor: pointer;
            }
            
            .user-name {
                font-weight: 600;
                color: var(--text-primary);
            }
            
            .user-dropdown {
                position: absolute;
                top: calc(100% + var(--spacing-sm));
                right: 0;
                background: var(--card-background);
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-lg);
                min-width: 220px;
                display: none;
                z-index: 1000;
                border: 1px solid var(--border-color);
                overflow: hidden;
            }
            
            .user-dropdown.active {
                display: block;
                animation: dropdownFadeIn 0.2s ease-out;
            }
            
            @keyframes dropdownFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .dropdown-item {
                padding: var(--spacing-md);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                color: var(--text-primary);
                text-decoration: none;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .dropdown-item:hover {
                background: var(--background-color);
                color: var(--primary-color);
            }

            .dropdown-item i {
                width: 20px;
                color: var(--primary-color);
                transition: transform 0.2s;
            }

            .dropdown-item:hover i {
                transform: translateX(2px);
            }
            
            .dropdown-divider {
                height: 1px;
                background: var(--border-color);
                margin: 0;
            }
            
            .main-content {
                margin-top: 80px;
                padding: var(--spacing-xl);
                max-width: 1200px;
                margin-left: auto;
                margin-right: auto;
            }

            .welcome-message {
                text-align: center;
                padding: var(--spacing-xl);
                background: var(--card-background);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-md);
                margin-bottom: var(--spacing-xl);
            }

            .welcome-message h1 {
                color: var(--text-primary);
                margin-bottom: var(--spacing-md);
                font-size: 2rem;
            }

            .welcome-message p {
                color: var(--text-secondary);
                font-size: 1.1rem;
                margin: 0;
            }
            
            .admin-panel {
                background: var(--card-background);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-md);
                overflow: hidden;
            }
            
            .admin-header {
                padding: var(--spacing-lg);
                border-bottom: 1px solid var(--border-color);
                background: var(--background-color);
            }
            
            .admin-header h2 {
                margin: 0;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                font-size: 1.5rem;
            }
            
            .admin-content {
                padding: var(--spacing-lg);
            }
            
            .admin-section {
                display: none;
            }
            
            .admin-section.active {
                display: block;
                animation: sectionFadeIn 0.3s ease-out;
            }

            @keyframes sectionFadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            
            .admin-nav {
                display: flex;
                gap: var(--spacing-md);
                margin-top: var(--spacing-md);
                border-bottom: 1px solid var(--border-color);
                padding-bottom: var(--spacing-sm);
            }
            
            .admin-nav-item {
                padding: var(--spacing-sm) var(--spacing-md);
                border-radius: var(--radius-sm);
                cursor: pointer;
                color: var(--text-secondary);
                transition: all 0.2s;
                font-weight: 500;
            }
            
            .admin-nav-item:hover {
                color: var(--primary-color);
                background: rgba(74, 144, 226, 0.1);
            }
            
            .admin-nav-item.active {
                background: var(--primary-color);
                color: white;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: var(--spacing-md);
                margin-top: var(--spacing-lg);
            }

            .stat-card {
                background: var(--background-color);
                padding: var(--spacing-lg);
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-sm);
                text-align: center;
            }

            .stat-card h4 {
                color: var(--text-secondary);
                margin: 0 0 var(--spacing-sm);
                font-size: 1rem;
            }

            .stat-card p {
                color: var(--text-primary);
                font-size: 2rem;
                font-weight: 600;
                margin: 0;
            }

            .user-list {
                display: grid;
                gap: var(--spacing-md);
                margin-top: var(--spacing-lg);
            }

            .user-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--spacing-md);
                background: var(--background-color);
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-sm);
            }

            .user-item .user-info {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
            }

            .user-item .user-avatar {
                width: 36px;
                height: 36px;
                font-size: 0.9rem;
            }

            .user-item .user-details {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-xs);
            }

            .user-item .user-name {
                font-weight: 600;
                color: var(--text-primary);
            }

            .user-item .user-email {
                color: var(--text-secondary);
                font-size: 0.9rem;
            }

            .user-actions {
                display: flex;
                gap: var(--spacing-sm);
            }

            .admin-btn {
                padding: var(--spacing-sm) var(--spacing-md);
                border: none;
                border-radius: var(--radius-sm);
                background: var(--primary-color);
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                font-size: 0.9rem;
                transition: all 0.2s;
            }

            .admin-btn:hover {
                background: var(--primary-dark);
                transform: translateY(-1px);
            }

            .admin-btn.small {
                padding: var(--spacing-xs) var(--spacing-sm);
            }

            .admin-btn.danger {
                background: var(--danger-color);
            }

            .admin-btn.danger:hover {
                background: #c82333;
            }

            .data-actions {
                display: flex;
                gap: var(--spacing-md);
                margin-top: var(--spacing-lg);
            }

            @media (max-width: 768px) {
                .app-header {
                    padding: var(--spacing-md);
                }

                .main-content {
                    padding: var(--spacing-md);
                }

                .stats-grid {
                    grid-template-columns: 1fr;
                }

                .admin-nav {
                    flex-wrap: wrap;
                }

                .data-actions {
                    flex-direction: column;
                }

                .user-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: var(--spacing-md);
                }

                .user-actions {
                    width: 100%;
                    justify-content: flex-end;
                }
            }
        `;
        
        if (!document.querySelector('style[data-header-styles]')) {
            headerStyles.setAttribute('data-header-styles', '');
            document.head.appendChild(headerStyles);
        }
        
        // Show welcome message in main content if not in admin view
        if (!document.querySelector('.admin-panel')) {
            mainContent.innerHTML = `
                <div class="welcome-message">
                    <h1>Welcome back, ${userState.username}! 👋</h1>
                    <p>Ready to continue your learning journey? Track your study progress and maintain your streak.</p>
                </div>
                <div class="quick-actions">
                    <!-- Add quick action buttons here -->
                </div>
            `;
        }
    } else {
        // Show login-related elements
        loginElements.forEach(el => el.style.display = 'block');
        
        // Hide user profile
        if (userProfileContainer) {
            userProfileContainer.style.display = 'none';
        }
        
        // Clear main content
        if (mainContent) {
            mainContent.innerHTML = '';
        }
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