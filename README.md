# Hệ Thống Mã Khuyến Mãi QR

Một ứng dụng web cho phép người bán tạo mã khuyến mãi dưới dạng QR code và xác thực mã để đảm bảo mỗi mã chỉ được sử dụng một lần.

## Tính Năng Chính

- ✅ **Tạo Mã Khuyến Mãi**: Tạo mã khuyến mãi 8 ký tự duy nhất
- 📱 **QR Code**: Tự động chuyển đổi mã thành QR code để khách hàng quét
- 🔍 **Xác Thực Mã**: Kiểm tra tính hợp lệ và trạng thái sử dụng của mã
- 📊 **Thống Kê**: Theo dõi số lượng mã đã tạo và đã sử dụng
- 🇻🇳 **Tiếng Việt**: Toàn bộ giao diện và thông báo bằng tiếng Việt

## Công Nghệ Sử Dụng

- **Backend**: Express.js (Node.js)
- **Database**: SQLite
- **Frontend**: HTML, CSS, JavaScript
- **QR Code**: thư viện `qrcode`
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

### Truy Cập Ứng Dụng
Mở trình duyệt và truy cập: `http://localhost:3000`

## Cấu Trúc Dự Án

```
qr-promotion-system/
├── server.js              # Server chính Express.js
├── database.js            # Quản lý cơ sở dữ liệu SQLite
├── package.json           # Cấu hình npm và dependencies
├── promotion_codes.db     # File cơ sở dữ liệu SQLite (tự động tạo)
├── public/                # Thư mục static files
│   ├── index.html         # Giao diện chính
│   ├── styles.css         # CSS styling
│   └── script.js          # JavaScript frontend
└── README.md              # Tài liệu hướng dẫn
```

## API Endpoints

### 1. Tạo Mã Khuyến Mãi
- **POST** `/api/generate-code`
- **Response**: Thông tin mã khuyến mãi mới được tạo

### 2. Tạo QR Code
- **GET** `/api/qr-code/:code`
- **Response**: QR code dưới dạng base64 data URL

### 3. Xác Thực Mã
- **POST** `/api/validate-code`
- **Body**: `{"code": "XXXXXXXX"}`
- **Response**: Kết quả xác thực và thông tin mã

### 4. Lấy Danh Sách Mã
- **GET** `/api/codes`
- **Response**: Danh sách tất cả mã khuyến mãi

### 5. Health Check
- **GET** `/api/health`
- **Response**: Trạng thái server

## Cơ Sở Dữ Liệu

### Bảng `promotional_codes`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INTEGER PRIMARY KEY | ID tự tăng |
| code | TEXT UNIQUE | Mã khuyến mãi 8 ký tự |
| created_at | DATETIME | Thời gian tạo |
| is_used | BOOLEAN | Trạng thái sử dụng |
| used_at | DATETIME | Thời gian sử dụng |

## Quy Trình Sử Dụng

1. **Tạo Mã**: Người bán nhấn "Tạo Mã Khuyến Mãi"
2. **Hiển Thị QR**: Hệ thống tạo mã 8 ký tự và QR code tương ứng
3. **Khách Quét**: Khách hàng quét QR code bằng điện thoại
4. **Xác Thực**: Khi khách quay lại, người bán nhập mã để kiểm tra
5. **Áp Dụng**: Nếu hợp lệ, hệ thống đánh dấu mã đã sử dụng

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

## Hỗ Trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Node.js và npm đã được cài đặt
2. Port 3000 không bị chiếm dụng
3. Quyền ghi file cho database
4. Console log để debug

## License

MIT License - Tự do sử dụng cho mục đích thương mại và phi thương mại.
# ntt-qr
