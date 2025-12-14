# GIẢI THÍCH CHI TIẾT CODE (TỪNG DÒNG) CHO 3 THUẬT TOÁN

Tài liệu này dành riêng cho phần "Vấn đáp Code". Dưới đây là giải thích tại sao mình viết như vậy trong code.

---

## 1. Thuật toán A* (`js/algorithms/astar.js`)

Hàm quan trọng nhất là `runAStar()`. Đây là trái tim của thuật toán.

### 📝 Code & Giải thích

```javascript
let openSet = [startNode]; // 1. Khởi tạo
startNode.open = true;
```
> **Tại sao?**: `OpenSet` chứa các ô "đang được xem xét". Ban đầu chỉ có điểm xuất phát.

```javascript
while (openSet.length > 0) { // 2. Vòng lặp chính
   // ... tìm node có F thấp nhất ...
}
```
> **Tại sao?**: Thuật toán chạy liên tục cho đến khi rỗng `OpenSet` (nghĩa là đã đi vào ngõ cụt hết đường) hoặc tìm thấy đích.

```javascript
// Tìm node có F thấp nhất trong OpenSet
let winner = 0;
for (let i = 0; i < openSet.length; i++) {
    if (openSet[i].f < openSet[winner].f) {
        winner = i;
    }
}
let current = openSet[winner];
```
> **Tại sao?**: Đây là đặc điểm của A*. Nó luôn ưu tiên đi vào ô có khả năng về đích nhanh nhất (F nhỏ nhất). Nếu dùng hàng đợi ưu tiên (Priority Queue) thì nhanh hơn, nhưng dùng vòng lặp này dễ hiểu hơn cho demo.

```javascript
if (current === endNode) { // 3. Kiểm tra đích
    reconstructPath(current);
    return;
}
```
> **Tại sao?**: Nếu ô đang xét chính là đích -> Xong! Dừng lại và vẽ đường đi.

```javascript
openSet.splice(winner, 1); // 4. Chuyển sang ClosedSet
current.open = false;
current.visited = true; 
```
> **Tại sao?**: Ô này đã xét xong rồi, không cần xem lại nữa nên xóa khỏi `OpenSet` và đánh dấu `visited` (đã đi qua) để tránh đi vòng tròn.

```javascript
// 5. Xem xét các Node hàng xóm
const neighbors = getNeighbors(current);
for (let neighbor of neighbors) {
    if (!neighbor.visited && !neighbor.wall) { // Bỏ qua tường và ô đã đi
        const tempG = current.g + 1; // Chi phí đi thêm 1 bước

        // ... Logic so sánh đường đi tối ưu ...
        if (newPath) {
            neighbor.h = heuristic(neighbor, endNode); // Tính ước lượng
            neighbor.f = neighbor.g + neighbor.h;      // F = G + H
            neighbor.parent = current;                 // Ghi nhớ "Cha"
        }
    }
}
```
> **Tại sao?**:
> *   `tempG`: Tính xem đi đường này có ngắn hơn đường cũ không.
> *   `neighbor.parent = current`: Rất quan trọng! Giống như đánh dấu mũi tên ngược lại. Khi đến đích, ta sẽ lần theo các mũi tên này (`parent`) để vẽ lại đường đi từ Đích về Start.

---

## 2. Thuật toán Minimax (`js/algorithms/minimax.js`)

Hàm đệ quy `minimax()` quyết định độ thông minh của AI.

### 📝 Code & Giải thích

```javascript
function minimax(boardState, depth, isMaximizing, alpha, beta) {
    // 1. Điều kiện dừng (Terminal States)
    if (checkWin(boardState, 'O')) return 10 - depth;
    if (checkWin(boardState, 'X')) return depth - 10;
    if (checkDraw(boardState)) return 0;
    if (depth >= maxDepth) return heuristicEval(boardState);
```
> **Tại sao?**:
> *   `10 - depth`: Nếu AI thắng (O), điểm dương. Thắng càng sớm (`depth` nhỏ) thì điểm càng cao (10 - 1 = 9 so với 10 - 9 = 1). AI sẽ chọn cách thắng nhanh nhất.
> *   `depth - 10`: Nếu Người thắng (X), điểm âm. Thua càng muộn càng tốt.
> *   `depth >= maxDepth`: Nếu nghĩ quá lâu (đạt độ sâu giới hạn), dừng lại và chấm điểm tạm (heuristic).

