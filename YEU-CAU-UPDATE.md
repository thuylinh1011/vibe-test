# Yêu cầu: Mini game Chém Hoa Quả

Mini game chạy trên trình duyệt, bối cảnh **một sạp chợ hoa quả**. Hoa quả lần lượt nhô lên từ các sọt trên sạp, người chơi **bấm (chạm) vào quả để chém** đôi nó và ghi điểm trong 30 giây.

> Bản này thay cho yêu cầu "Đập Chuột". Phần đăng ký người chơi và trang quản trị giữ nguyên như cũ (xem mục 7).

## 1. Phạm vi

- Chạy trên trình duyệt hiện đại (Chrome, Safari, Firefox, Edge bản mới), cả máy tính lẫn điện thoại.
- Mở trang là chơi được, không cần cài đặt. Người chơi đăng ký một lần trên trình duyệt (như hiện tại).
- Một người chơi, một thiết bị.

**Ngoài phạm vi (chưa làm ở phiên bản này):** nhiều cấp độ khó, bảng xếp hạng online, âm thanh/nhạc nền, bom/vật cản trừ điểm, combo chém nhiều quả một lần.

## 2. Luật chơi

1. Bảng chơi là **sạp hoa quả gồm 3×3 = 9 sọt** (thay cho 9 cái hang).
2. Mỗi lượt kéo dài **30 giây**, bắt đầu đếm ngược khi bấm **"Bắt đầu"**.
3. Tại mỗi thời điểm có **tối đa 1 quả** trên sạp.
4. Quả nhô lên ở **một sọt ngẫu nhiên**, ở lại khoảng **0,8 giây** rồi tự lăn xuống sọt.
5. Sọt xuất hiện tiếp theo **không trùng** với sọt vừa xuất hiện ngay trước đó.
6. Mỗi lần xuất hiện, quả được chọn **ngẫu nhiên** trong danh sách: **dưa hấu, cam, táo, chuối, dứa, xoài** (ít nhất 5 loại, mỗi loại có hình và màu ruột riêng).
7. Khi quả bị chém hoặc tự lăn xuống, sau khoảng **0,3 giây** quả tiếp theo xuất hiện.
8. **Hành động chém:**
   - Máy tính: **click chuột vào quả** là chém.
   - Điện thoại: **chạm vào quả** là chém.
   - Bàn phím: Tab tới sọt có quả, nhấn Enter hoặc Space để chém.
   - Không bắt buộc phải vuốt. Mỗi lần chém, màn hình hiện **một vệt lưỡi dao chéo** ngang qua quả, mờ dần sau khoảng 0,2 giây.
9. Khi hết 30 giây: quả biến mất, sạp không nhận thao tác nữa, chuyển sang màn hình kết thúc.

## 3. Cách tính điểm

| Hành động | Điểm |
|---|---|
| Chém trúng quả đang nhô lên | **+1** |
| Bấm vào sọt trống | 0 (không trừ điểm) |
| Để quả tự lăn xuống | 0 (không trừ điểm) |

- Mỗi quả chỉ tính điểm **một lần**: bấm nhiều lần vào cùng một quả vẫn chỉ được 1 điểm.
- Mọi loại quả đều +1 điểm (chưa có điểm riêng theo loại quả).
- Điểm bắt đầu từ **0** ở mỗi lượt mới.
- **Điểm cao nhất** lưu trên trình duyệt; nếu trình duyệt không cho lưu thì game vẫn chơi bình thường.

## 4. Hiệu ứng chém

- Quả bị chém **tách thành hai nửa** theo vệt dao chéo, để lộ ruột (dưa hấu ruột đỏ có hạt, cam ruột cam có múi…).
- Hai nửa **bay tách ra hai phía rồi rơi xuống**, mờ dần trong khoảng 0,5 giây.
- Có **giọt nước quả bắn ra** cùng màu ruột quả.
- Hiện **"+1"** bay lên tại chỗ quả bị chém.
- Ô điểm trên HUD nảy nhẹ khi được cộng điểm.
- Hiệu ứng không được chặn quả tiếp theo xuất hiện, và không làm sai thời gian lượt chơi.

