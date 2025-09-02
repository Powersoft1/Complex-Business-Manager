// Check if user is authenticated
function isAuthenticated() {
    var authData = JSON.parse(localStorage.getItem('authData'));
    if (!authData) return false;
    
    // Check if 24 hours have passed
    var lastLogin = new Date(authData.timestamp);
    var now = new Date();
    var hoursDiff = Math.abs(now - lastLogin) / 36e5; // hours
    
    return hoursDiff < 24;
}

// Check if user has permission to access specific element
function hasPagePermission() {
    var currentPage = window.location.pathname.split('/').pop();
    // Always allow login page
    if (currentPage === 'login.html') return true;
    
    var user = getCurrentUser();
    if (!user) return false;
    
    // Check if user has permission for this page
    return user.permissions.pages.includes(currentPage) || 
           user.permissions.pages.includes('all') || currentPage === 'index.html' || currentPage === 'login.html' || currentPage === 'profile.html' || currentPage === 'settings.html';
}

// getCurrentUser function to include permissions
function getCurrentUser() {
    // First try to get from localStorage
    var authData = JSON.parse(localStorage.getItem('authData'));
    if (!authData) return null;
    
    // use the existing authData, return authData
    if (authData.email) {
        return {
            email: authData.email,
            name: authData.name || 'Unknown User',
            role: authData.role || 'unknown',
            image: authData.image,
            sign: authData.sign,
            lastLogin: authData.lastLogin ? new Date(authData.lastLogin) : null,
            timestamp: authData.timestamp,
            rememberMe: authData.rememberMe,
            permissions: authData.permissions,
            // Include other properties that might be in authData
            phone: authData.phone,
            id: authData.id
        };
    }

    return null;
}



// Login function
function login(email, password, role, rememberMe) {
    // Find user
    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        if ((user.email === email || user.phone === email) && 
            user.password === password && 
            user.role === role) {
            
            // Update last login
            var now = new Date();
            user.lastLogin = now.toISOString();
            
            // Save to localStorage
            var authData = {
                email: email,
                name: user.name,
                role: role,
                image: user.image,
                sign: user.sign,
                timestamp: now.toISOString(),
                rememberMe: rememberMe,
                lastLogin: user.lastLogin,
                // Store permissions in localStorage too
                permissions: user.permissions,
                // Store other relevant user data
                phone: user.phone,
                id: user.id
            };
            
            localStorage.setItem('authData', JSON.stringify(authData));
            return true;
        }
    }
    return false;
}

// Logout function
function logout() {
    localStorage.removeItem('authData');
    window.location.reload();
}




// @@@@@@@@@@ Main for Auth @@@@@@@@@@@

document.addEventListener('DOMContentLoaded', function() {
    var mainContainer = document.getElementById('app-container');
    var userInfo = document.getElementById('user-info');
    var logoutBtn = document.getElementById('logout-btn');
    
    // Get current page
    var currentPage = window.location.pathname.split('/').pop();
    
    // Special handling for login page
    if (currentPage === 'login.html') {
        // If already authenticated, redirect to index
        
        var authData = JSON.parse(localStorage.getItem('authData'));
    if (!authData) return null;
    
        if (isAuthenticated() && authData.rememberMe) {
            window.location.href = 'index.html';
        }
        // Don't create iframe or check permissions for login page
        return;
    }
    
    // Check authentication for all other pages
    if (!isAuthenticated()) {
        // Hide main container
        if (mainContainer) mainContainer.style.display = 'none';
        
        // Create and show login iframe (except for login page)
        var loginIframe = document.createElement('iframe');
        loginIframe.style.width = '100%';
        loginIframe.style.height = '100vh';
        loginIframe.style.border = 'none';
        loginIframe.style.position = 'fixed';
        loginIframe.style.top = '0';
        loginIframe.style.left = '0';
        document.getElementById('header').style.display = 'none';
        loginIframe.src = 'login.html';
        document.body.appendChild(loginIframe);
    } else {
        // Check page permissions (except for login page)
        if (!hasPagePermission() && currentPage !== 'login.html') {
            
            if (mainContainer) mainContainer.style.display = 'none';
            
            window.location.href = 'index.html'; // Redirect to default page
            return;
        }
        
        // Show main content
        if (mainContainer) mainContainer.style.display = 'block';
       
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        
        // Apply element-level permissions
        applyElementPermissions();
    }
});

// Function to apply element-level permissions
function applyElementPermissions() {
    // Get all elements with class "protect"
    var protectedElements = document.querySelectorAll('.protect');
    var user = getCurrentUser();
    
    if (!user) return;
    
    protectedElements.forEach(function(element) {
        var elementId = element.id;
        
        // If element has no ID, skip it
        if (!elementId) return;
        
        // Check if user has permission for this element
        var hasPermission = user.permissions.elements.includes('all') || 
                          user.permissions.elements.includes(elementId);
        
        if (!hasPermission) {
            // Hide or disable the element based on its type
            if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'BUTTON' || element.tagName === 'TEXTAREA') {
                element.disabled = true;
                element.classList.add('disabled-protected');
            } else {
                element.style.display = 'none';
            }
        } else {
            // Make sure element is visible and enabled if user has permission
            if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'BUTTON' || element.tagName === 'TEXTAREA') {
                element.disabled = false;
                element.classList.remove('disabled-protected');
            } else {
                element.style.display = '';
            }
        }
    });
    
    // Additionally, show any elements that are in user's permissions but might be hidden
    user.permissions.elements.forEach(function(elementId) {
        if (elementId === 'all') return;
        
        var element = document.getElementById(elementId);
        if (element) {
            if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'BUTTON' || element.tagName === 'TEXTAREA') {
                element.disabled = false;
                element.classList.remove('disabled-protected');
            } else {
                element.style.display = '';
            }
        }
    });
}