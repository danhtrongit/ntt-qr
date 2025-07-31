const express = require('express');
const cors = require('cors');
const path = require('path');
const QRCode = require('qrcode');
const session = require('express-session');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3008

// Initialize database
const db = new Database();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'qr-promotion-system-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(express.static('public'));

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.admin) {
        return next();
    } else {
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để tiếp tục'
        });
    }
}

// Initialize database on server start
async function initializeServer() {
    try {
        await db.init();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}

// Routes

// Serve the login page or redirect to dashboard if already logged in
app.get('/', (req, res) => {
    if (req.session && req.session.admin) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

// Serve specific pages
app.get('/login', (req, res) => {
    if (req.session && req.session.admin) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session && req.session.admin) {
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/codes-list', (req, res) => {
    if (req.session && req.session.admin) {
        res.sendFile(path.join(__dirname, 'public', 'codes-list.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/validate', (req, res) => {
    if (req.session && req.session.admin) {
        res.sendFile(path.join(__dirname, 'public', 'validate.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/change-password', (req, res) => {
    if (req.session && req.session.admin) {
        res.sendFile(path.join(__dirname, 'public', 'change-password.html'));
    } else {
        res.redirect('/login');
    }
});

// Debug page (accessible without authentication for troubleshooting)
app.get('/debug', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'debug.html'));
});

// Authentication routes
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên đăng nhập và mật khẩu'
            });
        }

        const result = await db.authenticateAdmin(username, password);

        if (result.success) {
            req.session.admin = result.user;
            res.json({
                success: true,
                message: result.message,
                user: result.user
            });
        } else {
            res.status(401).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi đăng nhập',
            error: error.message
        });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi đăng xuất'
            });
        } else {
            res.json({
                success: true,
                message: 'Đăng xuất thành công'
            });
        }
    });
});

app.post('/api/change-password', requireAuth, async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới và xác nhận mật khẩu không khớp'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
            });
        }

        const result = await db.changeAdminPassword(req.session.admin.username, oldPassword, newPassword);

        if (result.success) {
            res.json({
                success: true,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi đổi mật khẩu',
            error: error.message
        });
    }
});

// Check authentication status
app.get('/api/auth-status', (req, res) => {
    if (req.session && req.session.admin) {
        res.json({
            success: true,
            authenticated: true,
            user: req.session.admin
        });
    } else {
        res.json({
            success: true,
            authenticated: false
        });
    }
});

// Generate a new promotional code
app.post('/api/generate-code', requireAuth, async (req, res) => {
    try {
        const codeData = await db.generateCode();
        
        res.json({
            success: true,
            message: 'Mã khuyến mãi đã được tạo thành công',
            data: codeData
        });
    } catch (error) {
        console.error('Error generating code:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo mã khuyến mãi',
            error: error.message
        });
    }
});

// Generate QR code for a promotional code
app.get('/api/qr-code/:code', requireAuth, async (req, res) => {
    try {
        const { code } = req.params;
        
        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(code, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        res.json({
            success: true,
            message: 'QR code đã được tạo thành công',
            qrCode: qrCodeDataURL,
            code: code
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo QR code',
            error: error.message
        });
    }
});

// Validate a promotional code
app.post('/api/validate-code', requireAuth, async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập mã khuyến mãi'
            });
        }

        const result = await db.validateCode(code.toUpperCase());
        
        if (result.valid) {
            res.json({
                success: true,
                message: result.message,
                data: result.code
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message,
                data: result.code
            });
        }
    } catch (error) {
        console.error('Error validating code:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi kiểm tra mã khuyến mãi',
            error: error.message
        });
    }
});

// Generate QR code as PNG for download
app.get('/api/generate-qr/:code', requireAuth, async (req, res) => {
    try {
        const { code } = req.params;

        // Generate QR code as PNG buffer
        const qrCodeBuffer = await QRCode.toBuffer(code, {
            type: 'png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // Set headers for PNG download
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="qr-code-${code}.png"`);
        res.send(qrCodeBuffer);
    } catch (error) {
        console.error('Error generating QR code PNG:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo QR code PNG',
            error: error.message
        });
    }
});

// Get all promotional codes with pagination and filters
app.get('/api/codes', requireAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || '';
        const sort = req.query.sort || 'created_desc';

        const offset = (page - 1) * limit;

        // Build WHERE clause
        let whereClause = '';
        let params = [];

        if (search) {
            whereClause += ' WHERE code LIKE ?';
            params.push(`%${search}%`);
        }

        if (status) {
            const statusCondition = status === 'used' ? 'is_used = 1' : 'is_used = 0';
            whereClause += whereClause ? ` AND ${statusCondition}` : ` WHERE ${statusCondition}`;
        }

        // Build ORDER BY clause
        let orderClause = '';
        switch (sort) {
            case 'created_asc':
                orderClause = 'ORDER BY created_at ASC';
                break;
            case 'code_asc':
                orderClause = 'ORDER BY code ASC';
                break;
            case 'code_desc':
                orderClause = 'ORDER BY code DESC';
                break;
            default:
                orderClause = 'ORDER BY created_at DESC';
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM promotional_codes${whereClause}`;
        const countResult = await db.query(countQuery, params);
        const total = countResult[0].total;

        // Get paginated codes
        const codesQuery = `
            SELECT id, code, is_used, created_at, used_at
            FROM promotional_codes
            ${whereClause}
            ${orderClause}
            LIMIT ? OFFSET ?
        `;
        const codes = await db.query(codesQuery, [...params, limit, offset]);

        res.json({
            success: true,
            data: {
                codes,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getting codes:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách mã'
        });
    }
});

// Delete a promotional code
app.delete('/api/codes/:id', requireAuth, async (req, res) => {
    try {
        const codeId = req.params.id;

        // Check if code exists
        const existingCode = await db.query('SELECT * FROM promotional_codes WHERE id = ?', [codeId]);
        if (existingCode.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy mã khuyến mãi'
            });
        }

        // Delete the code
        await db.query('DELETE FROM promotional_codes WHERE id = ?', [codeId]);

        res.json({
            success: true,
            message: 'Đã xóa mã khuyến mãi thành công'
        });
    } catch (error) {
        console.error('Error deleting code:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa mã khuyến mãi'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server đang hoạt động bình thường',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi không mong muốn',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Không tìm thấy trang yêu cầu'
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down server...');
    db.close();
    process.exit(0);
});

// Start server
initializeServer().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 QR Promotion System server is running on http://localhost:${PORT}`);
        console.log(`📱 Access the application at http://localhost:${PORT}`);
    });
});

module.exports = app;
