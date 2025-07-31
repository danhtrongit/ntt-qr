# Hệ Thống Mã Khuyến Mãi QR

Một ứng dụng web cho phép người bán tạo mã khuyến mãi dưới dạng QR code và xác thực mã để đảm bảo mỗi mã chỉ được sử dụng một lần.

## Tính Năng Chính

- 🔐 **Đăng Nhập Admin**: Hệ thống xác thực với tài khoản admin/Thien.28
- ✅ **Tạo Mã Khuyến Mãi**: Tạo mã khuyến mãi 8 ký tự duy nhất
- 📱 **QR Code**: Tự động chuyển đổi mã thành QR code để khách hàng quét
- 🔍 **Xác Thực Mã**: Kiểm tra tính hợp lệ và trạng thái sử dụng của mã
- 📷 **Quét QR Code**: Sử dụng camera để quét QR code trực tiếp
- 📊 **Thống Kê**: Theo dõi số lượng mã đã tạo và đã sử dụng
- 🔑 **Đổi Mật Khẩu**: Cho phép admin thay đổi mật khẩu
- 🇻🇳 **Tiếng Việt**: Toàn bộ giao diện và thông báo bằng tiếng Việt

## Công Nghệ Sử Dụng

- **Backend**: Express.js (Node.js)
- **Database**: SQLite
- **Authentication**: Express Session + bcryptjs
- **Frontend**: HTML, CSS, JavaScript
- **QR Code**: thư viện `qrcode` + html5-qrcode
- **Styling**: CSS3 với Flexbox/Grid

## Cài Đặt và Chạy

### Yêu Cầu Hệ Thống
- Node.js (phiên bản 14 trở lên)
- npm hoặc yarn

### Cài Đặt
```bash
# Clone repository hoặc tải về source code
cd qr-promotion-system

# Cài đặt dependencies
npm install

# Chạy ứng dụng trong môi trường development
npm run dev

# Hoặc chạy production
npm start
```

### Chạy với PM2 (Production)
```bash
# Cài đặt PM2 globally (tùy chọn)
npm install -g pm2

# Khởi động ứng dụng với PM2
npm run pm2:start

# Các lệnh PM2 khác
npm run pm2:stop      # Dừng ứng dụng
npm run pm2:restart   # Khởi động lại
npm run pm2:reload    # Reload không downtime
npm run pm2:delete    # Xóa process
npm run pm2:logs      # Xem logs
npm run pm2:monit     # Monitor dashboard
```

### Production Deployment
```bash
# 1. Chuẩn bị môi trường production
export NODE_ENV=production
export PORT=3008

# 2. Cài đặt dependencies production
npm ci --only=production

# 3. Khởi động với PM2
npm run pm2:start

# 4. Thiết lập auto-start khi server khởi động lại
npx pm2 startup
npx pm2 save

# 5. Kiểm tra trạng thái
npx pm2 status
npx pm2 logs qr-promotion-system
```

### Truy Cập Ứng Dụng
Mở trình duyệt và truy cập: `http://localhost:3000`

### Thông Tin Đăng Nhập
- **Tên đăng nhập**: admin
- **Mật khẩu**: Thien.28

## Cấu Trúc Dự Án

```
qr-promotion-system/
├── server.js              # Server chính Express.js
├── database.js            # Quản lý cơ sở dữ liệu SQLite
├── ecosystem.config.js    # Cấu hình PM2 process manager
├── package.json           # Cấu hình npm và dependencies
├── promotion_codes.db     # File cơ sở dữ liệu SQLite (tự động tạo)
├── logs/                  # Thư mục logs PM2
│   ├── combined.log       # Log tổng hợp
│   ├── out.log           # Output logs
│   └── error.log         # Error logs
├── public/                # Thư mục static files
│   ├── login.html         # Trang đăng nhập
│   ├── dashboard.html     # Trang chủ (thống kê + tạo mã)
│   ├── validate.html      # Trang kiểm tra mã
│   ├── change-password.html # Trang đổi mật khẩu
│   ├── styles.css         # CSS styling chung
│   ├── auth.js            # JavaScript xác thực chung
│   ├── dashboard.js       # JavaScript trang chủ
│   ├── validate.js        # JavaScript kiểm tra mã
│   └── change-password.js # JavaScript đổi mật khẩu
└── README.md              # Tài liệu hướng dẫn
```

## API Endpoints

### Authentication
- **POST** `/api/login` - Đăng nhập admin
- **POST** `/api/logout` - Đăng xuất
- **GET** `/api/auth-status` - Kiểm tra trạng thái đăng nhập
- **POST** `/api/change-password` - Đổi mật khẩu

