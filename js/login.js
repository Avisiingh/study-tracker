// Login system for Study Tracker
(function() {
    // User authentication state
    const userState = {
        isLoggedIn: false,
        username: '',
        email: '',
        profilePic: ''
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
                
                // Update UI with logged in state
                updateAuthUI();
                
                // If we're on the login page, redirect to index
                if (window.location.pathname.includes('login.html')) {
                    window.location.href = 'index.html';
                }
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem('studyTrackerUser');
            }
        } else if (!window.location.pathname.includes('login.html') && 
                  !window.location.pathname.includes('register.html')) {
            // Not logged in and not on login/register page - redirect to login
            window.location.href = 'login.html';
        }
    }

    // Handle user login
    function login(email, password) {
        // Simulate authentication (in a real app, this would validate against a server)
        const users = JSON.parse(localStorage.getItem('studyTrackerUsers') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Store logged in user (never store passwords in localStorage for real apps)
            const userInfo = {
                username: user.username,
                email: user.email,
                profilePic: user.profilePic || ''
            };
            
            localStorage.setItem('studyTrackerUser', JSON.stringify(userInfo));
            
            // Update app state
            userState.isLoggedIn = true;
            userState.username = user.username;
            userState.email = user.email;
            userState.profilePic = user.profilePic || generateInitialsAvatar(user.username);
            
            // Update UI
            updateAuthUI();
            
            // Redirect to main page
            window.location.href = 'index.html';
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
        
        // Add new user
        users.push({
            username,
            email,
            password, // In a real app, NEVER store passwords in plain text
            profilePic: generateInitialsAvatar(username),
            dateRegistered: new Date().toISOString()
        });
        
        // Save updated users array
        localStorage.setItem('studyTrackerUsers', JSON.stringify(users));
        
        // Log in the new user
        login(email, password);
        
        return { success: true };
    }

    // Handle user logout
    function logout() {
        // Clear user data from localStorage
        localStorage.removeItem('studyTrackerUser');
        
        // Reset app state
        userState.isLoggedIn = false;
        userState.username = '';
        userState.email = '';
        userState.profilePic = '';
        
        // Redirect to login page
        window.location.href = 'login.html';
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
    
    // Get current user info
    function getCurrentUser() {
        return { 
            isLoggedIn: userState.isLoggedIn,
            username: userState.username,
            email: userState.email,
            profilePic: userState.profilePic
        };
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initAuth();
            setupAuthEvents();
        });
    } else {
        initAuth();
        setupAuthEvents();
    }
    
    // Export authentication functions to global scope
    window.studyTrackerAuth = {
        login,
        logout,
        register,
        getCurrentUser
    };
})(); 