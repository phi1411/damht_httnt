export function initGraphColoring() {
    const canvas = document.getElementById('graph-canvas');
    const ctx = canvas.getContext('2d');
    const genBtn = document.getElementById('graph-gen');
    const runBtn = document.getElementById('graph-run');
    const nodeInput = document.getElementById('graph-nodes');
    const densityInput = document.getElementById('graph-density');
    const maxColorsInput = document.getElementById('graph-colors-count');
    const qaDiv = document.getElementById('graph-colors-qa');

    let nodes = [];
    let edges = []; // Danh sách cạnh
    let nodeCount = 8;
    let nodeRadius = 20;

    // Tự động chỉnh kích thước canvas khi cửa sổ thay đổi
    const resizeCanvas = () => {
        const parent = canvas.parentElement;
        if (parent.clientWidth === 0) return;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        generateGraph();
    };

    // Theo dõi việc chuyển tab để vẽ lại canvas (sửa lỗi hiển thị)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('active') && !mutation.target.classList.contains('hidden')) {
                setTimeout(resizeCanvas, 50);
            }
        });
    });
    observer.observe(document.getElementById('graph'), { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('resize', resizeCanvas);

    // Định nghĩa Class Node cho đồ thị
    class GraphNode {
        constructor(id, x, y) {
            this.id = id;
            this.x = x;
            this.y = y;
            this.color = null; // Màu của node
            this.neighbors = []; // Danh sách các node hàng xóm
            this.degree = 0; // Bậc của node (số lượng hàng xóm)
            this.label = id;
        }
    }

    // Hàm tạo đồ thị ngẫu nhiên
    function generateGraph() {
        nodes = [];
        edges = [];
        nodeCount = parseInt(nodeInput.value) || 8;
        const density = parseFloat(densityInput.value) || 0.4; // Mật độ cạnh (0.1 -> 1.0)

        const width = canvas.width || 800;
        const height = canvas.height || 500;
        const margin = 50;

        // 1. Tạo các Node ngẫu nhiên (tránh bị chồng lấn nhau)
        for (let i = 0; i < nodeCount; i++) {
            let x, y, safe;
            let attempts = 0;
            do {
                safe = true;
                x = margin + Math.random() * (width - 2 * margin);
                y = margin + Math.random() * (height - 2 * margin);
                // Kiểm tra khoảng cách với các node đã tạo
                for (let n of nodes) {
                    const dist = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2);
                    if (dist < nodeRadius * 3) safe = false;
                }
                attempts++;
            } while (!safe && attempts < 100);

            nodes.push(new GraphNode(i, x, y));
        }

        // 2. Tạo các Cạnh (Edge) dựa trên mật độ Density
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                if (Math.random() < density) {
                    nodes[i].neighbors.push(nodes[j]);
                    nodes[j].neighbors.push(nodes[i]);
                    edges.push([nodes[i], nodes[j]]);
                }
            }
        }

        // 3. Tính bậc (Degree) cho mỗi node
        nodes.forEach(n => n.degree = n.neighbors.length);

        qaDiv.innerText = `Nodes: ${nodeCount}, Cạnh: ${edges.length}`;
        draw();
    }

    const COLORS = [
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'
    ];

    // Khởi tạo bảng màu động
    const paletteGrid = document.getElementById('palette-grid');

    function renderPalette() {
        if (!paletteGrid) return;
        paletteGrid.innerHTML = '';
        const count = parseInt(maxColorsInput.value) || 5;

        for (let i = 0; i < count; i++) {
            const input = document.createElement('input');
            input.type = 'color';
            input.className = 'palette-color-input';
            // Lấy màu mặc định từ mảng COLORS (xoay vòng nếu > length)
            input.value = COLORS[i % COLORS.length];
            input.title = `Màu ${i + 1}`;
            paletteGrid.appendChild(input);
        }
    }

    // Lắng nghe thay đổi số lượng màu để cập nhật bảng chọn
    maxColorsInput.addEventListener('input', renderPalette);

    // Gọi lần đầu
    renderPalette();

    function draw() {
        if (canvas.width === 0) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Vẽ dây nối (Cạnh)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 2;
        edges.forEach(([n1, n2]) => {
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
        });

        // Vẽ hình tròn (Node)
        nodes.forEach(n => {
            ctx.beginPath();
            ctx.arc(n.x, n.y, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = n.color ? n.color : '#1e293b';
            ctx.fill();
            ctx.strokeStyle = '#f1f5f9';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Vẽ nhãn (ID và Bậc)
            ctx.fillStyle = '#fff';
            ctx.font = '12px Outfit';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(n.id + ` (${n.degree})`, n.x, n.y);
        });
    }

    // --- Thuật toán Welsh-Powell ---
    async function runWelshPowell() {
        // Reset lại màu cũ
        nodes.forEach(n => n.color = null);
        draw();

        // Bước 1: Sắp xếp các đỉnh theo thứ tự Bậc giảm dần
        const sortedNodes = [...nodes].sort((a, b) => b.degree - a.degree);

        let colorIndex = 0;
        let coloredCount = 0;
        const maxColors = parseInt(maxColorsInput.value) || 5;

        // Lấy danh sách màu từ các ô input
        const currentPalette = [];
        const inputs = document.querySelectorAll('.palette-color-input');
        inputs.forEach(inp => currentPalette.push(inp.value));

        const coloredSet = new Set();

        // Duyệt từng đỉnh theo danh sách đã sắp xếp (Sequential Greedy)
        for (const node of sortedNodes) {
            // Tìm màu hợp lệ đầu tiên trong bảng màu
            let foundColor = null;

            for (let i = 0; i < currentPalette.length; i++) {
                const colorCandid = currentPalette[i];

                // Kiểm tra xem màu này có bị hàng xóm dùng chưa
                let isSafe = true;
                for (const neighbor of node.neighbors) {
                    if (neighbor.color === colorCandid) {
                        isSafe = false;
                        break;
                    }
                }

                if (isSafe) {
                    foundColor = colorCandid;
                    break; // Chọn ngay màu này
                }
            }

            if (foundColor) {
                node.color = foundColor;
                draw();
                await new Promise(r => setTimeout(r, 200)); // Animation
            } else {
                // Không tìm được màu trong bảng màu giới hạn
                // Có thể để trống hoặc báo lỗi (ở đây ta cứ để node không màu)
                console.log(`Node ${node.id} không tìm được màu hợp lệ trong ${maxColors} màu.`);
            }
        }

        // Đếm số màu thực tế đã dùng
        const usedColors = new Set(nodes.map(n => n.color).filter(c => c));
        qaDiv.innerText = `Hoàn tất! Đã dùng ${usedColors.size} màu.`;
    }

    genBtn.addEventListener('click', generateGraph);
    runBtn.addEventListener('click', runWelshPowell);

    setTimeout(resizeCanvas, 100);
}
