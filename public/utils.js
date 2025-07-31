// Utility functions for QR Promotion System
// This file provides common utilities and ensures proper initialization

// Global state management
window.QRSystem = {
    authManager: null,
    initialized: false,
    initCallbacks: []
};

// Wait for auth manager to be ready
function waitForAuthManager() {
    return new Promise((resolve) => {
        if (window.QRSystem.authManager) {
            resolve(window.QRSystem.authManager);
        } else {
            window.QRSystem.initCallbacks.push(resolve);
        }
    });
}

// Initialize the system
function initializeQRSystem() {
    if (window.QRSystem.initialized) return;
    
    // Wait for DOM and auth manager
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeQRSystem);
        return;
    }
    
    // Check if authManager is available
    if (window.authManager) {
        window.QRSystem.authManager = window.authManager;
        window.QRSystem.initialized = true;
        
        // Call all waiting callbacks
        window.QRSystem.initCallbacks.forEach(callback => {
            callback(window.authManager);
        });
        window.QRSystem.initCallbacks = [];
        
        console.log('✅ QR System initialized successfully');
    } else {
        // Retry after a short delay
        setTimeout(initializeQRSystem, 50);
    }
}

// Safe API call wrapper
async function safeApiCall(url, options = {}) {
    const authManager = await waitForAuthManager();
    return authManager.apiCall(url, options);
}

// Safe toast wrapper
async function safeShowToast(message, type = 'info') {
    const authManager = await waitForAuthManager();
    return authManager.showToast(message, type);
}

// Button loading state management
function setButtonLoading(button, loading) {
    if (!button) return;
    
    button.disabled = loading;
    const btnText = button.querySelector('.btn-text');
    const loadingText = button.querySelector('.loading');
    
    if (btnText && loadingText) {
        if (loading) {
            btnText.style.display = 'none';
            loadingText.style.display = 'inline';
        } else {
            btnText.style.display = 'inline';
            loadingText.style.display = 'none';
        }
    }
}

// Element visibility helpers
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

// Date formatting
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

// Error handling wrapper
function handleError(error, defaultMessage = 'Đã xảy ra lỗi không mong muốn') {
    console.error('Error:', error);
    
    if (error.message === 'Unauthorized') {
        // Don't show toast for unauthorized errors as auth manager handles redirect
        return;
    }
    
    const message = error.message || defaultMessage;
    safeShowToast(message, 'error');
}

// Initialize page-specific functionality
function initializePage(pageInitializer) {
    // Wait for both DOM and auth manager
    Promise.all([
        new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        }),
        waitForAuthManager()
    ]).then(() => {
        try {
            pageInitializer();
            console.log('✅ Page initialized successfully');
        } catch (error) {
            console.error('❌ Page initialization failed:', error);
            handleError(error, 'Lỗi khởi tạo trang');
        }
    });
}

// Export functions to global scope
window.waitForAuthManager = waitForAuthManager;
window.safeApiCall = safeApiCall;
window.safeShowToast = safeShowToast;
window.setButtonLoading = setButtonLoading;
window.showResult = showResult;
window.hideResult = hideResult;
window.showElement = showElement;
window.hideElement = hideElement;
window.formatDate = formatDate;
window.handleError = handleError;
window.initializePage = initializePage;

// Start initialization
initializeQRSystem();
