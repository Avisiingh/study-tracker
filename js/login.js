// Login system for Study Tracker
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
    const hashedPassword = hashPassword(password);
    const user = users.find(u => u.email === email && u.hashedPassword === hashedPassword);
    
    if (user) {
        const userInfo = {
            username: user.username,
            email: user.email,
            profilePic: user.profilePic || generateInitialsAvatar(user.username),
            userId: user.userId
        };
        
        sessionStorage.setItem('studyTrackerUser', JSON.stringify(userInfo));
        userState.isLoggedIn = true;
        userState.username = user.username;
        userState.email = user.email;
        userState.profilePic = user.profilePic || generateInitialsAvatar(user.username);
        userState.userId = user.userId;
        
        updateAuthUI();
        
        // Redirect after a short delay to allow UI update
        setTimeout(() => {
            window.location.href = window.location.pathname.includes('github.io') 
                ? '/study-tracker/index.html'
                : '/index.html';
        }, 500);
    } else {
        showError('Invalid email or password');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Simple SHA-256 hashing (simulated - in a real app, use a proper crypto library)
    function hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    // User authentication state
    const userState = {
        isLoggedIn: false,
        username: '',
        email: '',
        profilePic: '',
        userId: ''
    };

    // Initialize authentication
    function initAuth() {
        const savedUser = sessionStorage.getItem('studyTrackerUser');
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
                }
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                sessionStorage.removeItem('studyTrackerUser');
            }
        } else if (!window.location.href.includes('login.html')) {
            redirectToLogin();
        }
    }

    // Handle user login
    function login(email, password) {
        const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
        const hashedPassword = hashPassword(password);
        const user = users.find(u => u.email === email && u.hashedPassword === hashedPassword);
        
        if (user) {
            const userInfo = {
                username: user.username,
                email: user.email,
                profilePic: user.profilePic || generateInitialsAvatar(user.username),
                userId: user.userId
            };
            
            sessionStorage.setItem('studyTrackerUser', JSON.stringify(userInfo));
            userState.isLoggedIn = true;
            userState.username = user.username;
            userState.email = user.email;
            userState.profilePic = user.profilePic || generateInitialsAvatar(user.username);
            userState.userId = user.userId;
            
            redirectToHome();
            return true;
        }
        
        return false;
    }

    // Handle form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Show error message
    function showError(message, elementId = 'login-error') {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    // Redirect functions
    function redirectToHome() {
        const basePath = window.location.pathname.includes('github.io') 
            ? '/study-tracker/'
            : '/';
        window.location.href = basePath + 'index.html';
    }

    function redirectToLogin() {
        const basePath = window.location.pathname.includes('github.io')
            ? '/study-tracker/'
            : '/';
        window.location.href = basePath + 'login.html';
    }

    // Generate initials avatar
    function generateInitialsAvatar(username) {
        if (!username) return 'U';
        const nameParts = username.trim().split(' ');
        let initials = nameParts[0][0].toUpperCase();
        if (nameParts.length > 1) {
            initials += nameParts[nameParts.length - 1][0].toUpperCase();
        }
        return initials;
    }

    // Setup other event listeners
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            const recoveryModal = document.getElementById('recoveryModal');
            if (recoveryModal) {
                recoveryModal.style.display = 'flex';
            }
        });
    }

    const showRegisterBtn = document.getElementById('showRegisterForm');
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const registerModal = document.getElementById('registerModal');
            if (registerModal) {
                registerModal.style.display = 'flex';
            }
        });
    }

    // Close modal functionality
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Update UI based on authentication state
    function updateAuthUI() {
        const loginElements = document.querySelectorAll('.login-box, .signup-box, .app-download');
        const userProfileContainer = document.querySelector('.user-profile-container') || createUserProfileContainer(userState);

        if (userState.isLoggedIn) {
            // Hide login-related elements
            loginElements.forEach(el => el.style.display = 'none');
            
            // Show user profile
            userProfileContainer.style.display = 'flex';
            const userAvatar = userProfileContainer.querySelector('.user-avatar');
            const userName = userProfileContainer.querySelector('.user-name');
            if (userAvatar) userAvatar.textContent = userState.profilePic;
            if (userName) userName.textContent = userState.username;
        } else {
            // Show login-related elements
            loginElements.forEach(el => el.style.display = 'block');
            
            // Hide user profile
            userProfileContainer.style.display = 'none';
        }
    }

    // Create user profile container
    function createUserProfileContainer(user) {
        const container = document.createElement('div');
        container.className = 'user-profile-container';

        const profile = document.createElement('div');
        profile.className = 'user-profile';

        const avatar = document.createElement('div');
        avatar.className = 'user-avatar';
        avatar.textContent = user.username.charAt(0).toUpperCase();

        const info = document.createElement('div');
        info.className = 'user-info';

        const name = document.createElement('div');
        name.className = 'user-name';
        name.textContent = user.username;

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

    // Initialize when DOM is ready
    initAuth();
    updateAuthUI();
});