const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Database file path
const DB_PATH = path.join(__dirname, 'promotion_codes.db');

class Database {
    constructor() {
        this.db = null;
    }

    // Initialize database connection and create tables
    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    this.createTables()
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        });
    }

    // Create promotional codes and admin tables
    async createTables() {
        return new Promise((resolve, reject) => {
            const createCodesTableSQL = `
                CREATE TABLE IF NOT EXISTS promotional_codes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    code TEXT UNIQUE NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    is_used BOOLEAN DEFAULT 0,
                    used_at DATETIME NULL
                )
            `;

            const createAdminTableSQL = `
                CREATE TABLE IF NOT EXISTS admin_users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            this.db.run(createCodesTableSQL, (err) => {
                if (err) {
                    console.error('Error creating promotional codes table:', err.message);
                    reject(err);
                    return;
                }
                console.log('Promotional codes table created successfully');

                this.db.run(createAdminTableSQL, (err) => {
                    if (err) {
                        console.error('Error creating admin table:', err.message);
                        reject(err);
                        return;
                    }
                    console.log('Admin users table created successfully');

                    // Create default admin user if not exists
                    this.createDefaultAdmin()
                        .then(() => resolve())
                        .catch(reject);
                });
            });
        });
    }

    // Generate and save a new promotional code
    async generateCode() {
        return new Promise((resolve, reject) => {
            // Generate a unique 8-character code
            const code = this.generateUniqueCode();
            
            const insertSQL = `INSERT INTO promotional_codes (code) VALUES (?)`;
            
            this.db.run(insertSQL, [code], function(err) {
                if (err) {
                    console.error('Error inserting code:', err.message);
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        code: code,
                        created_at: new Date().toISOString(),
                        is_used: false
                    });
                }
            });
        });
    }

    // Validate and mark a promotional code as used
    async validateCode(code) {
        return new Promise((resolve, reject) => {
            // First, check if code exists and is not used
            const selectSQL = `SELECT * FROM promotional_codes WHERE code = ?`;
            
            this.db.get(selectSQL, [code], (err, row) => {
                if (err) {
                    console.error('Error querying code:', err.message);
                    reject(err);
                    return;
                }

                if (!row) {
                    // Code doesn't exist
                    resolve({ 
                        valid: false, 
                        message: 'Mã khuyến mãi không tồn tại',
                        code: null 
                    });
                    return;
                }

                if (row.is_used) {
                    // Code already used
                    resolve({ 
                        valid: false, 
                        message: 'Mã khuyến mãi đã được sử dụng',
                        code: row 
                    });
                    return;
                }

                // Code is valid, mark as used
                const updateSQL = `UPDATE promotional_codes SET is_used = 1, used_at = CURRENT_TIMESTAMP WHERE code = ?`;
                
                this.db.run(updateSQL, [code], function(err) {
                    if (err) {
                        console.error('Error updating code:', err.message);
                        reject(err);
                    } else {
                        resolve({ 
                            valid: true, 
                            message: 'Mã khuyến mãi hợp lệ! Áp dụng thành công.',
                            code: { ...row, is_used: true, used_at: new Date().toISOString() }
                        });
                    }
                });
            });
        });
    }

    // Generic query method for flexible database operations
    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            // Determine if this is a SELECT query or not
            const isSelect = sql.trim().toLowerCase().startsWith('select');

            if (isSelect) {
                // For SELECT queries, use db.all to get all rows
                this.db.all(sql, params, (err, rows) => {
                    if (err) {
                        console.error('Error executing query:', err.message);
                        reject(err);
                        return;
                    }
                    resolve(rows);
                });
            } else {
                // For INSERT, UPDATE, DELETE queries, use db.run
                this.db.run(sql, params, function(err) {
                    if (err) {
                        console.error('Error executing query:', err.message);
                        reject(err);
                        return;
                    }
                    resolve({
                        lastID: this.lastID,
                        changes: this.changes
                    });
                });
            }
        });
    }

    // Get all promotional codes (for admin purposes)
    async getAllCodes() {
        return new Promise((resolve, reject) => {
            const selectSQL = `SELECT * FROM promotional_codes ORDER BY created_at DESC`;

            this.db.all(selectSQL, [], (err, rows) => {
                if (err) {
                    console.error('Error fetching codes:', err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Create default admin user
    async createDefaultAdmin() {
        return new Promise(async (resolve, reject) => {
            try {
                // Check if admin already exists
                const checkSQL = `SELECT * FROM admin_users WHERE username = ?`;
                this.db.get(checkSQL, ['admin'], async (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (!row) {
                        // Create default admin user
                        const hashedPassword = await bcrypt.hash('Thien.28', 10);
                        const insertSQL = `INSERT INTO admin_users (username, password) VALUES (?, ?)`;

                        this.db.run(insertSQL, ['admin', hashedPassword], function(err) {
                            if (err) {
                                console.error('Error creating default admin:', err.message);
                                reject(err);
                            } else {
                                console.log('Default admin user created successfully');
                                resolve();
                            }
                        });
                    } else {
                        console.log('Admin user already exists');
                        resolve();
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Authenticate admin user
    async authenticateAdmin(username, password) {
        return new Promise((resolve, reject) => {
            const selectSQL = `SELECT * FROM admin_users WHERE username = ?`;

            this.db.get(selectSQL, [username], async (err, row) => {
                if (err) {
                    console.error('Error querying admin:', err.message);
                    reject(err);
                    return;
                }

                if (!row) {
                    resolve({ success: false, message: 'Tên đăng nhập không tồn tại' });
                    return;
                }

                try {
                    const isValidPassword = await bcrypt.compare(password, row.password);
                    if (isValidPassword) {
                        resolve({
                            success: true,
                            message: 'Đăng nhập thành công',
                            user: { id: row.id, username: row.username }
                        });
                    } else {
                        resolve({ success: false, message: 'Mật khẩu không chính xác' });
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    // Change admin password
    async changeAdminPassword(username, oldPassword, newPassword) {
        return new Promise((resolve, reject) => {
            const selectSQL = `SELECT * FROM admin_users WHERE username = ?`;

            this.db.get(selectSQL, [username], async (err, row) => {
                if (err) {
                    console.error('Error querying admin:', err.message);
                    reject(err);
                    return;
                }

                if (!row) {
                    resolve({ success: false, message: 'Người dùng không tồn tại' });
                    return;
                }

                try {
                    const isValidPassword = await bcrypt.compare(oldPassword, row.password);
                    if (!isValidPassword) {
                        resolve({ success: false, message: 'Mật khẩu cũ không chính xác' });
                        return;
                    }

                    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
                    const updateSQL = `UPDATE admin_users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?`;

                    this.db.run(updateSQL, [hashedNewPassword, username], function(err) {
                        if (err) {
                            console.error('Error updating password:', err.message);
                            reject(err);
                        } else {
                            resolve({ success: true, message: 'Đổi mật khẩu thành công' });
                        }
                    });
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    // Generate a unique 8-character alphanumeric code
    generateUniqueCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Close database connection
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('Database connection closed');
                }
            });
        }
    }
}

module.exports = Database;
