export function initMinimax() {
    const boardEl = document.getElementById('game-board');
    const statusEl = document.getElementById('minimax-status');
    const typeSelect = document.getElementById('minimax-type');
    const depthInput = document.getElementById('minimax-depth');
    const depthVal = document.getElementById('depth-val');
    const restartBtn = document.getElementById('minimax-restart');

    let size = 3;
    let board = []; // Mảng 1 chiều biểu diễn bàn cờ (size * size)
    let currentPlayer = 'X'; // Người chơi (X)
    let gameActive = true;
    let maxDepth = 3; // Độ sâu tìm kiếm của AI

    // Khởi tạo Game
    function initGame() {
        size = parseInt(typeSelect.value);
        maxDepth = parseInt(depthInput.value);
        board = Array(size * size).fill(null);
        currentPlayer = 'X';
        gameActive = true;
        statusEl.innerText = "Lượt Bạn (X)";

        renderBoard();
    }

    // Vẽ bàn cờ HTML
    function renderBoard() {
        boardEl.innerHTML = '';
        boardEl.className = `game-board board-${size}`;

        board.forEach((cell, index) => {
            const cellEl = document.createElement('div');
            cellEl.classList.add('cell');
            if (cell) {
                cellEl.classList.add(cell.toLowerCase(), 'taken');
                cellEl.innerText = cell;
            }
            cellEl.addEventListener('click', () => handleMove(index));
            boardEl.appendChild(cellEl);
        });
    }

    // Xử lý khi người chơi đi
    function handleMove(index) {
        // Nếu game kết thúc hoặc ô đã đánh hoặc không phải lượt X -> Bỏ qua
        if (!gameActive || board[index] || currentPlayer !== 'X') return;

        makeMove(index, 'X');

        if (checkWin(board, 'X')) {
            endGame('Bạn Thắng! (Nhưng chắc khó xảy ra 😉)');
            return;
        }
        if (checkDraw(board)) {
            endGame('Hòa!');
            return;
        }

        // Chuyển sang lượt AI (O)
        currentPlayer = 'O';
        statusEl.innerText = "AI đang suy nghĩ...";

        // Dùng setTimeout để giao diện không bị đơ khi AI tính toán
        setTimeout(() => {
            const bestMove = getBestMove();
            makeMove(bestMove, 'O');

            if (checkWin(board, 'O')) {
                endGame('AI Thắng!');
            } else if (checkDraw(board)) {
                endGame('Hòa!');
            } else {
                currentPlayer = 'X';
                statusEl.innerText = "Lượt Bạn (X)";
            }
        }, 100);
    }

    function makeMove(index, player) {
        board[index] = player;
        renderBoard();
    }

    function endGame(msg) {
        gameActive = false;
        statusEl.innerText = msg;
    }

    // --- Logic Minimax Chính ---
    function getBestMove() {
        let bestScore = -Infinity;
        let move = -1;

        // Tối ưu hóa: Nếu là bàn 3x3 và ô giữa trống, đi luôn ô giữa cho nhanh
        if (size === 3 && board[4] === null) return 4;

        // Lấy danh sách các ô trống
        const moves = getAvailableMoves(board);

        // Duyệt qua tất cả các nước đi có thể và chọn cái tốt nhất
        for (let i of moves) {
            board[i] = 'O'; // AI đi thử
            // Gọi Minimax để tính điểm nước đi này
            let score = minimax(board, 0, false, -Infinity, Infinity);
            board[i] = null; // Hoàn tác (Backtrack)

            // Nếu điểm cao hơn điểm tốt nhất hiện tại -> Cập nhật
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
        return move;
    }

    // Điểm số cho các trạng thái kết thúc
    const SCORES = { 'O': 10, 'X': -10, 'TIE': 0 };

    /**
     * Hàm Minimax đệ quy có Cắt tỉa Alpha-Beta
     * @param {Array} boardState - Trạng thái bàn cờ
     * @param {Number} depth - Độ sâu hiện tại
     * @param {Boolean} isMaximizing - Lượt của AI (Max) hay Người (Min)
     * @param {Number} alpha - Giá trị tốt nhất cho Max (đã tìm thấy)
     * @param {Number} beta - Giá trị tốt nhất cho Min (đã tìm thấy)
     */
    function minimax(boardState, depth, isMaximizing, alpha, beta) {
        // Kiểm tra điều kiện dừng (Terminal States)
        if (checkWin(boardState, 'O')) return 10 - depth; // AI thắng càng sớm càng tốt (điểm cao)
        if (checkWin(boardState, 'X')) return depth - 10; // Người thắng càng muộn càng đỡ (điểm thấp)
        if (checkDraw(boardState)) return 0; // Hòa
        if (depth >= maxDepth) return heuristicEval(boardState); // Hết độ sâu cho phép -> Đánh giá heuristic

        const moves = getAvailableMoves(boardState);

        if (isMaximizing) {
            // Lượt của AI (Muốn điểm cao nhất)
            let bestScore = -Infinity;
            for (let i of moves) {
                boardState[i] = 'O';
                let score = minimax(boardState, depth + 1, false, alpha, beta);
                boardState[i] = null;
                bestScore = Math.max(score, bestScore);

                // Cập nhật Alpha
                alpha = Math.max(alpha, bestScore);
                // Cắt tỉa nhánh (Alpha-Beta Pruning)
                if (beta <= alpha) break;
            }
            return bestScore;
        } else {
            // Lượt của Người (Muốn điểm thấp nhất cho AI)
            let bestScore = Infinity;
            for (let i of moves) {
                boardState[i] = 'X';
                let score = minimax(boardState, depth + 1, true, alpha, beta);
                boardState[i] = null;
                bestScore = Math.min(score, bestScore);

                // Cập nhật Beta
                beta = Math.min(beta, bestScore);
                // Cắt tỉa nhánh
                if (beta <= alpha) break;
            }
            return bestScore;
        }
    }

    function getAvailableMoves(b) {
        const moves = [];
        for (let i = 0; i < b.length; i++) {
            if (b[i] === null) moves.push(i);
        }
        return moves;
    }

    // Hàm đánh giá Heuristic (khi chưa kết thúc game nhưng hết độ sâu tính toán)
    function heuristicEval(b) {
        // Đơn giản hóa: Trả về 0 (coi như hòa tạm thời)
        // Nếu muốn AI khôn hơn ở bàn cờ lớn, cần code thêm logic đếm số quân liên tiếp
        return 0;
    }

    // Kiểm tra Chiến thắng
    function checkWin(b, p) {
        // Điều kiện thắng phụ thuộc vào kích thước bàn cờ
        // Size 3 => Cần 3 con. Size >= 5 => Cần 4 con (demo) hoặc 5 con.
        const winLength = size === 3 ? 3 : (size === 5 ? 4 : 5);

        // Kiểm tra Hàng ngang
        for (let r = 0; r < size; r++) {
            for (let c = 0; c <= size - winLength; c++) {
                let match = true;
                for (let k = 0; k < winLength; k++) {
                    if (b[r * size + c + k] !== p) { match = false; break; }
                }
                if (match) return true;
            }
        }
        // Kiểm tra Hàng dọc
        for (let c = 0; c < size; c++) {
            for (let r = 0; r <= size - winLength; r++) {
                let match = true;
                for (let k = 0; k < winLength; k++) {
                    if (b[(r + k) * size + c] !== p) { match = false; break; }
                }
                if (match) return true;
            }
        }

        // Kiểm tra Chéo Chính (Huyền)
        for (let r = 0; r <= size - winLength; r++) {
            for (let c = 0; c <= size - winLength; c++) {
                let match = true;
                for (let k = 0; k < winLength; k++) {
                    if (b[(r + k) * size + (c + k)] !== p) { match = false; break; }
                }
                if (match) return true;
            }
        }

        // Kiểm tra Chéo Phụ (Sắc)
        for (let r = 0; r <= size - winLength; r++) {
            for (let c = winLength - 1; c < size; c++) {
                let match = true;
                for (let k = 0; k < winLength; k++) {
                    if (b[(r + k) * size + (c - k)] !== p) { match = false; break; }
                }
                if (match) return true;
            }
        }

        return false;
    }

    function checkDraw(b) {
        return b.every(cell => cell !== null);
    }

    // Sự kiện người dùng
    depthInput.addEventListener('input', (e) => {
        depthVal.innerText = e.target.value;
        maxDepth = parseInt(e.target.value);
    });

    restartBtn.addEventListener('click', initGame);
    typeSelect.addEventListener('change', initGame);

    initGame();
}
