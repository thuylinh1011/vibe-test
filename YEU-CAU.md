# Yêu cầu: Mini game Đập Chuột

Mini game chạy trên trình duyệt. Người chơi bấm vào chuột xuất hiện ngẫu nhiên trên lưới 3×3 để ghi điểm trong 30 giây.

## 1. Phạm vi

- Chạy trên trình duyệt hiện đại (Chrome, Safari, Firefox, Edge bản mới), cả máy tính lẫn điện thoại.
- Không cần máy chủ, không cần đăng nhập, không cần cài đặt: mở trang là chơi được.
- Một người chơi, một thiết bị.

**Ngoài phạm vi (chưa làm ở phiên bản này):** nhiều cấp độ khó, bảng xếp hạng online, âm thanh/nhạc nền, nhiều loại chuột khác nhau.

## 2. Luật chơi

1. Bảng chơi là lưới **3×3 = 9 ô** (9 cái hang).
2. Mỗi lượt chơi kéo dài **30 giây**, bắt đầu đếm ngược khi người chơi bấm **"Bắt đầu"**.
3. Tại mỗi thời điểm có **tối đa 1 con chuột** trên lưới.
4. Chuột trồi lên ở **một ô ngẫu nhiên** và ở lại trong khoảng **0,8 giây**, sau đó tự lặn xuống.
5. Ô xuất hiện tiếp theo **không trùng** với ô vừa xuất hiện ngay trước đó.
6. Khi chuột bị đập trúng hoặc tự lặn xuống, sau khoảng **0,3 giây** con chuột tiếp theo sẽ xuất hiện.
7. Người chơi bấm (click chuột trên máy tính, chạm trên điện thoại) vào ô có chuột để đập.
8. Khi hết 30 giây: chuột biến mất, lưới không nhận thao tác nữa, chuyển sang màn hình kết thúc.

## 3. Cách tính điểm

| Hành động | Điểm |
|---|---|
| Bấm trúng ô đang có chuột | **+1** |
| Bấm vào ô trống | 0 (không trừ điểm) |
| Để chuột tự lặn xuống | 0 (không trừ điểm) |

- Mỗi con chuột chỉ tính điểm **một lần**: bấm nhiều lần vào cùng một con chỉ được 1 điểm. Chuột bị đập trúng biến mất ngay.
- Điểm bắt đầu từ **0** ở mỗi lượt mới.
- **Điểm cao nhất** được lưu trên trình duyệt (vẫn còn sau khi tải lại trang). Nếu trình duyệt không cho lưu thì game vẫn chơi bình thường, chỉ không giữ được điểm cao nhất.

## 4. Màn hình

### 4.1. Màn hình bắt đầu
- Tên game: **Đập Chuột**.
- Hướng dẫn ngắn: "Bấm vào chuột càng nhiều càng tốt trong 30 giây."
- Điểm cao nhất (nếu đã có).
- Nút **"Bắt đầu"**.

### 4.2. Màn hình chơi
- Phía trên lưới: **Điểm** hiện tại và **Thời gian còn lại** (đếm ngược theo giây, từ 30 về 0).
- Ở giữa: lưới 3×3, các ô hình vuông bằng nhau, đủ lớn để chạm bằng ngón tay trên điện thoại.
- Phản hồi khi đập trúng: chuột có hiệu ứng bị đập (ví dụ đổi hình/ nhấp nháy) và điểm cập nhật ngay.
- 5 giây cuối: đồng hồ đổi sang màu đỏ để báo sắp hết giờ.

### 4.3. Màn hình kết thúc
- Thông báo "Hết giờ!".
- **Điểm của lượt này.**
- **Điểm cao nhất**; nếu vừa phá kỷ lục thì hiển thị "Kỷ lục mới!".
- Nút **"Chơi lại"**: bắt đầu ngay một lượt mới (điểm về 0, thời gian về 30 giây).

## 5. Tiêu chí hoàn thành

Game được coi là hoàn thành khi tất cả các mục sau đều đúng:

**Chức năng**
- [ ] Mở file/trang trong trình duyệt là thấy màn hình bắt đầu, không có lỗi trong console.
- [ ] Bấm "Bắt đầu" thì đồng hồ chạy từ 30 về 0 và chuột bắt đầu xuất hiện.
- [ ] Lưới có đúng 9 ô, xếp 3 hàng × 3 cột.
- [ ] Mỗi lúc chỉ có tối đa 1 con chuột; vị trí thay đổi ngẫu nhiên, không lặp lại ô ngay trước.
- [ ] Bấm trúng chuột được +1 điểm và chuột biến mất ngay; bấm liên tục vào cùng con chuột chỉ được 1 điểm.
- [ ] Bấm vào ô trống không làm thay đổi điểm.
- [ ] Lượt chơi kết thúc đúng sau 30 giây (sai lệch không quá 1 giây); sau đó bấm vào lưới không được tính điểm.
- [ ] Màn hình kết thúc hiển thị đúng điểm của lượt vừa chơi.
- [ ] "Chơi lại" đưa điểm về 0, thời gian về 30 và bắt đầu lượt mới; không bị chạy chồng hai đồng hồ.
- [ ] Điểm cao nhất được cập nhật khi phá kỷ lục và vẫn còn sau khi tải lại trang.

**Giao diện và trải nghiệm**
- [ ] Chơi được bằng chuột trên máy tính và bằng cảm ứng trên điện thoại.
- [ ] Hiển thị gọn trên màn hình điện thoại (rộng 375px) mà không phải cuộn ngang.
- [ ] Điểm và thời gian luôn nhìn thấy được trong khi chơi.
- [ ] Đập trúng có phản hồi nhìn thấy ngay lập tức.

**Kỹ thuật**
- [ ] Không phụ thuộc máy chủ; chạy được khi mở trực tiếp file HTML.
- [ ] Chuyển sang tab khác rồi quay lại không làm game bị lỗi (thời gian vẫn tính đúng).