### Promotional Codes
- **POST** `/api/generate-code` - Tạo mã khuyến mãi mới
- **GET** `/api/qr-code/:code` - Tạo QR code cho mã
- **POST** `/api/validate-code` - Xác thực mã khuyến mãi
- **GET** `/api/codes` - Lấy danh sách tất cả mã

### System
- **GET** `/api/health` - Kiểm tra trạng thái server

## Cơ Sở Dữ Liệu

### Bảng `promotional_codes`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INTEGER PRIMARY KEY | ID tự tăng |
| code | TEXT UNIQUE | Mã khuyến mãi 8 ký tự |
| created_at | DATETIME | Thời gian tạo |
| is_used | BOOLEAN | Trạng thái sử dụng |
| used_at | DATETIME | Thời gian sử dụng |

### Bảng `admin_users`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INTEGER PRIMARY KEY | ID tự tăng |
| username | TEXT UNIQUE | Tên đăng nhập |
| password | TEXT | Mật khẩu đã mã hóa |
| created_at | DATETIME | Thời gian tạo |
| updated_at | DATETIME | Thời gian cập nhật |

## Quy Trình Sử Dụng

### Đăng Nhập
1. **Truy cập**: Mở `http://localhost:3000` trên trình duyệt
2. **Đăng nhập**: Sử dụng tài khoản admin/Thien.28
3. **Điều hướng**: Hệ thống chuyển đến trang chủ

### Tạo Mã Khuyến Mãi
1. **Trang chủ**: Xem thống kê và nhấn "Tạo Mã Khuyến Mãi"
2. **Hiển Thị QR**: Hệ thống tạo mã 8 ký tự và QR code tương ứng
3. **In/Tải**: Có thể in hoặc tải QR code về máy
4. **Khách Quét**: Khách hàng quét QR code bằng điện thoại

### Kiểm Tra Mã
1. **Trang kiểm tra**: Chuyển đến menu "Kiểm Tra Mã"
2. **Quét QR**: Sử dụng camera để quét QR code trực tiếp
3. **Nhập thủ công**: Hoặc nhập mã 8 ký tự bằng tay
4. **Xác thực**: Hệ thống kiểm tra và đánh dấu mã đã sử dụng
5. **Lịch sử**: Xem lịch sử các lần kiểm tra

## Tính Năng Bảo Mật

- ✅ Mã khuyến mãi duy nhất (UNIQUE constraint)
- ✅ Kiểm tra trạng thái sử dụng
- ✅ Không thể sử dụng mã đã hết hạn
- ✅ Validation đầu vào
- ✅ Error handling toàn diện

## Môi Trường Phát Triển

### Scripts NPM
- `npm start`: Chạy production server
- `npm run dev`: Chạy development server với nodemon
- `npm test`: Chạy tests (chưa implement)

### Development Tools
- **nodemon**: Auto-restart server khi có thay đổi
- **cors**: Hỗ trợ Cross-Origin Resource Sharing

## Tùy Chỉnh

### Thay Đổi Port
Sửa biến `PORT` trong `server.js` hoặc set environment variable:
```bash
PORT=8080 npm start
```

### Thay Đổi Database Path
Sửa `DB_PATH` trong `database.js`

### Tùy Chỉnh QR Code
Sửa options trong hàm `QRCode.toDataURL()` tại `server.js`

## Hỗ Trợ và Troubleshooting

### Các vấn đề thường gặp:

1. **Port đã được sử dụng**
   ```bash
   # Kiểm tra process đang sử dụng port 3008
   lsof -i :3008
   # Hoặc thay đổi port
   PORT=3009 npm start
   ```

2. **PM2 không khởi động được**
   ```bash
   # Xóa PM2 process cũ
   npx pm2 delete all
   # Khởi động lại
   npm run pm2:start
   ```

3. **Database lỗi**
   ```bash
   # Xóa database và tạo lại
   rm promotion_codes.db
   npm start
   ```

4. **Session lỗi**
   ```bash
   # Xóa session và đăng nhập lại
   # Hoặc restart server
   npm run pm2:restart
   ```

### Kiểm tra hệ thống:
- Node.js và npm đã được cài đặt
- Port 3008 không bị chiếm dụng
- Quyền ghi file cho database và logs
- PM2 logs: `npm run pm2:logs`

## License

MIT License - Tự do sử dụng cho mục đích thương mại và phi thương mại.
# ntt-qr
