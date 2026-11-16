# Đập Chuột

Mini game đập chuột chạy trên trình duyệt: bấm vào con chuột xuất hiện ngẫu nhiên trên lưới 3×3 để ghi điểm trong 30 giây mỗi lượt.

## Cấu trúc thư mục

- `app/` — code game (`index.html`, `style.css`, `game.js`)
- `design/` — design token dùng chung (`tokens.css`) và trang tham khảo design system
- `docs/` — tài liệu đặc tả (tổng quan, chức năng, màn hình, quy tắc & dữ liệu, kế hoạch test)
- `YEU-CAU.md` — yêu cầu gốc của game

## Cách chạy bằng Docker

### Yêu cầu

- Đã cài [Docker](https://www.docker.com/) và Docker Compose (đi kèm Docker Desktop, hoặc plugin `docker compose`).

### Chạy

```bash
docker compose up --build
```

Sau khi container khởi động xong, mở trình duyệt tại:

```
http://localhost:3000
```

Trang sẽ tự chuyển đến `app/index.html` — nơi game chạy.

### Dừng

```bash
docker compose down
```

Lệnh trên chạy một dịch vụ Node.js nhỏ (`server.js`) phục vụ các file tĩnh trong `app/` và `design/` — chưa dùng database.
