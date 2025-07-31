// Shared authentication utilities
class AuthManager {
    constructor() {
        this.user = null;
        this.init();
    }

    async init() {
        await this.checkAuthStatus();
        this.setupLogoutHandler();
        this.updateUserDisplay();
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/auth-status', {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.authenticated) {
                this.user = data.user;
                return true;
            } else {
                this.user = null;
                // Redirect to login if on protected page
                if (this.isProtectedPage()) {
                    window.location.href = '/login';
                }
                return false;
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.user = null;
            return false;
        }
    }

    isProtectedPage() {
        const protectedPaths = ['/dashboard', '/validate', '/change-password'];
        return protectedPaths.some(path => window.location.pathname === path);
    }

    setupLogoutHandler() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.logout.bind(this));
        }
    }

    async logout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();
            
            if (data.success) {
                this.user = null;
                this.showToast('Đăng xuất thành công', 'success');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
            } else {
                this.showToast('Lỗi khi đăng xuất', 'error');
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showToast('Lỗi kết nối khi đăng xuất', 'error');
        }
    }

    updateUserDisplay() {
        const usernameElements = document.querySelectorAll('#username');
        usernameElements.forEach(element => {
            if (this.user) {
                element.textContent = this.user.username;
            }
        });
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        const toastMessage = toast.querySelector('.toast-message');
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => this.hideToast(), 5000);
    }

    hideToast() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.style.display = 'none';
        }
    }

    // Utility method for making authenticated API calls
    async apiCall(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include'
        };

        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (response.status === 401) {
            // Unauthorized - redirect to login
            this.showToast('Phiên đăng nhập đã hết hạn', 'error');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
            throw new Error('Unauthorized');
        }

        return response;
    }
}

// Utility functions for common UI operations
function setButtonLoading(button, loading) {
    if (!button) return;
    
    button.disabled = loading;
    const btnText = button.querySelector('.btn-text');
    const loadingText = button.querySelector('.loading');
    
    if (btnText && loadingText) {
        if (loading) {
            btnText.style.display = 'none';
            loadingText.style.display = 'inline-flex';
        } else {
            btnText.style.display = 'inline-flex';
            loadingText.style.display = 'none';
        }
    }
}

function showResult(element) {
    if (element) {
        element.style.display = 'block';
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function hideResult(element) {
    if (element) {
        element.style.display = 'none';
    }
}

function showElement(element) {
    if (element) {
        element.style.display = 'block';
    }
}

function hideElement(element) {
    if (element) {
        element.style.display = 'none';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Initialize auth manager when DOM is loaded
let authManager;
document.addEventListener('DOMContentLoaded', function() {
    authManager = new AuthManager();

    // Export for use in other scripts after initialization
    window.authManager = authManager;

    // Set up toast close functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('toast-close')) {
            authManager.hideToast();
        }
    });
});

// Export utility functions immediately
window.setButtonLoading = setButtonLoading;
window.showResult = showResult;
window.hideResult = hideResult;
window.showElement = showElement;
window.hideElement = hideElement;
window.formatDate = formatDate;
