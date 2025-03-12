// Login system for Study Tracker
(function() {
    // Simple SHA-256 hashing (simulated - in a real app, use a proper crypto library)
    function hashPassword(password) {
        // This is a simplified hash function for demonstration
        // In a production app, use a proper crypto library like CryptoJS
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        // Convert to hex string and make sure it's a fixed length
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
        // Check if user is already logged in
        const savedUser = localStorage.getItem('studyTrackerUser');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                userState.isLoggedIn = true;
                userState.username = parsedUser.username;
                userState.email = parsedUser.email;
                userState.profilePic = parsedUser.profilePic || generateInitialsAvatar(parsedUser.username);
                userState.userId = parsedUser.userId;
                
                // Load user-specific data
                loadUserData(userState.userId);
                
                // Update UI with logged in state
                updateAuthUI();
                
                // If we're on the login page, redirect to index
                if (window.location.href.includes('login.html')) {
                    redirectToHome();
                }
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem('studyTrackerUser');
            }
        } else if (!window.location.href.includes('login.html') && 
                  !window.location.href.includes('register.html')) {
            // Not logged in and not on login/register page - redirect to login
            redirectToLogin();
        }
    }

    // Redirect to home page (works with GitHub Pages)
    function redirectToHome() {
        // Get base URL path that works with GitHub Pages
        const basePath = getBasePath();
        window.location.href = basePath + 'index.html';
    }

    // Redirect to login page (works with GitHub Pages)
    function redirectToLogin() {
        // Get base URL path that works with GitHub Pages
        const basePath = getBasePath();
        window.location.href = basePath + 'login.html';
    }

    // Get base path that works with GitHub Pages
    function getBasePath() {
        const pathName = window.location.pathname;
        // Handle GitHub Pages and local development
        if (pathName.includes('github.io')) {
            // For GitHub Pages, get the repository name part of the path
            const pathParts = pathName.split('/');
            // Remove empty strings and the last part (current page)
            const filteredParts = pathParts.filter(part => part !== '');
            if (filteredParts.length > 1) {
                return '/' + filteredParts.slice(0, -1).join('/') + '/';
            }
            return '/';
        } else {
            // Local development or other hosting
            return pathName.endsWith('/') 
                ? pathName 
                : pathName.substring(0, pathName.lastIndexOf('/') + 1);
        }
    }

    // Generate a unique user ID
    function generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Load user-specific data
    function loadUserData(userId) {
        // Load app state from the user-specific key
        const userAppData = localStorage.getItem(`studyTracker_appData_${userId}`);
        if (userAppData) {
            try {
                const parsedData = JSON.parse(userAppData);
                // Update the global appState
                if (window.appState) {
                    window.appState.streak = parsedData.streak || 0;
                    window.appState.lastCompletedDate = parsedData.lastCompletedDate || null;
                    window.appState.tasks = Array.isArray(parsedData.tasks) ? parsedData.tasks : [];
                    window.appState.logs = Array.isArray(parsedData.logs) ? parsedData.logs : [];
                    
                    // Call saveData to refresh the global appData in localStorage
                    if (typeof window.saveData === 'function') {
                        window.saveData();
                    }
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        } else {
            // No data for this user, initialize with empty state
            if (window.appState) {
                window.appState.streak = 0;
                window.appState.lastCompletedDate = null;
                window.appState.tasks = [];
                window.appState.logs = [];
                
                // Call saveData to create the user's app data
                if (typeof window.saveData === 'function') {
                    window.saveData();
                }
            }
        }
    }

    // Override the global saveData function to save user-specific data
    const originalSaveData = window.saveData;
    window.saveData = function() {
        try {
            // Call the original saveData function first
            if (originalSaveData) {
                originalSaveData();
            }
            
            // If a user is logged in, also save to their user-specific key
            if (userState.isLoggedIn && userState.userId) {
                const appData = JSON.parse(localStorage.getItem('appData') || '{}');
                localStorage.setItem(`studyTracker_appData_${userState.userId}`, JSON.stringify(appData));
            }
        } catch (error) {
            console.error('Error in enhanced saveData:', error);
        }
    };

    // Handle user login
    function login(email, password) {
        // Simulate authentication (in a real app, this would validate against a server)
        const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
        const hashedPassword = hashPassword(password);
        const user = users.find(u => u.email === email && u.hashedPassword === hashedPassword);
        
        if (user) {
            // Store logged in user (never store passwords in localStorage for real apps)
            const userInfo = {
                username: user.username,
                email: user.email,
                profilePic: user.profilePic || '',
                userId: user.userId
            };
            
            localStorage.setItem('studyTrackerUser', JSON.stringify(userInfo));
            
            // Update app state
            userState.isLoggedIn = true;
            userState.username = user.username;
            userState.email = user.email;
            userState.profilePic = user.profilePic || generateInitialsAvatar(user.username);
            userState.userId = user.userId;
            
            // Load user-specific data
            loadUserData(user.userId);
            
            // Update UI
            updateAuthUI();
            
            // Redirect to main page
            redirectToHome();
            return true;
        }
        
        return false;
    }

    // Handle user registration
    function register(username, email, password) {
        // Get existing users or initialize empty array
        const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            return { success: false, message: 'Email already registered' };
        }
        
        // Generate a unique user ID
        const userId = generateUserId();
        
        // Add new user with hashed password
        users.push({
            username,
            email,
            hashedPassword: hashPassword(password), // Store hashed password instead of plain text
            profilePic: generateInitialsAvatar(username),
            dateRegistered: new Date().toISOString(),
            userId: userId
        });
        
        // Save updated users array
        localStorage.setItem('studyTrackerUsers', JSON.stringify(users));
        
        // Log in the new user
        login(email, password);
        
        return { success: true };
    }

    // Handle user logout
    function logout() {
        // Before logging out, make sure user data is saved
        if (userState.isLoggedIn && window.appState) {
            const appData = JSON.parse(localStorage.getItem('appData') || '{}');
            localStorage.setItem(`studyTracker_appData_${userState.userId}`, JSON.stringify(appData));
        }
        
        // Clear user data from localStorage
        localStorage.removeItem('studyTrackerUser');
        
        // Reset app state
        userState.isLoggedIn = false;
        userState.username = '';
        userState.email = '';
        userState.profilePic = '';
        userState.userId = '';
        
        // Reset app data to empty state
        if (window.appState) {
            window.appState.streak = 0;
            window.appState.lastCompletedDate = null;
            window.appState.tasks = [];
            window.appState.logs = [];
            
            // Update localStorage with empty state
            localStorage.setItem('appData', JSON.stringify(window.appState));
        }
        
        // Redirect to login page
        redirectToLogin();
    }

    // Update UI based on authentication state
    function updateAuthUI() {
        // Update user info display
        const userInfoElements = document.querySelectorAll('.user-info');
        const loginButtons = document.querySelectorAll('.login-button');
        const logoutButtons = document.querySelectorAll('.logout-button');
        const registerLinks = document.querySelectorAll('.register-link');
        
        if (userState.isLoggedIn) {
            // Show user info
            userInfoElements.forEach(el => {
                if (el.querySelector('.user-avatar')) {
                    if (userState.profilePic.startsWith('data:image')) {
                        el.querySelector('.user-avatar').innerHTML = `<img src="${userState.profilePic}" alt="${userState.username}">`;
                    } else {
                        el.querySelector('.user-avatar').innerHTML = userState.profilePic;
                    }
                }
                if (el.querySelector('.user-name')) {
                    el.querySelector('.user-name').textContent = userState.username;
                }
                el.style.display = 'flex';
            });
            
            // Update feed items attribution
            document.querySelectorAll('.feed-name').forEach(el => {
                el.textContent = userState.username;
            });
            
            // Hide login buttons, show logout
            loginButtons.forEach(el => el.style.display = 'none');
            logoutButtons.forEach(el => el.style.display = 'block');
            registerLinks.forEach(el => el.style.display = 'none');
            
        } else {
            // Hide user info
            userInfoElements.forEach(el => el.style.display = 'none');
            
            // Show login button, hide logout
            loginButtons.forEach(el => el.style.display = 'block');
            logoutButtons.forEach(el => el.style.display = 'none');
            registerLinks.forEach(el => el.style.display = 'block');
        }
    }

    // Generate an avatar with user's initials
    function generateInitialsAvatar(username) {
        if (!username) return 'U';
        
        // Get initials (first letter of first and last name)
        const nameParts = username.trim().split(' ');
        let initials = nameParts[0][0].toUpperCase();
        
        if (nameParts.length > 1) {
            initials += nameParts[nameParts.length - 1][0].toUpperCase();
        }
        
        return initials;
    }

    // Setup event listeners for authentication
    function setupAuthEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                
                const loginResult = login(email, password);
                if (!loginResult) {
                    const errorMsg = document.getElementById('login-error');
                    errorMsg.textContent = 'Invalid email or password';
                    errorMsg.style.display = 'block';
                }
            });
        }
        
        // Forgot password link
        const forgotPasswordLink = document.getElementById('forgot-password-link');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', function(e) {
                e.preventDefault();
                showPasswordRecoveryModal();
            });
        }
        
        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const username = document.getElementById('register-username').value;
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById('register-confirm-password').value;
                
                const errorMsg = document.getElementById('register-error');
                
                // Validate input
                if (password !== confirmPassword) {
                    errorMsg.textContent = 'Passwords do not match';
                    errorMsg.style.display = 'block';
                    return;
                }
                
                if (password.length < 6) {
                    errorMsg.textContent = 'Password must be at least 6 characters';
                    errorMsg.style.display = 'block';
                    return;
                }
                
                // Additional password strength validation
                if (!/[A-Z]/.test(password)) {
                    errorMsg.textContent = 'Password must contain at least one uppercase letter';
                    errorMsg.style.display = 'block';
                    return;
                }
                
                if (!/[0-9]/.test(password)) {
                    errorMsg.textContent = 'Password must contain at least one number';
                    errorMsg.style.display = 'block';
                    return;
                }
                
                const registerResult = register(username, email, password);
                if (!registerResult.success) {
                    errorMsg.textContent = registerResult.message;
                    errorMsg.style.display = 'block';
                }
            });
        }
        
        // Logout buttons
        document.querySelectorAll('.logout-button').forEach(button => {
            button.addEventListener('click', logout);
        });
    }
    
    // Add user management section to settings
    function setupUserSettings() {
        const settingsContainer = document.querySelector('.settings-container');
        if (settingsContainer && userState.isLoggedIn) {
            // Create user settings section if it doesn't exist
            let userSettingsSection = document.getElementById('user-settings-section');
            if (!userSettingsSection) {
                userSettingsSection = document.createElement('div');
                userSettingsSection.id = 'user-settings-section';
                userSettingsSection.className = 'setting-group';
                userSettingsSection.innerHTML = `
                    <h3>User Account</h3>
                    <div class="user-info-settings">
                        <p><strong>Username:</strong> ${userState.username}</p>
                        <p><strong>Email:</strong> ${userState.email}</p>
                    </div>
                    <div class="setting-actions">
                        <button id="change-password-btn" class="secondary-btn">Change Password</button>
                        <button id="export-user-data-btn" class="secondary-btn">Export User Data</button>
                    </div>
                `;
                settingsContainer.appendChild(userSettingsSection);
                
                // Add event listeners for new buttons
                document.getElementById('export-user-data-btn').addEventListener('click', exportUserData);
                document.getElementById('change-password-btn').addEventListener('click', showChangePasswordModal);
            }
        }
    }
    
    // Show change password modal
    function showChangePasswordModal() {
        // Create modal if it doesn't exist
        let passwordModal = document.getElementById('password-change-modal');
        if (!passwordModal) {
            passwordModal = document.createElement('div');
            passwordModal.id = 'password-change-modal';
            passwordModal.className = 'modal';
            passwordModal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Change Password</h2>
                    <div class="password-change-container">
                        <div class="form-group">
                            <label for="current-password">Current Password</label>
                            <input type="password" id="current-password" required>
                        </div>
                        <div class="form-group">
                            <label for="new-password">New Password</label>
                            <input type="password" id="new-password" required>
                            <small>Password must be at least 6 characters with one uppercase letter and one number</small>
                        </div>
                        <div class="form-group">
                            <label for="confirm-new-password">Confirm New Password</label>
                            <input type="password" id="confirm-new-password" required>
                        </div>
                        <p id="password-error" class="error-message"></p>
                        <button id="save-password-btn" class="primary-btn">Save New Password</button>
                    </div>
                </div>
            `;
            document.body.appendChild(passwordModal);
            
            // Add event listeners
            const closeBtn = passwordModal.querySelector('.close-modal');
            closeBtn.addEventListener('click', () => {
                passwordModal.style.display = 'none';
            });
            
            const saveBtn = document.getElementById('save-password-btn');
            saveBtn.addEventListener('click', changePassword);
        }
        
        // Show the modal
        passwordModal.style.display = 'flex';
    }
    
    // Change user password
    function changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;
        const errorElement = document.getElementById('password-error');
        
        // Reset error message
        errorElement.style.display = 'none';
        
        // Validate input
        if (newPassword !== confirmNewPassword) {
            errorElement.textContent = 'New passwords do not match';
            errorElement.style.display = 'block';
            return;
        }
        
        if (newPassword.length < 6) {
            errorElement.textContent = 'Password must be at least 6 characters';
            errorElement.style.display = 'block';
            return;
        }
        
        if (!/[A-Z]/.test(newPassword)) {
            errorElement.textContent = 'Password must contain at least one uppercase letter';
            errorElement.style.display = 'block';
            return;
        }
        
        if (!/[0-9]/.test(newPassword)) {
            errorElement.textContent = 'Password must contain at least one number';
            errorElement.style.display = 'block';
            return;
        }
        
        // Find the current user and verify current password
        const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
        const userIndex = users.findIndex(u => u.email === userState.email && u.hashedPassword === hashPassword(currentPassword));
        
        if (userIndex === -1) {
            errorElement.textContent = 'Current password is incorrect';
            errorElement.style.display = 'block';
            return;
        }
        
        // Update password
        users[userIndex].hashedPassword = hashPassword(newPassword);
        localStorage.setItem('studyTrackerUsers', JSON.stringify(users));
        
        // Close modal and show success message
        document.getElementById('password-change-modal').style.display = 'none';
        alert('Password updated successfully!');
    }
    
    // Export user data
    function exportUserData() {
        const userData = localStorage.getItem(`studyTracker_appData_${userState.userId}`);
        if (!userData) {
            alert('No data to export');
            return;
        }
        
        const dataBlob = new Blob([userData], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `study_tracker_${userState.username.replace(/\s+/g, '_')}_data.json`;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    // Get current user info
    function getCurrentUser() {
        return { 
            isLoggedIn: userState.isLoggedIn,
            username: userState.username,
            email: userState.email,
            profilePic: userState.profilePic,
            userId: userState.userId
        };
    }

    // Show password recovery modal
    function showPasswordRecoveryModal() {
        // Create modal if it doesn't exist
        let recoveryModal = document.getElementById('password-recovery-modal');
        if (!recoveryModal) {
            recoveryModal = document.createElement('div');
            recoveryModal.id = 'password-recovery-modal';
            recoveryModal.className = 'modal';
            recoveryModal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Password Recovery</h2>
                    <div id="recovery-step-1" class="recovery-step">
                        <p>Enter your email address to recover your password:</p>
                        <div class="form-group">
                            <label for="recovery-email">Email</label>
                            <input type="email" id="recovery-email" required>
                        </div>
                        <p id="recovery-error" class="error-message"></p>
                        <button id="find-account-btn" class="primary-btn">Find Account</button>
                    </div>
                    <div id="recovery-step-2" class="recovery-step" style="display:none;">
                        <p>Please answer your security question:</p>
                        <div class="form-group">
                            <label id="security-question-label">Security Question</label>
                            <input type="text" id="security-answer" required>
                        </div>
                        <p id="recovery-answer-error" class="error-message"></p>
                        <button id="verify-answer-btn" class="primary-btn">Verify Answer</button>
                    </div>
                    <div id="recovery-step-3" class="recovery-step" style="display:none;">
                        <p>Create a new password:</p>
                        <div class="form-group">
                            <label for="new-recovery-password">New Password</label>
                            <input type="password" id="new-recovery-password" required>
                            <small>Password must be at least 6 characters with one uppercase letter and one number</small>
                        </div>
                        <div class="form-group">
                            <label for="confirm-recovery-password">Confirm New Password</label>
                            <input type="password" id="confirm-recovery-password" required>
                        </div>
                        <p id="recovery-password-error" class="error-message"></p>
                        <button id="reset-password-btn" class="primary-btn">Reset Password</button>
                    </div>
                    <div id="recovery-step-4" class="recovery-step" style="display:none;">
                        <div class="success-message">
                            <i class="fas fa-check-circle"></i>
                            <h3>Password Reset Successful!</h3>
                            <p>Your password has been reset. You can now log in with your new password.</p>
                            <button id="back-to-login-btn" class="primary-btn">Back to Login</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(recoveryModal);
            
            // Add event listeners for recovery
            const closeBtn = recoveryModal.querySelector('.close-modal');
            closeBtn.addEventListener('click', () => {
                recoveryModal.style.display = 'none';
            });
            
            // Step 1: Find account
            document.getElementById('find-account-btn').addEventListener('click', findUserAccount);
            
            // Step 2: Verify security answer
            document.getElementById('verify-answer-btn').addEventListener('click', verifySecurityAnswer);
            
            // Step 3: Reset password
            document.getElementById('reset-password-btn').addEventListener('click', resetPassword);
            
            // Step 4: Back to login
            document.getElementById('back-to-login-btn').addEventListener('click', () => {
                recoveryModal.style.display = 'none';
            });
        }
        
        // Show the modal and reset to step 1
        recoveryModal.style.display = 'flex';
        document.getElementById('recovery-step-1').style.display = 'block';
        document.getElementById('recovery-step-2').style.display = 'none';
        document.getElementById('recovery-step-3').style.display = 'none';
        document.getElementById('recovery-step-4').style.display = 'none';
        document.getElementById('recovery-email').value = '';
        document.getElementById('recovery-error').style.display = 'none';
    }
    
    // Find user account for password recovery
    function findUserAccount() {
        const email = document.getElementById('recovery-email').value;
        const errorElement = document.getElementById('recovery-error');
        errorElement.style.display = 'none';
        
        // Find user with the provided email
        const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
        const user = users.find(u => u.email === email);
        
        if (!user) {
            errorElement.textContent = 'No account found with this email address';
            errorElement.style.display = 'block';
            return;
        }
        
        // Move to step 2 and create a security question
        document.getElementById('recovery-step-1').style.display = 'none';
        document.getElementById('recovery-step-2').style.display = 'block';
        
        // Generate a security question based on the user's data
        let securityQuestion;
        if (user.dateRegistered) {
            // Ask when they registered (make it a bit easier by only asking for the date)
            const registrationDate = new Date(user.dateRegistered);
            const formattedDate = registrationDate.toLocaleDateString();
            securityQuestion = `What date did you register your account? (Format: ${new Date().toLocaleDateString().replace(/\d+/g, '#')})`;
            
            // Store the expected answer for validation
            recoveryModal.dataset.expectedAnswer = formattedDate;
        } else {
            // Fallback question based on username
            securityQuestion = `What is your username?`;
            recoveryModal.dataset.expectedAnswer = user.username;
        }
        
        // Store the user email for future reference
        recoveryModal.dataset.recoveryEmail = email;
        
        // Update the question in the UI
        document.getElementById('security-question-label').textContent = securityQuestion;
    }
    
    // Verify security answer
    function verifySecurityAnswer() {
        const userAnswer = document.getElementById('security-answer').value;
        const expectedAnswer = document.getElementById('password-recovery-modal').dataset.expectedAnswer;
        const errorElement = document.getElementById('recovery-answer-error');
        errorElement.style.display = 'none';
        
        if (!userAnswer || userAnswer.trim() !== expectedAnswer) {
            errorElement.textContent = 'Incorrect answer. Please try again.';
            errorElement.style.display = 'block';
            return;
        }
        
        // Move to step 3 for password reset
        document.getElementById('recovery-step-2').style.display = 'none';
        document.getElementById('recovery-step-3').style.display = 'block';
    }
    
    // Reset password
    function resetPassword() {
        const newPassword = document.getElementById('new-recovery-password').value;
        const confirmPassword = document.getElementById('confirm-recovery-password').value;
        const errorElement = document.getElementById('recovery-password-error');
        errorElement.style.display = 'none';
        
        // Validate passwords
        if (newPassword !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            errorElement.style.display = 'block';
            return;
        }
        
        if (newPassword.length < 6) {
            errorElement.textContent = 'Password must be at least 6 characters';
            errorElement.style.display = 'block';
            return;
        }
        
        if (!/[A-Z]/.test(newPassword)) {
            errorElement.textContent = 'Password must contain at least one uppercase letter';
            errorElement.style.display = 'block';
            return;
        }
        
        if (!/[0-9]/.test(newPassword)) {
            errorElement.textContent = 'Password must contain at least one number';
            errorElement.style.display = 'block';
            return;
        }
        
        // Get the user email from the data attribute
        const email = document.getElementById('password-recovery-modal').dataset.recoveryEmail;
        
        // Update the user's password in storage
        const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
        const userIndex = users.findIndex(u => u.email === email);
        
        if (userIndex !== -1) {
            // Update with hashed password
            users[userIndex].hashedPassword = hashPassword(newPassword);
            localStorage.setItem('studyTrackerUsers', JSON.stringify(users));
            
            // Show success message
            document.getElementById('recovery-step-3').style.display = 'none';
            document.getElementById('recovery-step-4').style.display = 'block';
        } else {
            errorElement.textContent = 'An error occurred. Please try again.';
            errorElement.style.display = 'block';
        }
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initAuth();
            setupAuthEvents();
            setTimeout(setupUserSettings, 1000); // Delay to ensure settings modal is loaded
        });
    } else {
        initAuth();
        setupAuthEvents();
        setTimeout(setupUserSettings, 1000); // Delay to ensure settings modal is loaded
    }
    
    // Export authentication functions to global scope
    window.studyTrackerAuth = {
        login,
        logout,
        register,
        getCurrentUser,
        exportUserData,
        showChangePasswordModal,
        showPasswordRecoveryModal
    };
})(); 