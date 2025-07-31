// Change password functionality
class ChangePasswordPage {
    constructor() {
        this.elements = {
            changePasswordForm: document.getElementById('changePasswordForm'),
            oldPassword: document.getElementById('oldPassword'),
            newPassword: document.getElementById('newPassword'),
            confirmPassword: document.getElementById('confirmPassword'),
            changePasswordBtn: document.getElementById('changePasswordBtn'),
            cancelBtn: document.getElementById('cancelBtn'),
            errorMessage: document.getElementById('errorMessage'),
            passwordForm: document.getElementById('passwordForm'),
            successSection: document.getElementById('successSection'),
            backToDashboardBtn: document.getElementById('backToDashboardBtn'),
            passwordStrength: document.getElementById('passwordStrength'),
            strengthFill: document.getElementById('strengthFill'),
            strengthText: document.getElementById('strengthText')
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Form submission
        this.elements.changePasswordForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Cancel button
        this.elements.cancelBtn.addEventListener('click', () => this.handleCancel());
        
        // Back to dashboard button
        this.elements.backToDashboardBtn.addEventListener('click', () => {
            window.location.href = '/dashboard';
        });
        
        // Password strength indicator
        this.elements.newPassword.addEventListener('input', () => this.updatePasswordStrength());
        
        // Real-time validation
        this.elements.confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const oldPassword = this.elements.oldPassword.value;
        const newPassword = this.elements.newPassword.value;
        const confirmPassword = this.elements.confirmPassword.value;
        
        // Client-side validation
        if (!this.validateForm(oldPassword, newPassword, confirmPassword)) {
            return;
        }
        
        setButtonLoading(this.elements.changePasswordBtn, true);
        this.hideError();
        
        try {
            const response = await authManager.apiCall('/api/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                    confirmPassword
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccess();
                authManager.showToast(data.message, 'success');
            } else {
                this.showError(data.message);
            }
        } catch (error) {
            if (error.message !== 'Unauthorized') {
                console.error('Error changing password:', error);
                this.showError('Lỗi kết nối. Vui lòng thử lại.');
            }
        } finally {
            setButtonLoading(this.elements.changePasswordBtn, false);
        }
    }

    validateForm(oldPassword, newPassword, confirmPassword) {
        if (!oldPassword) {
            this.showError('Vui lòng nhập mật khẩu hiện tại');
            this.elements.oldPassword.focus();
            return false;
        }
        
        if (!newPassword) {
            this.showError('Vui lòng nhập mật khẩu mới');
            this.elements.newPassword.focus();
            return false;
        }
        
        if (newPassword.length < 6) {
            this.showError('Mật khẩu mới phải có ít nhất 6 ký tự');
            this.elements.newPassword.focus();
            return false;
        }
        
        if (!confirmPassword) {
            this.showError('Vui lòng xác nhận mật khẩu mới');
            this.elements.confirmPassword.focus();
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            this.showError('Mật khẩu mới và xác nhận mật khẩu không khớp');
            this.elements.confirmPassword.focus();
            return false;
        }
        
        if (oldPassword === newPassword) {
            this.showError('Mật khẩu mới phải khác với mật khẩu hiện tại');
            this.elements.newPassword.focus();
            return false;
        }
        
        return true;
    }

    updatePasswordStrength() {
        const password = this.elements.newPassword.value;
        
        if (!password) {
            this.elements.passwordStrength.style.display = 'none';
            return;
        }
        
        this.elements.passwordStrength.style.display = 'block';
        
        const strength = this.calculatePasswordStrength(password);
        
        // Update strength bar
        this.elements.strengthFill.className = `strength-fill strength-${strength.level}`;
        this.elements.strengthText.textContent = strength.text;
        this.elements.strengthText.style.color = strength.color;
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];
        
        // Length check
        if (password.length >= 8) score += 2;
        else if (password.length >= 6) score += 1;
        else feedback.push('Quá ngắn');
        
        // Character variety checks
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        
        // Determine strength level
        if (score < 3) {
            return { level: 'weak', text: 'Yếu', color: '#f56565' };
        } else if (score < 4) {
            return { level: 'fair', text: 'Trung bình', color: '#ed8936' };
        } else if (score < 6) {
            return { level: 'good', text: 'Tốt', color: '#ecc94b' };
        } else {
            return { level: 'strong', text: 'Mạnh', color: '#48bb78' };
        }
    }

    validatePasswordMatch() {
        const newPassword = this.elements.newPassword.value;
        const confirmPassword = this.elements.confirmPassword.value;
        
        if (confirmPassword && newPassword !== confirmPassword) {
            this.elements.confirmPassword.style.borderColor = '#f56565';
        } else {
            this.elements.confirmPassword.style.borderColor = '#e2e8f0';
        }
    }

    handleCancel() {
        if (this.hasUnsavedChanges()) {
            if (confirm('Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.')) {
                window.location.href = '/dashboard';
            }
        } else {
            window.location.href = '/dashboard';
        }
    }

    hasUnsavedChanges() {
        return this.elements.oldPassword.value || 
               this.elements.newPassword.value || 
               this.elements.confirmPassword.value;
    }

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.style.display = 'block';
        this.elements.errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    hideError() {
        this.elements.errorMessage.style.display = 'none';
    }

    showSuccess() {
        this.elements.passwordForm.style.display = 'none';
        this.elements.successSection.style.display = 'block';
        
        // Scroll to success section
        this.elements.successSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    resetForm() {
        this.elements.changePasswordForm.reset();
        this.elements.passwordStrength.style.display = 'none';
        this.hideError();
        
        // Reset input border colors
        [this.elements.oldPassword, this.elements.newPassword, this.elements.confirmPassword].forEach(input => {
            input.style.borderColor = '#e2e8f0';
        });
    }
}

// Initialize change password page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth manager to be ready with retry mechanism
    function initChangePassword() {
        if (window.authManager) {
            new ChangePasswordPage();
        } else {
            setTimeout(initChangePassword, 50);
        }
    }

    // Start initialization after a short delay
    setTimeout(initChangePassword, 100);
});
