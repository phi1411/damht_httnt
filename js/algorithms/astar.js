export function initAStar() {
    const canvas = document.getElementById('astar-canvas');
    const ctx = canvas.getContext('2d');
    const runBtn = document.getElementById('astar-run');
    const resetBtn = document.getElementById('astar-reset');
    const sizeInput = document.getElementById('astar-size');
    const heuristicSelect = document.getElementById('astar-heuristic');
    const statsDiv = document.getElementById('astar-stats');

    let gridSize = 20;
    let cellSize = 0;
    let grid = []; // Mảng 2 chiều chứa các Node
    let startNode = null;
    let endNode = null;
    let isRunning = false;

    // Điều chỉnh kích thước canvas theo khung cha
    const resizeCanvas = () => {
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        initGrid();
    };

    window.addEventListener('resize', resizeCanvas);

    // Định nghĩa Class Node (Ô trên lưới)
    class Node {
        constructor(row, col) {
            this.row = row;
            this.col = col;
            this.wall = false; // Có phải là tường không?
            this.start = false; // Có phải điểm bắt đầu?
            this.end = false; // Có phải điểm kết thúc?
            this.g = 0; // Chi phí thực tế từ điểm đầu đến ô này
            this.h = 0; // Chi phí ước lượng (Heuristic) từ ô này đến đích
            this.f = 0; // Tổng chi phí: f = g + h
            this.parent = null; // Node cha (để truy vết đường đi)
            this.visited = false; // Đã nằm trong Closed Set (đã duyệt qua)
            this.open = false; // Đang nằm trong Open Set (chờ duyệt)
        }
    }

    // Khởi tạo lưới
    function initGrid() {
        gridSize = parseInt(sizeInput.value) || 20;
        // Tính toán kích thước mỗi ô sao cho vừa khung hình
        const minDim = Math.min(canvas.width, canvas.height);
        cellSize = Math.floor((minDim - 20) / gridSize);

        grid = [];
        for (let r = 0; r < gridSize; r++) {
            const row = [];
            for (let c = 0; c < gridSize; c++) {
                row.push(new Node(r, c));
            }
            grid.push(row);
        }

        // Đặt điểm Đầu và Cuối mặc định
        startNode = grid[1][1];
        startNode.start = true;
        endNode = grid[gridSize - 2][gridSize - 2];
        endNode.end = true;

        draw();
    }

    // Hàm vẽ lưới lên Canvas
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Tính toán để căn giữa lưới
        const offsetX = (canvas.width - cellSize * gridSize) / 2;
        const offsetY = (canvas.height - cellSize * gridSize) / 2;

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const node = grid[r][c];
                const x = offsetX + c * cellSize;
                const y = offsetY + r * cellSize;

                // Tô màu các ô dựa theo trạng thái
                ctx.fillStyle = '#1e293b'; // Màu mặc định
                if (node.wall) ctx.fillStyle = '#64748b'; // Tường (Xám)
                if (node.visited) ctx.fillStyle = 'rgba(56, 189, 248, 0.3)'; // Đã duyệt (Xanh nhạt)
                if (node.open) ctx.fillStyle = 'rgba(56, 189, 248, 0.6)'; // Đang chờ (Xanh đậm hơn)
                if (node.path) ctx.fillStyle = '#f472b6'; // Đường đi ngắn nhất (Hồng)
                if (node.start) ctx.fillStyle = '#4ade80'; // Điểm đầu (Xanh lá)
                if (node.end) ctx.fillStyle = '#f87171'; // Điểm cuối (Đỏ)

                ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
            }
        }
    }

    // Hàm Heuristic (Ước lượng khoảng cách)
    function heuristic(a, b) {
        const type = heuristicSelect.value;
        if (type === 'euclidean') {
            // Khoảng cách chim bay (Pitago)
            return Math.sqrt(Math.pow(a.row - b.row, 2) + Math.pow(a.col - b.col, 2));
        }
        // Khoảng cách Manhattan (Lái xe taxi - đi vuông góc)
        return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
    }

    // Xử lý sự kiện chuột (Vẽ tường, Kéo thả điểm)
    let isDrawingWall = false;
    let isErasingWall = false; // Chế độ xóa tường
    let isMovingStart = false;
    let isMovingEnd = false;

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', () => {
        isDrawingWall = false;
        isErasingWall = false;
        isMovingStart = false;
        isMovingEnd = false;
    });

    // Lấy tọa độ lưới từ sự kiện chuột
    function getCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const offsetX = (canvas.width - cellSize * gridSize) / 2;
        const offsetY = (canvas.height - cellSize * gridSize) / 2;

        const x = e.clientX - rect.left - offsetX;
        const y = e.clientY - rect.top - offsetY;

        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);

        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
            return { r: row, c: col };
        }
        return null;
    }

    function handleMouseDown(e) {
        if (isRunning) return;
        const pos = getCoords(e);
        if (!pos) return;

        const node = grid[pos.r][pos.c];

        if (node.start) { isMovingStart = true; return; }
        if (node.end) { isMovingEnd = true; return; }

        // Xác định là đang vẽ hay đang xóa dựa vào ô đầu tiên click
        if (node.wall) {
            isErasingWall = true;
            node.wall = false;
        } else {
            isDrawingWall = true;
            node.wall = true;
        }
        draw();
    }

    function handleDrag(e) {
        if (isRunning) return;
        // Kiểm tra xem chuột có đang nằm trong canvas không
        const rect = canvas.getBoundingClientRect();
        const isInCanvas = e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom;

        if (!isInCanvas && !isMovingStart && !isMovingEnd) return; // Nếu ra ngoài thì thôi, trừ khi đang kéo Start/End

        const pos = getCoords(e);
        if (!pos) return;
        const node = grid[pos.r][pos.c];

        // Logic kéo thả điểm Start/End
        if (isMovingStart && !node.wall && !node.end) {
            startNode.start = false;
            startNode = node;
            startNode.start = true;
            draw();
        } else if (isMovingEnd && !node.wall && !node.start) {
            endNode.end = false;
            endNode = node;
            endNode.end = true;
            draw();
        } else if (isDrawingWall && !node.start && !node.end) {
            node.wall = true;
            draw();
        } else if (isErasingWall && !node.start && !node.end) {
            node.wall = false;
            draw();
        }
    }

    // --- Thuật toán Chính: A* ---
    async function runAStar() {
        if (isRunning) return;
        isRunning = true;
        statsDiv.innerText = "Đang tìm đường...";

        // Reset lại trạng thái các node (xóa dữ liệu lần chạy trước)
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                grid[r][c].g = 0;
                grid[r][c].h = 0;
                grid[r][c].f = 0;
                grid[r][c].parent = null;
                grid[r][c].visited = false;
                grid[r][c].open = false;
                grid[r][c].path = false;
            }
        }

        // OpenSet chứa các node cần xem xét. Ban đầu chỉ có StartNode.
        let openSet = [startNode];
        startNode.open = true;

        while (openSet.length > 0) {
            // 1. Tìm node có chi phí F thấp nhất trong OpenSet
            let winner = 0;
            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[winner].f) {
                    winner = i;
                }
            }
            let current = openSet[winner];

            // 2. Nếu node đó là đích -> Kết thúc thành công
            if (current === endNode) {
                reconstructPath(current);
                isRunning = false;
                statsDiv.innerText = "Đã tìm thấy đường! Chi phí: " + current.g;
                return;
            }

            // 3. Chuyển node hiện tại từ OpenSet sang ClosedSet (đã duyệt)
            openSet.splice(winner, 1);
            current.open = false;
            current.visited = true;

            // 4. Xem xét các hàng xóm
            const neighbors = getNeighbors(current);
            for (let neighbor of neighbors) {
                // Bỏ qua nếu là tường hoặc đã duyệt rồi
                if (!neighbor.visited && !neighbor.wall) {
                    const tempG = current.g + 1; // Chi phí để đi từ Start đến hàng xóm này

                    let newPath = false;
                    // Nếu hàng xóm đã có trong OpenSet
                    if (openSet.includes(neighbor)) {
                        // Nếu đường mới này ngắn hơn đường cũ
                        if (tempG < neighbor.g) {
                            neighbor.g = tempG;
                            newPath = true;
                        }
                    } else {
                        // Nếu chưa có, thêm vào OpenSet
                        neighbor.g = tempG;
                        openSet.push(neighbor);
                        neighbor.open = true;
                        newPath = true;
                    }

                    // Nếu tìm được đường tối ưu hơn đến hàng xóm này
                    if (newPath) {
                        neighbor.h = heuristic(neighbor, endNode); // Tính khoảng cách còn lại
                        neighbor.f = neighbor.g + neighbor.h; // Tổng chi phí
                        neighbor.parent = current; // Ghi nhớ cha để sau này truy vết ngược
                    }
                }
            }

            draw(); // Vẽ lại để tạo hiệu ứng animation
            await new Promise(r => setTimeout(r, 10)); // Độ trễ animation
        }

        isRunning = false;
        statsDiv.innerText = "Không tìm thấy đường đi!";
    }

    // Lấy các ô xung quanh (4 hướng: Trên, Dưới, Trái, Phải)
    function getNeighbors(node) {
        const neighbors = [];
        const { row, col } = node;
        if (row > 0) neighbors.push(grid[row - 1][col]);
        if (row < gridSize - 1) neighbors.push(grid[row + 1][col]);
        if (col > 0) neighbors.push(grid[row][col - 1]);
        if (col < gridSize - 1) neighbors.push(grid[row][col + 1]);
        return neighbors;
    }

    // Truy vết ngược từ Đích về Start để vẽ đường đi
    function reconstructPath(current) {
        let temp = current;
        while (temp.parent) {
            temp.path = true;
            temp = temp.parent;
        }
        draw();
    }

    runBtn.addEventListener('click', runAStar);
    resetBtn.addEventListener('click', () => {
        initGrid();
        statsDiv.innerText = "Đã Reset Lưới";
    });

    setTimeout(resizeCanvas, 100);
}
