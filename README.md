# Chém Hoa Quả

Mini game chạy trên trình duyệt, bối cảnh một sạp chợ hoa quả: hoa quả lần lượt nhô lên từ 9 sọt trên sạp, người chơi bấm/chạm vào quả để chém đôi nó và ghi điểm trong 30 giây mỗi lượt. Người chơi đăng ký (họ tên/email/số điện thoại) một lần trên trình duyệt trước khi chơi; có trang quản trị `/admin` để xem/tìm/xoá/xuất CSV danh sách người chơi.

## Cấu trúc thư mục

- `app/` — code game (`index.html`, `style.css`, `game.js`)
- `design/` — design token dùng chung (`tokens.css`) và trang tham khảo design system
- `docs/` — tài liệu đặc tả (tổng quan, chức năng, màn hình, quy tắc & dữ liệu, kế hoạch test)
- `lib/` — backend: kết nối database, xác thực admin, validate, xuất CSV, trang `/admin`
- `server.js` — server Node.js phục vụ `app/`, `design/`, API đăng ký và API quản trị
- `YEU-CAU.md` — yêu cầu gốc của game

## Cách chạy bằng Docker

### Yêu cầu

- Đã cài [Docker](https://www.docker.com/) và Docker Compose (đi kèm Docker Desktop, hoặc plugin `docker compose`).

### Chuẩn bị biến môi trường

```bash
cp .env.example .env
```

Mở `.env` và đổi mật khẩu mặc định (`ADMIN_PASSWORD`, `POSTGRES_PASSWORD`) trước khi dùng thật. File `.env` không được commit lên git.

### Chạy

```bash
docker compose up --build
```

Lệnh trên khởi động 2 dịch vụ: `app` (server Node.js, cổng 3000) và `db` (PostgreSQL, lưu dữ liệu qua volume). Sau khi container khởi động xong, mở trình duyệt tại:

```
http://localhost:3000
```

Trang sẽ tự chuyển đến `app/index.html` — nơi game chạy. Trang quản trị ở `http://localhost:3000/admin`, đăng nhập bằng `ADMIN_USERNAME`/`ADMIN_PASSWORD` trong `.env`.

### Dừng

```bash
docker compose down
```

Thêm `-v` nếu muốn xoá luôn volume database (`docker compose down -v`) — mất toàn bộ dữ liệu người chơi đã đăng ký.