## 5. Lời thoại vui trong game

Game "biết nói chuyện" với người chơi bằng những câu ngắn, hài hước kiểu cô bán hàng ngoài chợ. Mỗi lần chọn **ngẫu nhiên** trong danh sách, không lặp lại câu vừa hiện ngay trước đó.

### 5.1. Khi chém trúng
Hiện một bong bóng chữ nhỏ cạnh quả (khoảng 0,8 giây) cùng với "+1". Ví dụ:
- "Đẳng cấp! Tuyệt vời! Tinh hoa hội tụ!"
- "Dao nhanh hơn người yêu cũ trở mặt!"
- "Chém một phát, ngọt như đường phèn!"
- "Đỉnh của chóp!"
- "Thợ chém hoa quả số 1 chợ Bến Thành!"
- "Ơ kìa, ai cho chém đẹp vậy?"

**Câu theo loại quả** (thỉnh thoảng hiện thay câu chung):
- Dưa hấu: "Đỏ au như má em lúc ngại!"
- Chuối: "Chuối này giờ là của bạn!"
- Dứa: "Dứa nhiều mắt mà vẫn không thoát!"
- Xoài: "Xoài cát Hòa Lộc, chém là phải sang!"
- Cam: "Cam ơi, cam chịu đi!"
- Táo: "Táo bạo đấy!"

### 5.2. Chuỗi chém liên tiếp (combo)
Chém trúng liên tiếp không để quả nào rơi thì hiện câu to hơn ở giữa sạp:
- 3 quả: "Combo x3! Tay này là tay vàng!"
- 5 quả: "Combo x5! Cả chợ đứng hình!"
- 10 quả: "Combo x10! Huyền thoại sạp hoa quả!"

Combo chỉ để vui, **không cộng thêm điểm**. Để quả tự rơi thì combo về 0.

### 5.3. Khi để quả rơi
Hiện câu trêu nhẹ, không chê bai:
- "Ối, quả chạy mất rồi!"
- "Chậm một nhịp thôi, không sao!"
- "Quả này hôm nay may mắn ghê."

### 5.4. Lời thoại ở các màn hình
- Màn hình bắt đầu, câu chào ngẫu nhiên: "Chợ mở cửa rồi, mài dao đi nào!" / "Hôm nay hoa quả tươi lắm, chém thả ga!"
- 5 giây cuối: "Sắp đóng cửa chợ, nhanh tay lên!"
- Màn hình kết thúc, **danh hiệu theo điểm**:

| Điểm | Danh hiệu | Câu nhận xét |
|---|---|---|
| 0–5 | Khách đi chợ dạo | "Mới cầm dao lần đầu à? Thử lại nào!" |
| 6–12 | Phụ bán sạp | "Có tiềm năng đấy, chủ sạp để ý rồi!" |
| 13–20 | Chủ sạp lành nghề | "Tay dao chắc nịch, cả dãy hàng nể!" |
| 21–27 | Bậc thầy dao kéo | "Đẳng cấp, tuyệt vời, tinh hoa!" |
| 28 trở lên | Huyền thoại chợ hoa quả | "Truyền nhân đời thứ 9 của dao phay!" |

- Khi phá kỷ lục: "🏆 Kỷ lục mới! Cả chợ vỗ tay!"

### 5.5. Quy định chung
- Lời thoại không được che quả tiếp theo hay HUD, không làm chậm game.
- Danh sách câu đặt chung một chỗ trong code để dễ sửa, thêm sau này.

## 6. Màn hình và giao diện

### 6.1. Phong cách chung
- Nền là **khung cảnh chợ hoa quả**: mái bạt sọc đỏ trắng phía trên, sạp gỗ, các sọt tre đựng quả, tông màu ấm, tươi.
- Font chữ tròn, đậm, vui mắt; nút bấm to, bo tròn, màu tươi.
- Toàn bộ hình vẽ làm bằng SVG/CSS, không dùng ảnh tải từ ngoài, để vẫn chạy được khi mở file trực tiếp.

