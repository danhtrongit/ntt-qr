// DOM Elements
const generateBtn = document.getElementById('generateBtn');
const validateBtn = document.getElementById('validateBtn');
const refreshStatsBtn = document.getElementById('refreshStatsBtn');
const codeInput = document.getElementById('codeInput');
const codeResult = document.getElementById('codeResult');
const validationResult = document.getElementById('validationResult');
const generatedCode = document.getElementById('generatedCode');
const qrCodeImage = document.getElementById('qrCodeImage');
const validationMessage = document.getElementById('validationMessage');
const codeDetails = document.getElementById('codeDetails');
const totalCodes = document.getElementById('totalCodes');
const usedCodes = document.getElementById('usedCodes');
const unusedCodes = document.getElementById('unusedCodes');

// API Base URL
const API_BASE = '/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load initial statistics
    loadStatistics();
    
    // Set up event listeners
    setupEventListeners();
    
    // Auto-uppercase input
    codeInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
    });
});

// Set up event listeners
function setupEventListeners() {
    generateBtn.addEventListener('click', generateCode);
    validateBtn.addEventListener('click', validateCode);
    refreshStatsBtn.addEventListener('click', loadStatistics);
    
    // Enter key support for validation
    codeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            validateCode();
        }
    });
    
    // Toast close functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('toast-close')) {
            hideToast();
        }
    });
}

// Generate a new promotional code
async function generateCode() {
    setButtonLoading(generateBtn, true);
    hideResult(codeResult);
    
    try {
        const response = await fetch(`${API_BASE}/generate-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Display the generated code
            generatedCode.textContent = data.data.code;
            
            // Generate and display QR code
            await generateQRCode(data.data.code);
            
            // Show result section
            showResult(codeResult);
            
            // Update statistics
            loadStatistics();
            
            // Show success toast
            showToast(data.message, 'success');
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error generating code:', error);
        showToast('Lỗi kết nối. Vui lòng thử lại.', 'error');
    } finally {
        setButtonLoading(generateBtn, false);
    }
}

// Generate QR code for the promotional code
async function generateQRCode(code) {
    try {
        const response = await fetch(`${API_BASE}/qr-code/${code}`);
        const data = await response.json();
        
        if (data.success) {
            qrCodeImage.src = data.qrCode;
            qrCodeImage.alt = `QR Code cho mã ${code}`;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error generating QR code:', error);
        showToast('Lỗi khi tạo QR code', 'error');
    }
}

// Validate a promotional code
async function validateCode() {
    const code = codeInput.value.trim();
    
    if (!code) {
        showToast('Vui lòng nhập mã khuyến mãi', 'error');
        codeInput.focus();
        return;
    }
    
    if (code.length !== 8) {
        showToast('Mã khuyến mãi phải có 8 ký tự', 'error');
        codeInput.focus();
        return;
    }
    
    setButtonLoading(validateBtn, true);
    hideResult(validationResult);
    
    try {
        const response = await fetch(`${API_BASE}/validate-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: code })
        });
        
        const data = await response.json();
        
        // Display validation message
        validationMessage.textContent = data.message;
        validationMessage.className = `message ${data.success ? 'success' : 'error'}`;
        
        // Show code details if available
        if (data.data) {
            displayCodeDetails(data.data);
            showElement(codeDetails);
        } else {
            hideElement(codeDetails);
        }
        
        // Show result section
        showResult(validationResult);
        
        // Clear input if successful
        if (data.success) {
            codeInput.value = '';
            loadStatistics(); // Update statistics
        }
        
        // Show toast notification
        showToast(data.message, data.success ? 'success' : 'error');
        
    } catch (error) {
        console.error('Error validating code:', error);
        showToast('Lỗi kết nối. Vui lòng thử lại.', 'error');
    } finally {
        setButtonLoading(validateBtn, false);
    }
}

// Display code details
function displayCodeDetails(codeData) {
    const createdAt = new Date(codeData.created_at).toLocaleString('vi-VN');
    const usedAt = codeData.used_at ? new Date(codeData.used_at).toLocaleString('vi-VN') : 'Chưa sử dụng';
    
    codeDetails.innerHTML = `
        <h4>Chi tiết mã khuyến mãi:</h4>
        <p><strong>Mã:</strong> ${codeData.code}</p>
        <p><strong>Ngày tạo:</strong> ${createdAt}</p>
        <p><strong>Trạng thái:</strong> ${codeData.is_used ? 'Đã sử dụng' : 'Chưa sử dụng'}</p>
        <p><strong>Ngày sử dụng:</strong> ${usedAt}</p>
    `;
}

// Load and display statistics
async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE}/codes`);
        const data = await response.json();
        
        if (data.success) {
            const codes = data.data;
            const total = codes.length;
            const used = codes.filter(code => code.is_used).length;
            const unused = total - used;
            
            // Update statistics display
            totalCodes.textContent = total;
            usedCodes.textContent = used;
            unusedCodes.textContent = unused;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Utility functions
function setButtonLoading(button, loading) {
    button.disabled = loading;
    const btnText = button.querySelector('.btn-text');
    const loadingText = button.querySelector('.loading');
    
    if (loading) {
        btnText.style.display = 'none';
        loadingText.style.display = 'inline';
    } else {
        btnText.style.display = 'inline';
        loadingText.style.display = 'none';
    }
}

function showResult(element) {
    element.style.display = 'block';
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideResult(element) {
    element.style.display = 'none';
}

function showElement(element) {
    element.style.display = 'block';
}

function hideElement(element) {
    element.style.display = 'none';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(hideToast, 5000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    toast.style.display = 'none';
}

// Format date for Vietnamese locale
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
