// Validation page functionality
class ValidationPage {
    constructor() {
        this.elements = {
            scannerToggle: document.getElementById('scannerToggle'),
            manualToggle: document.getElementById('manualToggle'),
            scannerSection: document.getElementById('scannerSection'),
            manualSection: document.getElementById('manualSection'),
            startScanBtn: document.getElementById('startScanBtn'),
            stopScanBtn: document.getElementById('stopScanBtn'),
            scannerStatus: document.getElementById('scannerStatus'),
            codeInput: document.getElementById('codeInput'),
            validateBtn: document.getElementById('validateBtn'),
            validationResult: document.getElementById('validationResult'),
            validationMessage: document.getElementById('validationMessage'),
            codeDetails: document.getElementById('codeDetails'),
            noResult: document.getElementById('noResult'),
            validationHistory: document.getElementById('validationHistory'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn')
        };
        
        this.html5QrCode = null;
        this.isScanning = false;
        this.validationHistory = this.loadValidationHistory();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.displayValidationHistory();
    }

    setupEventListeners() {
        // Toggle between scanner and manual input
        this.elements.scannerToggle.addEventListener('click', () => this.showScanner());
        this.elements.manualToggle.addEventListener('click', () => this.showManualInput());
        
        // Scanner controls
        this.elements.startScanBtn.addEventListener('click', () => this.startScanning());
        this.elements.stopScanBtn.addEventListener('click', () => this.stopScanning());
        
        // Manual validation
        this.elements.validateBtn.addEventListener('click', () => this.validateCode());
        this.elements.codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.validateCode();
            }
        });
        
        // Auto-uppercase input
        this.elements.codeInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
        
        // Clear history
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearValidationHistory());
    }

    showScanner() {
        this.elements.scannerSection.classList.remove('hidden');
        this.elements.manualSection.classList.add('hidden');
        this.elements.scannerToggle.classList.remove('btn-outline');
        this.elements.scannerToggle.classList.add('btn-default');
        this.elements.manualToggle.classList.remove('btn-default');
        this.elements.manualToggle.classList.add('btn-outline');
    }

    showManualInput() {
        this.elements.scannerSection.classList.add('hidden');
        this.elements.manualSection.classList.remove('hidden');
        this.elements.scannerToggle.classList.remove('btn-default');
        this.elements.scannerToggle.classList.add('btn-outline');
        this.elements.manualToggle.classList.remove('btn-outline');
        this.elements.manualToggle.classList.add('btn-default');
        
        // Stop scanning if active
        if (this.isScanning) {
            this.stopScanning();
        }
        
        // Focus on input
        setTimeout(() => {
            this.elements.codeInput.focus();
        }, 100);
    }

    async startScanning() {
        try {
            this.html5QrCode = new Html5Qrcode("qr-reader");
            
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };
            
            await this.html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText, decodedResult) => {
                    this.onScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Ignore scan errors - they're normal
                }
            );
            
            this.isScanning = true;
            this.elements.startScanBtn.style.display = 'none';
            this.elements.stopScanBtn.classList.remove('hidden');
            this.updateScannerStatus('Đang quét... Hướng camera vào QR code', 'info');
            
        } catch (err) {
            console.error('Error starting scanner:', err);
            this.updateScannerStatus('Lỗi khi khởi động camera. Vui lòng kiểm tra quyền truy cập camera.', 'error');
        }
    }

    async stopScanning() {
        if (this.html5QrCode && this.isScanning) {
            try {
                await this.html5QrCode.stop();
                this.html5QrCode.clear();
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
        
        this.isScanning = false;
        this.elements.startScanBtn.style.display = 'inline-block';
        this.elements.stopScanBtn.style.display = 'none';
        this.updateScannerStatus('Nhấn "Bắt đầu quét" để kích hoạt camera', 'info');
    }

    updateScannerStatus(message, type) {
        this.elements.scannerStatus.textContent = message;
        this.elements.scannerStatus.className = `scanner-status ${type}`;
    }

    onScanSuccess(decodedText) {
        // Stop scanning after successful scan
        this.stopScanning();
        
        // Validate the scanned code
        this.validateCodeValue(decodedText.toUpperCase());
        
        authManager.showToast(`Đã quét được mã: ${decodedText}`, 'success');
    }

    async validateCode() {
        const code = this.elements.codeInput.value.trim();
        
        if (!code) {
            authManager.showToast('Vui lòng nhập mã khuyến mãi', 'error');
            this.elements.codeInput.focus();
            return;
        }
        
        if (code.length !== 8) {
            authManager.showToast('Mã khuyến mãi phải có 8 ký tự', 'error');
            this.elements.codeInput.focus();
            return;
        }
        
        await this.validateCodeValue(code);
    }

    async validateCodeValue(code) {
        setButtonLoading(this.elements.validateBtn, true);
        hideResult(this.elements.validationResult);
        hideResult(this.elements.noResult);
        
        try {
            const response = await authManager.apiCall('/api/validate-code', {
                method: 'POST',
                body: JSON.stringify({ code: code })
            });
            
            const data = await response.json();
            
            // Display validation message
            this.elements.validationMessage.textContent = data.message;
            this.elements.validationMessage.className = `message ${data.success ? 'success' : 'error'}`;
            
            // Show code details if available
            if (data.data) {
                this.displayCodeDetails(data.data);
                showElement(this.elements.codeDetails);
            } else {
                hideElement(this.elements.codeDetails);
            }
            
            // Show result section
            showResult(this.elements.validationResult);
            
            // Add to validation history
            this.addToValidationHistory({
                code: code,
                success: data.success,
                message: data.message,
                timestamp: new Date().toISOString(),
                details: data.data
            });
            
            // Clear input if successful
            if (data.success) {
                this.elements.codeInput.value = '';
            }
            
            // Show toast notification
            authManager.showToast(data.message, data.success ? 'success' : 'error');
            
        } catch (error) {
            if (error.message !== 'Unauthorized') {
                console.error('Error validating code:', error);
                authManager.showToast('Lỗi kết nối. Vui lòng thử lại.', 'error');
            }
        } finally {
            setButtonLoading(this.elements.validateBtn, false);
        }
    }

    displayCodeDetails(codeData) {
        const createdAt = formatDate(codeData.created_at);
        const usedAt = codeData.used_at ? formatDate(codeData.used_at) : 'Chưa sử dụng';
        
        this.elements.codeDetails.innerHTML = `
            <h4>Chi tiết mã khuyến mãi:</h4>
            <p><strong>Mã:</strong> ${codeData.code}</p>
            <p><strong>Ngày tạo:</strong> ${createdAt}</p>
            <p><strong>Trạng thái:</strong> ${codeData.is_used ? 'Đã sử dụng' : 'Chưa sử dụng'}</p>
            <p><strong>Ngày sử dụng:</strong> ${usedAt}</p>
        `;
    }

    addToValidationHistory(entry) {
        this.validationHistory.unshift(entry);
        
        // Keep only last 50 entries
        if (this.validationHistory.length > 50) {
            this.validationHistory = this.validationHistory.slice(0, 50);
        }
        
        this.saveValidationHistory();
        this.displayValidationHistory();
    }

    displayValidationHistory() {
        if (this.validationHistory.length === 0) {
            this.elements.validationHistory.innerHTML = `
                <div class="flex items-center justify-center py-8 text-muted-foreground">
                    <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Chưa có lịch sử kiểm tra
                </div>
            `;
            return;
        }

        const historyHTML = this.validationHistory.map(entry => {
            const timestamp = formatDate(entry.timestamp);
            const statusBadge = entry.success
                ? '<span class="badge badge-secondary">Hợp lệ</span>'
                : '<span class="badge badge-destructive">Không hợp lệ</span>';

            return `
                <div class="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div class="space-y-1">
                        <div class="font-mono font-semibold">${entry.code}</div>
                        <div class="text-sm text-muted-foreground">${timestamp}</div>
                        <div class="text-sm">${entry.message}</div>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                        ${statusBadge}
                    </div>
                </div>
            `;
        }).join('');

        this.elements.validationHistory.innerHTML = historyHTML;
    }

    loadValidationHistory() {
        try {
            const saved = localStorage.getItem('qr-validation-history');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading validation history:', error);
            return [];
        }
    }

    saveValidationHistory() {
        try {
            localStorage.setItem('qr-validation-history', JSON.stringify(this.validationHistory));
        } catch (error) {
            console.error('Error saving validation history:', error);
        }
    }

    clearValidationHistory() {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử kiểm tra?')) {
            this.validationHistory = [];
            this.saveValidationHistory();
            this.displayValidationHistory();
            authManager.showToast('Đã xóa lịch sử kiểm tra', 'success');
        }
    }
}

// Initialize validation page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth manager to be ready with retry mechanism
    function initValidation() {
        if (window.authManager) {
            new ValidationPage();
        } else {
            setTimeout(initValidation, 50);
        }
    }

    // Start initialization after a short delay
    setTimeout(initValidation, 100);
});
