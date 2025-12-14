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

        const coloredSet = new Set();

        // Vòng lặp tô màu
        while (coloredCount < nodes.length) {
            // Kiểm tra giới hạn màu
            if (colorIndex >= maxColors) {
                qaDiv.innerText = `Thất bại: Cần nhiều hơn ${maxColors} màu!`;
                return;
            }
            if (colorIndex >= COLORS.length) {
                qaDiv.innerText = "Hết mã màu trong bảng màu!";
                return;
            }
            const currentColor = COLORS[colorIndex]; // Chọn màu hiện tại

            // Tìm đỉnh đầu tiên chưa được tô màu (trong danh sách đã sắp xếp)
            let firstNode = null;
            for (let n of sortedNodes) {
                if (!n.color) {
                    firstNode = n;
                    break;
                }
            }
            if (!firstNode) break;

            // Tô màu cho đỉnh đó
            firstNode.color = currentColor;
            coloredSet.add(firstNode.id);
            coloredCount++;
            draw();
            await new Promise(r => setTimeout(r, 200)); // Animation chậm để dễ nhìn

            // Duyệt danh sách các đỉnh còn lại, tô cùng màu nếu không kề nhau
            for (let i = 0; i < sortedNodes.length; i++) {
                const n = sortedNodes[i];
                if (!n.color) {
                    // Kiểm tra xem nó có kề với bất kỳ thằng nào đang dùng màu hiện tại không
                    let isAdjacent = false;
                    for (let neighbor of n.neighbors) {
                        if (neighbor.color === currentColor) {
                            isAdjacent = true;
                            break;
                        }
                    }

                    // Nếu không kề ai dùng màu này -> Tô luôn
                    if (!isAdjacent) {
                        n.color = currentColor;
                        coloredSet.add(n.id);
                        coloredCount++;
                        draw();
                        await new Promise(r => setTimeout(r, 100)); // Animation
                    }
                }
            }

            // Chuyển sang màu tiếp theo
            colorIndex++;
        }

        qaDiv.innerText = `Đã dùng ${colorIndex} màu (Welsh-Powell)`;
    }

    genBtn.addEventListener('click', generateGraph);
    runBtn.addEventListener('click', runWelshPowell);

    setTimeout(resizeCanvas, 100);
}
