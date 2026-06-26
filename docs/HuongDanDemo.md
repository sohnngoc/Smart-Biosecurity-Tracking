# Hướng Dẫn Trình Bày Demo: Hệ Thống Theo Dõi An Toàn Sinh Học

Tài liệu này hướng dẫn cách chạy và trình bày bản Demo (Web App React) cho Hội đồng/Khách hàng, tập trung vào luồng UI/UX và tương tác mô phỏng dữ liệu trực quan.

## 1. Khởi động hệ thống

1. **Backend (Database):**
   - Đảm bảo dự án Supabase đã được tạo.
   - Bạn đã chạy file `supabase/migrations/20260624_init_schema.sql` và `supabase/seed.sql` trong SQL Editor của Supabase.
   - Lấy URL và API Key điền vào file `.env` ở thư mục `smart-biosecurity-tracking/.env` và copy nội dung đó sang `smart-biosecurity-tracking/web-react/.env`.

2. **Frontend (React Web App):**
   ```bash
   cd web-react
   npm install
   npm run dev
   ```
   - Mở trình duyệt tại `http://localhost:5173`.

## 2. Kịch bản Trình Bày Demo

### Bước 1: Đăng nhập
- Tại màn hình đăng nhập, hệ thống sẽ yêu cầu tài khoản và mật khẩu.
- Tài khoản Demo (được tạo trước trong Supabase Auth): `admin@demo.com` / Mật khẩu: `123456`
- **Lưu ý:** Vì mục đích bảo mật, bạn phải tự đăng ký user này trên giao diện Supabase Auth. Sau đó dùng UUID của user đó insert vào bảng `user_farms` để cấp quyền cho trại.

### Bước 2: Bản đồ tổng quan (Hệ thống chuỗi trại)
- Sau khi đăng nhập, hệ thống hiển thị **Bản đồ tổng quan hệ thống trại** với 5 trại mô phỏng (từ Bình Phước đến Long An).
- **Trình bày:** Click vào một trại (ví dụ: Trại Nái Bình Phước 01) để xem Thẻ thông tin nhanh (Số cảnh báo, Điểm rủi ro, Xe bên trong).
- Nhấn **Vào quản trị trại** để đi sâu vào chi tiết của trại đó.

### Bước 3: Tổng quan một trại
- Màn hình sẽ hiển thị 5 thẻ thống kê (Xe trong trại, Người trong khu sạch, Cảnh báo chưa xử lý...).
- **Trình bày:** Chú ý đến vòng tròn **Điểm rủi ro an toàn sinh học** (thay đổi màu sắc theo mức độ rủi ro).

### Bước 4: Bộ Mô Phỏng IoT
- Nhấn vào menu **Bộ mô phỏng IoT** ở thanh điều hướng bên trái.
- Tại đây, hệ thống cho phép bấm các nút để giả lập phần cứng gửi tín hiệu:
  1. Bấm **GPS xe vào vùng cấm** -> Hệ thống sẽ hiển thị thông báo tạo cảnh báo Nghiêm trọng.
  2. Bấm **Người đi sai phân quyền** -> Tạo cảnh báo nguy hiểm.
  3. Bấm **Thiết bị mất tín hiệu**.
- **Giải thích với hội đồng:** "Trong thực tế, các nút này chính là luồng dữ liệu tự động bắn từ thiết bị IoT (GPS, UWB, RFID) qua giao thức MQTT gửi về hệ thống."

### Bước 5: Quản lý Cảnh báo
- Chuyển sang menu **Cảnh báo**.
- Hệ thống sẽ hiển thị các sự kiện cảnh báo vừa được tạo ra ở Bước 4.
- **Trình bày:** Nhấn nút Check (tick xanh) ở cột Thao tác để chuyển trạng thái cảnh báo từ "Chưa xử lý" sang "Đã xử lý".

### Bước 6: Xe ra/vào và Người ra/vào
- Vào menu **Xe ra/vào** và **Người ra/vào**.
- Hiển thị danh sách nhân sự, trạng thái sát trùng hiện tại.

---

## 3. Checklist trước khi Demo
- [ ] Mạng Internet ổn định (để kết nối Supabase).
- [ ] Chạy thử tính năng Đăng nhập xem token còn hạn không.
- [ ] Chạy thử 1 lần tính năng "Mô phỏng IoT" để đảm bảo UI hiện thông báo màu Xanh/Đỏ mượt mà.
- [ ] Kiểm tra font chữ tiếng Việt có hiển thị tốt không. Không có bất kỳ từ tiếng Anh nào lọt vào UI chính.