```javascript
// 2. Lượt AI (Maximizing Player)
if (isMaximizing) {
    let bestScore = -Infinity; // Khởi tạo điểm cực thấp
    for (let i of moves) {
        boardState[i] = 'O'; // Đi thử
        let score = minimax(boardState, depth + 1, false, alpha, beta); // Gọi đệ quy
        boardState[i] = null; // Hoàn tác (Backtrack)
        
        bestScore = Math.max(score, bestScore); // Chọn điểm cao nhất
        alpha = Math.max(alpha, bestScore);     // Cập nhật Alpha
        
        if (beta <= alpha) break; // Cắt tỉa Alpha-Beta
    }
    return bestScore;
}
```
> **Tại sao?**:
> *   `boardState[i] = null`: Đây là bước **Backtracking** (Quay lui). Máy tính đi thử trong "tưởng tượng", tính xong phải xóa đi để trả lại bàn cờ cũ cho trường hợp khác.
> *   `if (beta <= alpha) break`: Đây là dòng **Cắt tỉa**.
>   *   Ví dụ: Nhánh A cho điểm 5. Nhánh B vừa tính bước đầu đã thấy bị điểm 3 (tệ hơn A). Vì đối thủ (Min) sẽ luôn ép mình vào đường tệ nhất, nên chắc chắn kết quả cuối cùng của nhánh B sẽ <= 3. Mà ta đã có A=5 ngon hơn rồi -> Cắt bỏ B luôn cho nhanh.

---

## 3. Thuật toán Welsh-Powell (`js/algorithms/graph.js`)

Hàm `runWelshPowell()` dùng chiến thuật tham lam.

### 📝 Code & Giải thích

```javascript
// 1. Sắp xếp đỉnh theo Bậc giảm dần
const sortedNodes = [...nodes].sort((a, b) => b.degree - a.degree);
```
> **Tại sao?**: Đây là bước quan trọng nhất của Welsh-Powell. Đỉnh có Bậc cao (nối nhiều dây) là đỉnh "khó tính" nhất vì nó có nhiều hàng xóm. Ta phải ưu tiên tô màu nó trước để dễ xử lý mấy đỉnh ít hàng xóm sau này.

```javascript
// 2. Vòng lặp tô màu
while (coloredCount < nodes.length) {
    const currentColor = COLORS[colorIndex]; // Chọn màu (Đỏ -> Xanh -> Vàng...)
    
    // Tìm đỉnh đầu tiên chưa tô (trong danh sách đã sắp xếp)
    let firstNode = null;
    for (let n of sortedNodes) {
        if (!n.color) { firstNode = n; break; }
    }
    
    // Tô cho đỉnh đó
    firstNode.color = currentColor;
    
    // 3. Tô lan sang các đỉnh khác không kề
    for (let i = 0; i < sortedNodes.length; i++) {
        const n = sortedNodes[i];
        if (!n.color) {
            // Kiểm tra xem nó có hàng xóm nào đang dùng màu này không?
            let isAdjacent = false;
            for (let neighbor of n.neighbors) {
                if (neighbor.color === currentColor) {
                        isAdjacent = true; break;
                }
            }

            // Nếu không kề ai dùng màu này -> Tô luôn
            if (!isAdjacent) {
                n.color = currentColor;
            }
        }
    }
    colorIndex++; // Đổi sang màu tiếp theo
}
```
> **Tại sao?**:
> *   Thuật toán này gọi là **Tham lam (Greedy)**: Với mỗi màu, nó cố gắng tô cho càng nhiều đỉnh càng tốt (miễn là không vi phạm luật kề nhau) trước khi buộc phải chuyển sang màu mới. Điều này giúp giảm thiểu số lượng màu cần dùng.
