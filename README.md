# Hướng Dẫn & Giải Thích Thuật Toán

Tài liệu này tóm tắt ngắn gọn **Nguyên lý**, **Các bước thực hiện** và **Cách sử dụng demo** cho 3 thuật toán.

---

## 1. Thuật toán A* (Tìm đường đi ngắn nhất)

### 🧠 Nguyên lý hoạt động
A* tìm đường dựa trên hàm chi phí **`F(n) = G(n) + H(n)`**:
*   **G(n)**: Chi phí thực tế từ điểm xuất phát đến điểm hiện tại `n`.
*   **H(n)**: Chi phí ước lượng (Heuristic) từ `n` đến đích (dùng công thức Manhattan hoặc Euclidean).
*   Thuật toán luôn ưu tiên mở rộng các ô có giá trị **F nhỏ nhất** trước.

### 📝 Các bước thuật toán
1.  **B1**: Thêm điểm Bắt đầu vào danh sách mở (`OpenSet`).
2.  **B2**: Lặp khi `OpenSet` không rỗng:
    *   Tìm ô có **F thấp nhất** trong `OpenSet` (gọi là `Current`).
    *   Nếu `Current` là Đích -> **Dừng** (Tìm thấy đường).
    *   Chuyển `Current` sang danh sách đóng (`ClosedSet` - đã duyệt).
    *   Xét các ô hàng xóm của `Current`:
        *   Nếu là Tường hoặc đã nằm trong `ClosedSet` -> Bỏ qua.
        *   Tính `G_mới`. Nếu `G_mới` nhỏ hơn `G_cũ` của hàng xóm:
            *   Cập nhật `G`, `H`, `F`.
            *   Gán `Parent` của hàng xóm là `Current`.
            *   Thêm vào `OpenSet` (nếu chưa có).
3.  **B3**: Nếu `OpenSet` rỗng mà chưa thấy đích -> Không có đường đi.

### 🎮 Cách sử dụng Demo
1.  **Vẽ tường**: Nhấn giữ chuột trái và kéo trên lưới để tạo/xóa chướng ngại vật.
2.  **Di chuyển**: Kéo thả điểm **Xanh (Start)** hoặc **Đỏ (End)**.
3.  **Cài đặt**: Chọn kích thước lưới (`Grid Size`) hoặc loại Heuristic (`Manhattan/Euclidean`).
4.  **Chạy**: Nhấn **"Run Algorithm"**.

---

## 2. Thuật toán Minimax (Cờ Caro / Tic-Tac-Toe)

### 🧠 Nguyên lý hoạt động
Dùng cho trò chơi đối kháng.
*   **MAX (AI)**: Cố gắng chọn nước đi để đạt điểm số cao nhất.
*   **MIN (Người)**: AI giả định đối thủ sẽ luôn chọn nước đi làm AI bị điểm thấp nhất.
*   **Alpha-Beta Pruning**: Kỹ thuật "cắt tỉa" các nhánh ko cần thiết (ví dụ: nếu biết nhánh này chắc chắn dẫn đến thua thì không cần tính sâu hơn nữa) để tăng tốc độ.

### 📝 Các bước thuật toán
1.  **Hàm Minimax(trạng_thái, độ_sâu, lượt_ai)**:
    *   Nếu Game kết thúc hoặc đạt độ sâu tối đa (`Depth`) -> Trả về điểm số (Hàm lượng giá).
2.  **Nếu lượt AI (MAX)**:
    *   Khởi tạo `BestScore = -Vô cùng`.
    *   Duyệt qua các ô trống:
        *   Đi thử -> Gọi đệ quy `Minimax` -> Hoàn tác nước đi.
        *   `BestScore = Max(BestScore, Điểm mới)`.
        *   `Alpha = Max(Alpha, BestScore)`.
        *   Nếu `Beta <= Alpha` -> **Cắt tỉa** (Break).
3.  **Nếu lượt Người (MIN)**:
    *   Tương tự nhưng lấy **Min** và cập nhật `Beta`.

### 🎮 Cách sử dụng Demo
1.  **Chọn Game**: Tic-Tac-Toe (3x3), Gomoku 5x5 hoặc 7x7.
2.  **Chọn Depth**: Kéo thanh trượt để chỉnh độ thông minh (1 = Dễ, 5 = Khó).
3.  **Chơi**: Nhấn vào ô trống trên bàn cờ để đánh **X**. AI (O) sẽ đánh lại ngay sau đó.

---

## 3. Thuật toán Welsh-Powell (Tô màu đồ thị)

### 🧠 Nguyên lý hoạt động
Sử dụng chiến thuật **Tham lam (Greedy)** kết hợp **Sắp xếp**:
*   Ưu tiên tô màu cho các đỉnh có **bậc cao nhất** (nhiều kết nối nhất) vì chúng khó tô nhất.
*   Các đỉnh không kề nhau (không có dây nối) có thể dùng chung một màu.

### 📝 Các bước thuật toán
1.  **B1**: Tính **bậc (degree)** của tất cả các đỉnh (số lượng cạnh nối với nó).
2.  **B2**: Sắp xếp danh sách các đỉnh theo thứ tự **Bậc giảm dần**.
3.  **B3**: Lặp khi vẫn còn đỉnh chưa tô màu:
    *   Chọn màu tiếp theo trong bảng màu (VD: Màu 1).
    *   Tô Màu 1 cho đỉnh đầu tiên (chưa tô) trong danh sách.
    *   Duyệt qua danh sách xuống dưới: Nếu đỉnh `V` không nối với bất kỳ đỉnh nào có Màu 1 -> Tô Màu 1 cho `V`.
    *   Chuyển sang Màu 2 và lặp lại.

### 🎮 Cách sử dụng Demo
1.  **Tạo Đồ thị**:
    *   Nhập số đỉnh (`Nodes`) và mật độ cạnh (`Density`).
    *   Nhấn **"New Graph"** để sinh đồ thị ngẫu nhiên.
2.  **Cấu hình**: Nhập `Max Colors` (số màu tối đa cho phép).
3.  **Chạy**: Nhấn **"Color Graph"** để xem thuật toán tô màu từng bước.