### 6.2. Màn hình đăng ký
- Giữ nguyên các trường và luật kiểm tra như hiện tại, chỉ đổi giao diện cho hợp với chủ đề chợ hoa quả.

### 6.3. Màn hình bắt đầu
- Tên game: **🍉 Chém Hoa Quả**.
- Hướng dẫn: "Bấm vào hoa quả để chém càng nhiều càng tốt trong 30 giây."
- Điểm cao nhất (nếu đã có).
- Nút **"Bắt đầu"**.

### 6.4. Màn hình chơi
- Phía trên sạp: **Điểm** và **Thời gian còn lại** (30 về 0), hiển thị như tấm bảng gỗ treo ở sạp.
- Ở giữa: sạp 3×3 sọt, các sọt bằng nhau, đủ lớn để chạm bằng ngón tay trên điện thoại.
- Bấm nhanh liên tục trên sạp **không được phóng to trang** hay chọn chữ.
- 5 giây cuối: đồng hồ đổi sang màu đỏ và nhấp nháy nhẹ.

### 6.5. Màn hình kết thúc
- Thông báo "Hết giờ!".
- **Điểm của lượt này** (ví dụ "12 quả"), **danh hiệu** và câu nhận xét theo mục 5.4.
- **Điểm cao nhất**; nếu vừa phá kỷ lục thì hiện "🏆 Kỷ lục mới!".
- Nút **"Chơi lại"**.

## 7. Giữ nguyên, không đổi

- **Đăng ký người chơi** trước khi chơi (họ tên, email, số điện thoại, kiểm tra trùng email ở server).
- **Trang quản trị /admin**: đăng nhập, xem, tìm kiếm, xoá, xuất CSV danh sách người chơi.
- Server Node.js, database, Docker như hiện tại. Chỉ đổi tên hiển thị "Đập Chuột" thành "Chém Hoa Quả".

## 8. Tiêu chí hoàn thành

**Chức năng**
- [ ] Mở trang thấy màn hình đăng ký hoặc bắt đầu, không có lỗi trong console.
- [ ] Bấm "Bắt đầu" thì đồng hồ chạy từ 30 về 0 và hoa quả bắt đầu xuất hiện.
- [ ] Sạp có đúng 9 sọt, xếp 3 hàng × 3 cột.
- [ ] Mỗi lúc tối đa 1 quả; vị trí ngẫu nhiên, không lặp lại sọt ngay trước; loại quả thay đổi ngẫu nhiên, có ít nhất 5 loại.
- [ ] Bấm/chạm vào quả được +1 điểm, quả tách đôi ngay; bấm nhiều lần vào cùng quả chỉ được 1 điểm.
- [ ] Enter/Space trên sọt có quả cũng chém được.
- [ ] Bấm vào sọt trống không thay đổi điểm.
- [ ] Lượt kết thúc đúng sau 30 giây (sai lệch không quá 1 giây); sau đó bấm không được tính điểm.
- [ ] "Chơi lại" đưa điểm về 0, thời gian về 30, không chạy chồng hai đồng hồ.
- [ ] Điểm cao nhất cập nhật khi phá kỷ lục và còn sau khi tải lại trang.
- [ ] Đăng ký và trang quản trị hoạt động như trước.

**Giao diện và trải nghiệm**
- [ ] Có nền chợ hoa quả, sọt tre, hoa quả vẽ rõ ràng, phân biệt được từng loại.
- [ ] Quả bị chém tách hai nửa, lộ ruột, có giọt nước và "+1".
- [ ] Mỗi lần chém có vệt lưỡi dao.
- [ ] Chơi được bằng chuột trên máy tính và cảm ứng trên điện thoại; bấm nhanh không làm phóng to trang.
- [ ] Hiển thị gọn trên điện thoại rộng 375px, không cuộn ngang.

**Kỹ thuật**
- [ ] Không dùng ảnh hay thư viện tải từ ngoài.
- [ ] Chuyển tab rồi quay lại không làm game lỗi (thời gian vẫn tính đúng).
- [ ] Người dùng bật "giảm chuyển động" trong hệ điều hành thì hiệu ứng được rút gọn.
