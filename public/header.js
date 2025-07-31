// Modern Header Component for QR Promotion System
// This file provides a reusable header component with Tailwind CSS styling

class ModernHeader {
    constructor(activePage = '') {
        this.activePage = activePage;
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    getNavigationItems() {
        const items = [
            {
                href: '/dashboard',
                icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v0H8v0z',
                text: 'Trang Chủ',
                id: 'dashboard'
            },
            {
                href: '/validate',
                icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                text: 'Kiểm Tra Mã',
                id: 'validate'
            },
            {
                href: '/change-password',
                icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z',
                text: 'Đổi Mật Khẩu',
                id: 'change-password'
            }
        ];

        return items.map(item => ({
            ...item,
            isActive: this.activePage === item.id
        }));
    }

    generateNavItem(item, isMobile = false) {
        const baseClasses = isMobile 
            ? 'block px-3 py-2 rounded-lg text-base font-medium'
            : 'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200';
        
        const activeClasses = item.isActive
            ? 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';

        return `
            <a href="${item.href}" class="${baseClasses} ${activeClasses}">
                <span class="flex items-center space-x-${isMobile ? '3' : '2'}">
                    <svg class="w-${isMobile ? '5' : '4'} h-${isMobile ? '5' : '4'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"></path>
                    </svg>
                    <span>${item.text}</span>
                </span>
            </a>
        `;
    }

    render() {
        const navItems = this.getNavigationItems();
        
        const headerHTML = `
            <!-- Modern Navigation Header -->
            <header class="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
                <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center h-16">
                        <!-- Logo and Brand -->
                        <div class="flex items-center space-x-4">
                            <div class="flex-shrink-0">
                                <a href="/dashboard" class="flex items-center space-x-3 group">
                                    <div class="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"></path>
                                        </svg>
                                    </div>
                                    <div class="hidden sm:block">
                                        <h1 class="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-200">QR Promotion</h1>
                                        <p class="text-xs text-gray-500 -mt-1">Hệ thống quản lý khuyến mãi</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <!-- Desktop Navigation -->
                        <div class="hidden md:block">
                            <div class="ml-10 flex items-baseline space-x-1">
                                ${navItems.map(item => this.generateNavItem(item, false)).join('')}
                            </div>
                        </div>

                        <!-- User Menu -->
                        <div class="hidden md:block">
                            <div class="ml-4 flex items-center md:ml-6 space-x-4">
                                <!-- User Info -->
                                <div class="flex items-center space-x-3">
                                    <div class="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                    </div>
                                    <div class="hidden lg:block">
                                        <p class="text-sm font-medium text-gray-900">Xin chào!</p>
                                        <p class="text-xs text-gray-500" id="username">Admin</p>
                                    </div>
                                </div>
                                
                                <!-- Logout Button -->
                                <button id="logoutBtn" class="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 hover:shadow-md">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                    </svg>
                                    <span>Đăng Xuất</span>
                                </button>
                            </div>
                        </div>

                        <!-- Mobile menu button -->
                        <div class="md:hidden">
                            <button type="button" class="mobile-menu-button bg-gray-100 inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 transition-all duration-200" aria-controls="mobile-menu" aria-expanded="false">
                                <span class="sr-only">Mở menu chính</span>
                                <svg class="menu-icon block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <svg class="close-icon hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </nav>

                <!-- Mobile menu -->
                <div class="mobile-menu hidden md:hidden bg-white border-t border-gray-200 shadow-lg">
                    <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        ${navItems.map(item => this.generateNavItem(item, true)).join('')}
                    </div>
                    <div class="pt-4 pb-3 border-t border-gray-200">
                        <div class="flex items-center px-5">
                            <div class="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                            <div class="ml-3">
                                <div class="text-base font-medium text-gray-800">Xin chào!</div>
                                <div class="text-sm font-medium text-gray-500" id="username-mobile">Admin</div>
                            </div>
                        </div>
                        <div class="mt-3 px-2 space-y-1">
                            <button id="logoutBtn-mobile" class="w-full text-left bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200">
                                <span class="flex items-center space-x-3">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                    </svg>
                                    <span>Đăng Xuất</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        `;

        // Insert header at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        const mobileMenu = document.querySelector('.mobile-menu');
        const menuIcon = document.querySelector('.menu-icon');
        const closeIcon = document.querySelector('.close-icon');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', function() {
                const isOpen = !mobileMenu.classList.contains('hidden');
                
                if (isOpen) {
                    mobileMenu.classList.add('hidden');
                    menuIcon.classList.remove('hidden');
                    closeIcon.classList.add('hidden');
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                } else {
                    mobileMenu.classList.remove('hidden');
                    menuIcon.classList.add('hidden');
                    closeIcon.classList.remove('hidden');
                    mobileMenuButton.setAttribute('aria-expanded', 'true');
                }
            });
        }
        
        // Handle logout buttons
        const logoutBtn = document.getElementById('logoutBtn');
        const logoutBtnMobile = document.getElementById('logoutBtn-mobile');
        
        [logoutBtn, logoutBtnMobile].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', function() {
                    if (window.authManager) {
                        window.authManager.logout();
                    }
                });
            }
        });
    }
}

// Auto-initialize header based on current page
document.addEventListener('DOMContentLoaded', function() {
    // Determine active page from URL
    const path = window.location.pathname;
    let activePage = '';
    
    if (path === '/dashboard' || path === '/') {
        activePage = 'dashboard';
    } else if (path === '/validate') {
        activePage = 'validate';
    } else if (path === '/change-password') {
        activePage = 'change-password';
    }
    
    // Initialize header
    new ModernHeader(activePage);
});

// Export for manual initialization if needed
window.ModernHeader = ModernHeader;
