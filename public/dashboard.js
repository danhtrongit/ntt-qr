// Dashboard functionality
class Dashboard {
    constructor() {
        this.elements = {
            generateBtn: document.getElementById('generateBtn'),
            refreshStatsBtn: document.getElementById('refreshStatsBtn'),
            printQRBtn: document.getElementById('printQRBtn'),
            downloadQRBtn: document.getElementById('downloadQRBtn'),
            codeResult: document.getElementById('codeResult'),
            generatedCode: document.getElementById('generatedCode'),
            qrCodeImage: document.getElementById('qrCodeImage'),
            totalCodes: document.getElementById('totalCodes'),
            usedCodes: document.getElementById('usedCodes'),
            unusedCodes: document.getElementById('unusedCodes'),
            usageRate: document.getElementById('usageRate'),
            recentCodes: document.getElementById('recentCodes')
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
    }

    setupEventListeners() {
        if (this.elements.generateBtn) {
            this.elements.generateBtn.addEventListener('click', () => this.generateCode());
        }
        
        if (this.elements.refreshStatsBtn) {
            this.elements.refreshStatsBtn.addEventListener('click', () => this.loadStatistics());
        }
        
        if (this.elements.printQRBtn) {
            this.elements.printQRBtn.addEventListener('click', () => this.printQRCode());
        }
        
        if (this.elements.downloadQRBtn) {
            this.elements.downloadQRBtn.addEventListener('click', () => this.downloadQRCode());
        }
    }

    async loadInitialData() {
        await this.loadStatistics();
        await this.loadRecentCodes();
    }

    async generateCode() {
        setButtonLoading(this.elements.generateBtn, true);
        hideResult(this.elements.codeResult);
        
        try {
            const response = await authManager.apiCall('/api/generate-code', {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Display the generated code
                this.elements.generatedCode.textContent = data.data.code;
                
                // Generate and display QR code
                await this.generateQRCode(data.data.code);
                
                // Show result section
                showResult(this.elements.codeResult);
                
                // Update statistics and recent codes
                this.loadStatistics();
                this.loadRecentCodes();
                
                // Show success toast
                authManager.showToast(data.message, 'success');
            } else {
                authManager.showToast(data.message, 'error');
            }
        } catch (error) {
            if (error.message !== 'Unauthorized') {
                console.error('Error generating code:', error);
                authManager.showToast('Lỗi kết nối. Vui lòng thử lại.', 'error');
            }
        } finally {
            setButtonLoading(this.elements.generateBtn, false);
        }
    }

    async generateQRCode(code) {
        try {
            const response = await authManager.apiCall(`/api/qr-code/${code}`);
            const data = await response.json();
            
            if (data.success) {
                this.elements.qrCodeImage.src = data.qrCode;
                this.elements.qrCodeImage.alt = `QR Code cho mã ${code}`;
                this.currentQRData = data.qrCode;
                this.currentCode = code;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            if (error.message !== 'Unauthorized') {
                console.error('Error generating QR code:', error);
                authManager.showToast('Lỗi khi tạo QR code', 'error');
            }
        }
    }

    async loadStatistics() {
        try {
            const response = await authManager.apiCall('/api/codes');
            const data = await response.json();
            
            if (data.success) {
                const codes = data.data;
                const total = codes.length;
                const used = codes.filter(code => code.is_used).length;
                const unused = total - used;
                const usageRate = total > 0 ? Math.round((used / total) * 100) : 0;
                
                // Update statistics display
                this.elements.totalCodes.textContent = total;
                this.elements.usedCodes.textContent = used;
                this.elements.unusedCodes.textContent = unused;
                this.elements.usageRate.textContent = `${usageRate}%`;
            }
        } catch (error) {
            if (error.message !== 'Unauthorized') {
                console.error('Error loading statistics:', error);
            }
        }
    }

    async loadRecentCodes() {
        try {
            const response = await authManager.apiCall('/api/codes');
            const data = await response.json();
            
            if (data.success) {
                const codes = data.data.slice(0, 10); // Get latest 10 codes
                this.displayRecentCodes(codes);
            }
        } catch (error) {
            if (error.message !== 'Unauthorized') {
                console.error('Error loading recent codes:', error);
                this.elements.recentCodes.innerHTML = '<p style="color: #f56565;">Lỗi khi tải dữ liệu</p>';
            }
        }
    }

    displayRecentCodes(codes) {
        if (codes.length === 0) {
            this.elements.recentCodes.innerHTML = '<p style="color: #718096; font-style: italic;">Chưa có mã nào được tạo</p>';
            return;
        }

        const codesHTML = codes.map(code => {
            const createdAt = formatDate(code.created_at);
            const usedAt = code.used_at ? formatDate(code.used_at) : null;
            const statusClass = code.is_used ? 'error' : 'success';
            const statusText = code.is_used ? 'Đã sử dụng' : 'Chưa sử dụng';
            
            return `
                <div class="history-item ${statusClass}">
                    <div class="history-time">${createdAt}</div>
                    <div class="history-code">${code.code}</div>
                    <div class="history-message">
                        Trạng thái: ${statusText}
                        ${usedAt ? `<br>Sử dụng lúc: ${usedAt}` : ''}
                    </div>
                </div>
            `;
        }).join('');

        this.elements.recentCodes.innerHTML = codesHTML;
    }

    printQRCode() {
        if (!this.currentQRData || !this.currentCode) {
            authManager.showToast('Không có QR code để in', 'error');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>In QR Code - ${this.currentCode}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 20px;
                    }
                    .qr-print {
                        max-width: 400px;
                        margin: 0 auto;
                    }
                    .qr-code {
                        border: 2px solid #333;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .code-text {
                        font-size: 24px;
                        font-weight: bold;
                        margin: 20px 0;
                        letter-spacing: 3px;
                    }
                    @media print {
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="qr-print">
                    <h1>Mã Khuyến Mãi</h1>
                    <div class="code-text">${this.currentCode}</div>
                    <div class="qr-code">
                        <img src="${this.currentQRData}" alt="QR Code" style="max-width: 100%;" />
                    </div>
                    <p>Quét mã QR hoặc nhập mã để sử dụng khuyến mãi</p>
                    <p><small>Hệ Thống Mã Khuyến Mãi QR</small></p>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    downloadQRCode() {
        if (!this.currentQRData || !this.currentCode) {
            authManager.showToast('Không có QR code để tải về', 'error');
            return;
        }

        const link = document.createElement('a');
        link.download = `QR-Code-${this.currentCode}.png`;
        link.href = this.currentQRData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        authManager.showToast('QR code đã được tải về', 'success');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth manager to be ready with retry mechanism
    function initDashboard() {
        if (window.authManager) {
            new Dashboard();
        } else {
            setTimeout(initDashboard, 50);
        }
    }

    // Start initialization after a short delay
    setTimeout(initDashboard, 100);
});
