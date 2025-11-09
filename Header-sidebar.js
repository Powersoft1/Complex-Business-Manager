// header-sidebar.js - Enhanced Dynamic Header and Sidebar Component
class DynamicHeaderSidebar {
    static init() {
        this.render();
        this.bindEvents();
        this.initializeAuthListener();
    }

    static initializeAuthListener() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.loadUserData(user);
            } else {
                this.setDefaultNavigation();
                this.updateHeaderForGuest();
            }
        });
    }

    static async loadUserData(user) {
        try {
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.updateUserProfile(user, userData);
                this.updateNavigation(userData.role);
                this.updateHeaderForUser();
            } else {
                this.setDefaultNavigation();
                this.updateHeaderForGuest();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.setDefaultNavigation();
            this.updateHeaderForGuest();
        }
    }

    static updateUserProfile(user, userData) {
        const usernameElement = document.querySelector('.username');
        const userRoleElement = document.querySelector('.user-role');
        const profileImageElement = document.querySelector('.profile-image');
        const profileIconElement = document.querySelector('.profile-icon');

        if (usernameElement) {
            usernameElement.textContent = userData.fullName || user.email || 'User';
        }
        
        if (userRoleElement) {
            userRoleElement.textContent = userData.role || 'User';
        }

        if (userData.profileImage && profileImageElement) {
            profileImageElement.src = userData.profileImage;
            profileImageElement.style.display = 'block';
            if (profileIconElement) profileIconElement.style.display = 'none';
        } else if (profileIconElement) {
            // Create avatar from name if no image
            this.createNameAvatar(userData, profileIconElement);
            profileIconElement.style.display = 'flex';
            if (profileImageElement) profileImageElement.style.display = 'none';
        }
    }

    static createNameAvatar(userData, container) {
        const name = userData.fullName || 'User';
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        // Generate a consistent color based on the name
        const colors = [
            '#4361ee', '#3a0ca3', '#7209b7', '#f72585', 
            '#4cc9f0', '#4895ef', '#560bad', '#b5179e'
        ];
        const colorIndex = name.length % colors.length;
        const bgColor = colors[colorIndex];
        
        container.innerHTML = `<span class="name-avatar">${initials}</span>`;
        container.style.backgroundColor = bgColor;
    }

    static updateHeaderForUser() {
        const userProfileLink = document.querySelector('.user-profile-link');
        const loginButton = document.querySelector('.login-button');
        
        if (userProfileLink) {
            userProfileLink.style.display = 'flex';
        }
        if (loginButton) {
            loginButton.style.display = 'none';
        }
    }

    static updateHeaderForGuest() {
        const userProfileLink = document.querySelector('.user-profile-link');
        const loginButton = document.querySelector('.login-button');
        
        if (userProfileLink) {
            userProfileLink.style.display = 'none';
        }
        if (loginButton) {
            loginButton.style.display = 'flex';
        }
    }

    static updateNavigation(userRole) {
        const navContainer = document.getElementById('sidebar-nav');
        if (!navContainer) return;

        let navItems = [];

        // Common items for all users - placed first
        const commonItems = [
            { type: 'divider', label: 'Quick Actions' },
            { icon: 'tachometer-alt', text: 'Dashboard', href: 'index.html' },
            { icon: 'shopping-cart', text: 'Place Order', href: 'orders.html' },
            { icon: 'comments', text: 'Live Chat', href: 'chat-list.html' },
        ];

        // Admin specific items
        if (userRole === 'admin') {
            navItems = [
                ...commonItems,
                { type: 'divider', label: 'Administration' },
                { icon: 'shopping-cart', text: 'Order Management', href: 'order-management.html' },
                { icon: 'users-cog', text: 'User Management', href: 'users-management.html' },
                { icon: 'cog', text: 'System Settings', href: 'settings.html' },
                { icon: 'wallet', text: 'Wallet', href: 'wallet.html' },
                { icon: 'user-plus', text: 'Register Customer / User', href: 'register-customer.html' },
            ];
        } 
        // Customer specific items
        else if (userRole === 'customer') {
            navItems = [
                ...commonItems,
                { type: 'divider', label: 'Customer' },
                { icon: 'history', text: 'Order History', href: 'order-history.html' },
            ];
        }
        // Default items for all users
        else {
            navItems = [
                ...commonItems
            ];
        }

        // Additional common items for all users
        const additionalItems = [
            { type: 'divider', label: 'General' },
            { icon: 'info-circle', text: 'About Us', href: 'about.html' },
            { icon: 'headset', text: 'Contact Support', href: 'contact.html' },
            { type: 'divider', label: 'Account' },
            { icon: 'user', text: 'My Profile', href: 'profile.html' },
            { 
                icon: 'sign-out-alt', 
                text: 'Logout', 
                href: '#',
                onclick: 'DynamicHeaderSidebar.logout()',
                class: 'h-logout-btn'
            }
        ];

        navItems = [...navItems, ...additionalItems];
        navContainer.innerHTML = this.generateNavHTML(navItems);
        this.highlightCurrentPage();
    }

    static setDefaultNavigation() {
        const navContainer = document.getElementById('sidebar-nav');
        if (!navContainer) return;

        const defaultItems = [
            { type: 'divider', label: 'Quick Actions' },
            { icon: 'tachometer-alt', text: 'Dashboard', href: 'index.html' },
            { icon: 'shopping-cart', text: 'Place Order', href: 'orders.html' },
            { type: 'divider', label: 'General' },
            { icon: 'info-circle', text: 'About Us', href: 'about.html' },
            { icon: 'headset', text: 'Contact Support', href: 'contact.html' },
            { type: 'divider', label: 'Account' },
            { icon: 'sign-in-alt', text: 'Login', href: 'login.html' }
        ];

        navContainer.innerHTML = this.generateNavHTML(defaultItems);
        this.highlightCurrentPage();
    }

    static generateNavHTML(navItems) {
        let navHTML = '';
        let previousWasDivider = false;

        navItems.forEach(item => {
            if (item.type === 'divider') {
                // Always add divider at the top of each group
                const label = item.label ? `<span class="divider-label">${item.label}</span>` : '';
                navHTML += `
                    <li class="divider">
                        <hr>
                        ${label}
                    </li>
                `;
                previousWasDivider = true;
            } else {
                const onclickAttr = item.onclick ? `onclick="${item.onclick}"` : '';
                const classAttr = item.class ? `class="${item.class}"` : '';
                navHTML += `
                    <li>
                        <a href="${item.href}" ${onclickAttr} ${classAttr}>
                            <div class="nav-icon">
                                <i class="fas fa-${item.icon}"></i>
                            </div>
                            <span class="nav-text">${item.text}</span>
                            ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
                        </a>
                    </li>
                `;
                previousWasDivider = false;
            }
        });

        return navHTML;
    }

    static render() {
        // Hard-coded business info
        const businessName = "Chindo Communication Ventures";
        const businessLogo = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgzilHzeXCptVuCES4q67O-Vp4crECkk0XTuJyCroJ_7vy_Yt5422lXEV6dC4sK_TTc4dNTY47mPynNMtVBhCui_0izBfjDSVYGpA1mSFL1UeAM4tt1obp-WEdMkjPaUa3_f9v_sYLoqYrCmx9bJH7XKwo63WbH0MZStpmem_nQQujL3UeHAsVnRw6JOuw/s2000/logo9_20_114324.jpeg";

        // Create header HTML
        const headerHTML = `
            <header class="app-header">
                <div class="header-left">
                    <button class="sidebar-toggle" aria-label="Toggle sidebar">
                        <i class="fas fa-bars"></i>
                    </button>
                    <div class="logo-container">
                        <img src="${businessLogo}" alt="${businessName}" class="business-logo">
                        <div class="logo-text">
                            <h1 class="business-name">CCV</h1>
                            <span class="business-tagline">Communication Solutions</span>
                        </div>
                    </div>
                </div>
                <div class="header-right">
                    <a href="profile.html" class="user-profile-link">
                        <div class="user-profile">
                            <div class="user-info">
                                <span class="username">Loading...</span>
                                <span class="user-role">Customer</span>
                            </div>
                            <div class="profile-image-container">
                                <img src="" alt="Profile" class="profile-image">
                                <div class="profile-icon">
                                    <i class="fas fa-user"></i>
                                </div>
                            </div>
                        </div>
                    </a>
                    <a href="login.html" class="login-button">
                        <div class="login-btn">
                            <i class="fas fa-sign-in-alt"></i>
                            <span class="login-text">LOGIN NOW</span>
                        </div>
                    </a>
                </div>
            </header>
        `;

        // Create sidebar HTML
        const sidebarHTML = `
            <aside class="app-sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-logo">
                        <img src="${businessLogo}" alt="${businessName}">
                        <span>${businessName}</span>
                    </div>
                    <div class="refresh-section">
                        <button class="refresh-btn" onclick="DynamicHeaderSidebar.refreshPage()" title="Refresh Page">
                            <div class="refresh-icon">
                                <i class="fas fa-sync-alt"></i>
                            </div>
                            <div class="refresh-text">
                                <span class="refresh-title">Refresh Page</span>
                                <span class="refresh-subtitle">Get latest updates</span>
                            </div>
                        </button>
                    </div>
                </div>
                <nav class="sidebar-nav">
                    <ul id="sidebar-nav">
                        <li class="loading-nav">
                            <div class="nav-loading">
                                <i class="fas fa-spinner fa-spin"></i>
                                <span>Loading navigation...</span>
                            </div>
                        </li>
                    </ul>
                </nav>
                <div class="sidebar-footer">
                    <div class="app-version">v2.1.0</div>
                    <div class="app-status">
                        <i class="fas fa-circle online-dot"></i>
                        <span>System Online <b>(Testing Mode)</b></span>
                    </div>
                </div>
            </aside>
        `;

        // Create overlay
        const overlayHTML = '<div class="sidebar-overlay"></div>';

        // Insert into DOM
        const headerContainer = document.getElementById('header');
        if (headerContainer) {
            headerContainer.innerHTML = headerHTML;
        }

        document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
        document.body.insertAdjacentHTML('afterbegin', overlayHTML);

        this.addStyles();
    }

    static addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        /* Header Styles */
        .app-header {
            background: linear-gradient(135deg, #500804f3, #920f09f3);
            color: white;
            padding: 0 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            height: 60px;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            backdrop-filter: blur(10px);
        }
        
        .header-left, .header-right {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .sidebar-toggle {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0.75rem;
            border-radius: 8px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
        }
        
        .sidebar-toggle:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.05);
        }
        
        .logo-container {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .business-logo {
            width: 45px;
            height: 45px;
            border-radius: 8px;
            object-fit: cover;
            border: 2px solid #ffffffd9;
        }
        
        .logo-text {
            display: flex;
            flex-direction: column;
        }
        
        .business-name {
            font-weight: 700;
            margin: 0;
            line-height: 1.2;
        }
        
        .business-tagline {
            font-size: 0.75rem;
            opacity: 0.9;
            font-weight: 400;
        }
        
        .user-profile-link {
            text-decoration: none;
            color: inherit;
        }
        
        .user-profile {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            padding: 0.3rem 0.75rem;
            border-radius: 25px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        }
        
        .user-profile:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
        }
        
        .user-info {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }
        
        .username {
            font-weight: 600;
            font-size: 0.9rem;
            line-height: 1.2;
        }
        
        .user-role {
            font-size: 0.75rem;
            opacity: 0.8;
            text-transform: capitalize;
        }
        
        .profile-image-container {
            position: relative;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .profile-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: none;
        }
        
        .profile-icon {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #4895ef, #7209b7);
            color: white;
            font-size: 1.2rem;
        }
        
        .name-avatar {
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        /* Login Button Styles - Highly Visible */
        .login-button {
            text-decoration: none;
            color: inherit;
            display: none;
        }
        
        .login-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #2ecc71, #27ae60);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 2px 8px rgba(46, 204, 113, 0.3);
        }
        
        .login-btn:hover {
            background: linear-gradient(135deg, #27ae60, #219653);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(46, 204, 113, 0.4);
        }
        
        .login-btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 6px rgba(46, 204, 113, 0.3);
        }
        
        .login-btn i {
            font-size: 0.9rem;
        }
        
        .login-text {
            font-weight: 600;
            font-size: 0.85rem;
            letter-spacing: 0.3px;
        }
        
        @keyframes pulse-glow {
            0%, 100% {
                box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
            }
            50% {
                box-shadow: 0 4px 20px rgba(46, 204, 113, 0.7);
            }
        }
        
        /* Sidebar Styles */
        .app-sidebar {
            width: 265px;
            background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
            position: fixed;
            top: 60px;
            left: 0;
            bottom: 0;
            z-index: 999;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transform: translateX(-100%);
            border-right: 1px solid #e9ecef;
        }
        
        .sidebar-header {
            padding: 1.5rem 1.5rem 1rem;
            border-bottom: 1px solid #e9ecef;
            background: #ffffff;
        }
        
        .sidebar-logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 700;
            color: #2b2d42;
            margin-bottom: 1rem;
        }
        
        .sidebar-logo img {
            width: 35px;
            height: 35px;
            border-radius: 8px;
        }
        
        /* Refresh Section Styles - Highly Visible */
        .refresh-section {
            margin: 0.75rem 0 0.5rem;
        }
        
        .refresh-btn {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: linear-gradient(135deg, #4361ee, #3a0ca3);
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 8px rgba(67, 97, 238, 0.2);
        }
        
        .refresh-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
        }
        
        .refresh-btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 6px rgba(67, 97, 238, 0.2);
        }
        
        .refresh-icon {
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .refresh-icon i {
            font-size: 0.9rem;
            color: white;
        }
        
        .refresh-text {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            color: white;
        }
        
        .refresh-title {
            font-weight: 600;
            font-size: 0.85rem;
            margin-bottom: 0.1rem;
        }
        
        .refresh-subtitle {
            font-size: 0.7rem;
            opacity: 0.9;
            font-weight: 400;
        }
        
        .sidebar-nav {
            flex: 1;
            overflow-y: auto;
            padding: 1rem 0;
        }
        
        .sidebar-nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .sidebar-nav li {
            margin: 0.25rem 0;
        }
        
        .sidebar-nav a {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.875rem 1.5rem;
            color: #920f09f3;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-left: 4px solid transparent;
            position: relative;
            overflow: hidden;
        }
        
        .sidebar-nav a::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 0;
            background: linear-gradient(90deg, #4895ef, transparent);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0.1;
        }
        
        .sidebar-nav a:hover {
            background: rgba(67, 97, 238, 0.05);
            color: #4361ee;
            border-left-color: #4895ef;
        }
        
        .sidebar-nav a:hover::before {
            width: 100%;
        }
        
        .sidebar-nav li.active a {
            background: rgba(67, 97, 238, 0.1);
            color: #4361ee;
            border-left-color: #4361ee;
            font-weight: 600;
        }
        
        .nav-icon {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .sidebar-nav a:hover .nav-icon {
            transform: scale(1.1);
        }
        
        .nav-text {
            flex: 1;
            font-weight: 500;
            font-size: 0.9rem;
        }
        
        .nav-badge {
            background: #4361ee;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .divider {
            padding: 1rem 1.5rem 0.5rem;
        }
        
        .divider hr {
            border: none;
            border-top: 1px solid #e9ecef;
            margin: 0 0 0.5rem 0;
        }
        
        .divider-label {
            font-size: 0.75rem;
            font-weight: 600;
            color: #8d99ae;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .h-logout-btn {
            color: #e74c3c !important;
        }
        
        .h-logout-btn:hover {
            color: #c0392b !important;
            border-left-color: #e74c3c !important;
        }
        
        .loading-nav {
            padding: 2rem;
            text-align: center;
        }
        
        .nav-loading {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: #8d99ae;
            font-size: 0.9rem;
        }
        
        .sidebar-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid #e9ecef;
            background: #ffffff;
        }
        
        .app-version {
            font-size: 0.75rem;
            color: #8d99ae;
            margin-bottom: 0.5rem;
        }
        
        .app-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8rem;
            color: #8d99ae;
        }
        
        .online-dot {
            color: #2ecc71;
            font-size: 0.5rem;
        }
        
        /* Sidebar open state */
        body.sidebar-open .app-sidebar {
            transform: translateX(0);
        }
        
        /* Main content adjustment */
        .container {
            transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            min-height: calc(100vh - 60px);
            background: #f8f9fa;
        }
        
        body.sidebar-open .container {
            margin-left: 260px;
        }
        
        /* Overlay styles */
        .sidebar-overlay {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 998;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(2px);
        }
        
        body.sidebar-open .sidebar-overlay {
            opacity: 1;
            visibility: visible;
        }
        
        /* Responsive styles */
        @media (min-width: 1024px) {
            .app-sidebar {
                transform: translateX(0);
            }
            
            .container {
                margin-left: 260px;
            }
            
            .sidebar-overlay {
                display: none;
            }
        }
        
        @media (max-width: 1023px) {
            body.sidebar-open .container {
                margin-left: 0;
            }
            
            .user-info {
                display: none;
            }
        }
        
        @media (max-width: 768px) {
            .app-header {
                padding: 0 1rem;
            }
            
            .login-btn {
                padding: 0.4rem 0.8rem;
            }
            
            .login-text {
                font-size: 0.8rem;
            }
        }

        @media (max-width: 480px) {
            .login-btn {
                padding: 0.4rem 0.7rem;
            }
            
            .login-text {
                font-size: 0.75rem;
            }
            
            .login-btn i {
                font-size: 0.8rem;
            }
            
            .refresh-btn {
                padding: 0.6rem;
            }
            
            .refresh-icon {
                width: 28px;
                height: 28px;
            }
            
            .refresh-icon i {
                font-size: 0.8rem;
            }
        }

        /* Scrollbar styling */
        .sidebar-nav::-webkit-scrollbar {
            width: 4px;
        }
        
        .sidebar-nav::-webkit-scrollbar-track {
            background: transparent;
        }
        
        .sidebar-nav::-webkit-scrollbar-thumb {
            background: #e9ecef;
            border-radius: 2px;
        }
        
        .sidebar-nav::-webkit-scrollbar-thumb:hover {
            background: #8d99ae;
        }
    `;
    document.head.appendChild(style);
}

    static bindEvents() {
        // Sidebar toggle
        document.addEventListener('click', (e) => {
            const toggleBtn = e.target.closest('.sidebar-toggle');
            if (toggleBtn) {
                this.toggleSidebar();
            }
        });
        
        // Close sidebar when clicking on overlay
        document.querySelector('.sidebar-overlay').addEventListener('click', () => {
            this.closeSidebar();
        });
        
        // Close sidebar when clicking on nav links on mobile
        if (window.innerWidth < 1024) {
            document.addEventListener('click', (e) => {
                if (e.target.closest('.app-sidebar a') && !e.target.closest('.h-logout-btn')) {
                    this.closeSidebar();
                }
            });
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                document.body.classList.add('sidebar-open');
            } else {
                document.body.classList.remove('sidebar-open');
            }
        });
    }

    static toggleSidebar() {
        document.body.classList.toggle('sidebar-open');
        this.updateToggleIcon();
    }

    static closeSidebar() {
        document.body.classList.remove('sidebar-open');
        this.updateToggleIcon();
    }

    static updateToggleIcon() {
        const icon = document.querySelector('.sidebar-toggle i');
        if (icon) {
            icon.className = document.body.classList.contains('sidebar-open') 
                ? 'fas fa-times' 
                : 'fas fa-bars';
        }
    }

    static highlightCurrentPage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.app-sidebar a').forEach(link => {
            const li = link.parentElement;
            if (link.getAttribute('href') === currentPage) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });
    }

    static refreshPage() {
        // Add visual feedback
        const refreshBtn = document.querySelector('.refresh-btn');
        const refreshIcon = refreshBtn.querySelector('i');
        
        // Store original class
        const originalClass = refreshIcon.className;
        
        // Add spinning animation
        refreshIcon.className = 'fas fa-sync-alt fa-spin';
        refreshBtn.style.opacity = '0.8';
        refreshBtn.style.transform = 'scale(0.95)';
        
        // Reload after a short delay to show the animation
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    static async logout() {
        try {
            await firebase.auth().signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is available
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        DynamicHeaderSidebar.init();
    } else {
        // Wait for Firebase to initialize
        const checkFirebase = setInterval(() => {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                clearInterval(checkFirebase);
                DynamicHeaderSidebar.init();
            }
        }, 100);
    }
});

// Handle window resize on load
window.addEventListener('load', () => {
    if (window.innerWidth >= 1024) {
        document.body.classList.add('sidebar-open');
    }
});

// Export for global access
window.DynamicHeaderSidebar = DynamicHeaderSidebar;
