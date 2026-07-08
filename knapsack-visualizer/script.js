// --- Global State ---
let ads = [];
let budget = 1000;
let adIdCounter = 1;

// Giới hạn hiển thị trên giao diện để tránh treo trình duyệt với file lớn
const MAX_RENDER_ROWS = 100;

// --- DOM Elements ---
const budgetInput = document.getElementById('budget');
const adsBody = document.getElementById('ads-body');
const adsCountSpan = document.getElementById('ads-count');
const btnAddAd = document.getElementById('add-ad-row');
const btnRandom = document.getElementById('btn-random');
const btnUpload = document.getElementById('file-upload');
const btnRunAll = document.getElementById('btn-run-all');
const btnReset = document.getElementById('btn-reset');

// Toast
const toastEl = document.getElementById('toast');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    generateRandomData(5, 1000);
    
    // Populate dropdown with pre-loaded test data if available
    const presetSelect = document.getElementById('preset-data-select');
    if (presetSelect && typeof PRELOADED_TEST_DATA !== 'undefined') {
        // Sort filenames nicely
        const filenames = Object.keys(PRELOADED_TEST_DATA).sort((a, b) => {
            const numA = parseInt(a.match(/\d+/) || 0);
            const numB = parseInt(b.match(/\d+/) || 0);
            return numA - numB;
        });
        
        filenames.forEach(filename => {
            const option = document.createElement('option');
            option.value = filename;
            option.textContent = filename;
            presetSelect.appendChild(option);
        });
        
        presetSelect.addEventListener('change', (e) => {
            const selectedFile = e.target.value;
            if (selectedFile && PRELOADED_TEST_DATA[selectedFile]) {
                showToast(`Đang nạp file ${selectedFile}...`, false);
                setTimeout(() => {
                    parseFile(PRELOADED_TEST_DATA[selectedFile]);
                }, 50);
            }
        });
    }
});

// --- Utility Functions ---
function showToast(msg, isError = false) {
    toastEl.textContent = msg;
    if (isError) {
        toastEl.classList.add('error');
    } else {
        toastEl.classList.remove('error');
    }
    toastEl.classList.add('show');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

// --- Data Management & Rendering ---

function renderTable() {
    adsBody.innerHTML = '';
    
    // Chỉ render tối đa MAX_RENDER_ROWS
    const renderLimit = Math.min(ads.length, MAX_RENDER_ROWS);
    
    // Dùng DocumentFragment để tăng hiệu năng DOM
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < renderLimit; i++) {
        const ad = ads[i];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${ad.id}</td>
            <td><input type="number" class="ad-cost" data-index="${i}" value="${ad.cost}" min="0"></td>
            <td><input type="number" class="ad-profit" data-index="${i}" value="${ad.profit}" min="0"></td>
            <td><button class="btn-icon danger delete-row" data-index="${i}"><i class="fa-solid fa-trash"></i></button></td>
        `;
        fragment.appendChild(tr);
    }
    
    adsBody.appendChild(fragment);
    
    let infoText = ads.length.toString();
    if (ads.length > MAX_RENDER_ROWS) {
        infoText += ` (Đang hiển thị ${MAX_RENDER_ROWS} dòng đầu)`;
    }
    adsCountSpan.textContent = infoText;
}

// Bắt sự kiện trực tiếp trên adsBody (Event Delegation)
adsBody.addEventListener('input', (e) => {
    if (e.target.classList.contains('ad-cost') || e.target.classList.contains('ad-profit')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        if (!isNaN(index) && ads[index]) {
            const val = parseInt(e.target.value) || 0;
            if (e.target.classList.contains('ad-cost')) {
                ads[index].cost = val;
            } else {
                ads[index].profit = val;
            }
            ads[index].ratio = ads[index].cost > 0 ? ads[index].profit / ads[index].cost : 0;
        }
    }
});

adsBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-row');
    if (btn) {
        const index = parseInt(btn.getAttribute('data-index'));
        if (!isNaN(index)) {
            ads.splice(index, 1);
            renderTable(); // Re-render to update indices
        }
    }
});

function addAdRow(id, cost, profit) {
    ads.push({ id, cost, profit, ratio: cost > 0 ? profit / cost : 0 });
    adIdCounter = Math.max(adIdCounter, id + 1);
    // Tối ưu: Nếu chưa vượt quá giới hạn, gọi renderTable. 
    // Nếu vượt, không cần thêm vào UI, chỉ đẩy vào mảng.
    if (ads.length <= MAX_RENDER_ROWS) {
        renderTable();
    } else {
        adsCountSpan.textContent = `${ads.length} (Đang hiển thị ${MAX_RENDER_ROWS} dòng đầu)`;
    }
}

function clearAds() {
    ads = [];
    adIdCounter = 1;
    renderTable();
}

// --- Event Listeners ---

budgetInput.addEventListener('input', (e) => {
    budget = parseInt(e.target.value) || 0;
});

btnAddAd.addEventListener('click', () => {
    addAdRow(adIdCounter, 10, 20);
});

function generateRandomData(count, maxBudget) {
    clearAds();
    budgetInput.value = maxBudget;
    budget = maxBudget;
    for (let i = 0; i < count; i++) {
        addAdRow(adIdCounter, Math.floor(Math.random() * 200) + 10, Math.floor(Math.random() * 500) + 20);
    }
    renderTable();
}

btnRandom.addEventListener('click', () => {
    generateRandomData(Math.floor(Math.random() * 15) + 5, 1000);
    showToast('Đã tạo dữ liệu ngẫu nhiên mới');
});

btnUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Hiển thị thông báo đang xử lý vì đọc file lớn có thể tốn chút thời gian
    showToast('Đang tải file...', false);
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target.result;
        // Bỏ việc parse logic ra khỏi setTimeout, nhưng setTimeout giúp UI update Toast trước.
        setTimeout(() => {
            parseFile(text);
        }, 50);
        btnUpload.value = ''; 
    };
    reader.onerror = () => {
        showToast('Lỗi khi đọc file', true);
    };
    reader.readAsText(file);
});

function parseFile(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 1) {
        showToast('File trống hoặc không đúng định dạng', true);
        return;
    }
    
    const firstLineMatch = lines[0].match(/\d+/g);
    if (!firstLineMatch || firstLineMatch.length < 2) {
        showToast('Dòng đầu tiên phải chứa N (số lượng) và W (ngân sách)', true);
        return;
    }
    
    const N = parseInt(firstLineMatch[0]);
    const W = parseInt(firstLineMatch[1]);
    
    // Chặn file có ngân sách quá dị để tránh sập
    if (W > 10000000) {
        showToast(`Ngân sách W=${W} quá lớn! Hãy thử với dữ liệu nhỏ hơn.`, true);
        return;
    }
    
    // Tạo mảng ads mới thay vì dùng hàm addAdRow nhiều lần để tối ưu hiệu năng
    const newAds = [];
    let loaded = 0;
    for (let i = 1; i < lines.length; i++) {
        if (loaded >= N) break;
        const parts = lines[i].match(/\d+/g);
        if (parts && parts.length >= 2) {
            const cost = parseInt(parts[0]);
            const profit = parseInt(parts[1]);
            newAds.push({ 
                id: loaded + 1, 
                cost: cost, 
                profit: profit, 
                ratio: cost > 0 ? profit / cost : 0 
            });
            loaded++;
        }
    }
    
    ads = newAds;
    adIdCounter = loaded + 1;
    budget = W;
    budgetInput.value = W;
    
    renderTable();
    showToast(`Đã tải thành công ${loaded} quảng cáo từ file.`);
}

// --- Algorithms ---

btnRunAll.addEventListener('click', () => {
    // Đảm bảo budget được cập nhật
    budget = parseInt(budgetInput.value) || 0;
    
    if (ads.length === 0) {
        showToast('Không có dữ liệu quảng cáo để chạy!', true);
        return;
    }
    
    const N = ads.length;
    const W = budget;
    
    // Safety check for DP memory limit
    // N * W > 50,000,000 (khoảng 50MB cho Int32Array và 50MB cho Uint8Array)
    if (N * W > 50000000) {
        showToast(`Cảnh báo: Ma trận (N=${N}, W=${W}) = ${N*W} quá lớn, có thể gây treo tab. Chỉ chạy Tham Lam!`, true);
        
        // Disable DP UI
        document.getElementById('dp-profit').textContent = "Quá tải bộ nhớ";
        document.getElementById('dp-cost').textContent = "--";
        document.getElementById('dp-time').textContent = "--";
        document.getElementById('dp-selected-items').innerHTML = `<span class="empty-state">Bỏ qua DP để bảo vệ trình duyệt</span>`;
        
        // Run Greedy Only
        const greedyRes = runGreedy(ads, W);
        updateUI('greedy', greedyRes);
        updateComparison(null, greedyRes);
        return;
    }

    // Run DP
    const dpRes = runDP(ads, W);
    updateUI('dp', dpRes);
    
    // Run Greedy
    const greedyRes = runGreedy(ads, W);
    updateUI('greedy', greedyRes);
    
    // Compare
    updateComparison(dpRes, greedyRes);
    
    showToast('Đã chạy xong các thuật toán!');
});

btnReset.addEventListener('click', () => {
    // Reset DP UI
    document.getElementById('dp-profit').textContent = "--";
    document.getElementById('dp-cost').textContent = "-- / --";
    document.getElementById('dp-time').textContent = "--";
    document.getElementById('dp-selected-count').textContent = "0";
    document.getElementById('dp-selected-items').innerHTML = `<span class="empty-state">Chưa có dữ liệu</span>`;
    
    // Reset Greedy UI
    document.getElementById('greedy-profit').textContent = "--";
    document.getElementById('greedy-cost').textContent = "-- / --";
    document.getElementById('greedy-time').textContent = "--";
    document.getElementById('greedy-selected-count').textContent = "0";
    document.getElementById('greedy-selected-items').innerHTML = `<span class="empty-state">Chưa có dữ liệu</span>`;
    
    // Reset Comparison UI
    document.getElementById('cmp-dp-profit').textContent = "--";
    document.getElementById('cmp-greedy-profit').textContent = "--";
    document.getElementById('cmp-diff-profit').textContent = "--";
    document.getElementById('cmp-diff-profit').className = "";
    
    document.getElementById('cmp-dp-cost').textContent = "-- / --";
    document.getElementById('cmp-greedy-cost').textContent = "-- / --";
    document.getElementById('cmp-diff-cost').textContent = "--";
    
    document.getElementById('cmp-dp-ratio').textContent = "100%";
    document.getElementById('cmp-dp-ratio').className = "highlight-good";
    document.getElementById('cmp-greedy-ratio').textContent = "--";
    document.getElementById('cmp-greedy-ratio').className = "";
    document.getElementById('cmp-diff-ratio').textContent = "--";
    
    document.getElementById('cmp-dp-time').textContent = "--";
    document.getElementById('cmp-greedy-time').textContent = "--";
    document.getElementById('cmp-greedy-time').className = "highlight-good";
    document.getElementById('cmp-diff-time').textContent = "--";
    
    document.getElementById('comparison-conclusion').innerHTML = "Nhập dữ liệu và chạy thuật toán để xem đánh giá tổng quan.";
    
    // Reset preset select
    const presetSelect = document.getElementById('preset-data-select');
    if (presetSelect) presetSelect.value = "";
    
    showToast('Đã đặt lại kết quả!');
});

function runDP(adsList, W) {
    const start = performance.now();
    const n = adsList.length;
    
    const dp = new Int32Array(W + 1);
    
    // chosen[i][w]
    const chosen = [];
    for (let i = 0; i <= n; i++) {
        chosen.push(new Uint8Array(W + 1));
    }
    
    for (let i = 1; i <= n; i++) {
        const item = adsList[i-1];
        const cost = item.cost;
        const profit = item.profit;
        
        for (let w = W; w >= cost; w--) {
            if (dp[w - cost] + profit > dp[w]) {
                dp[w] = dp[w - cost] + profit;
                chosen[i][w] = 1;
            } else {
                chosen[i][w] = 0;
            }
        }
    }
    
    const maxProfit = dp[W];
    
    const selected = [];
    let currW = W;
    let totalCost = 0;
    
    for (let i = n; i >= 1; i--) {
        if (chosen[i][currW] === 1) {
            const item = adsList[i-1];
            selected.push(item);
            currW -= item.cost;
            totalCost += item.cost;
        }
    }
    
    const end = performance.now();
    
    return {
        profit: maxProfit,
        cost: totalCost,
        selected: selected.reverse(),
        time: (end - start).toFixed(2)
    };
}

function runGreedy(adsList, W) {
    const start = performance.now();
    
    const sortedAds = [...adsList].sort((a, b) => {
        if (a.ratio !== b.ratio) return b.ratio - a.ratio;
        if (a.profit !== b.profit) return b.profit - a.profit;
        return a.id - b.id;
    });
    
    const selected = [];
    let currentCost = 0;
    let totalProfit = 0;
    
    for (let i = 0; i < sortedAds.length; i++) {
        const ad = sortedAds[i];
        if (currentCost + ad.cost <= W) {
            selected.push(ad);
            currentCost += ad.cost;
            totalProfit += ad.profit;
        }
    }
    
    selected.sort((a, b) => a.id - b.id);
    
    const end = performance.now();
    
    return {
        profit: totalProfit,
        cost: currentCost,
        selected: selected,
        time: (end - start).toFixed(2)
    };
}

// --- UI Updates ---
function updateUI(prefix, result) {
    document.getElementById(`${prefix}-profit`).textContent = result.profit.toLocaleString();
    document.getElementById(`${prefix}-cost`).textContent = `${result.cost.toLocaleString()} / ${budget.toLocaleString()}`;
    document.getElementById(`${prefix}-time`).textContent = result.time;
    
    const selectedCount = document.getElementById(`${prefix}-selected-count`);
    const selectedItems = document.getElementById(`${prefix}-selected-items`);
    
    selectedCount.textContent = result.selected.length;
    
    if (result.selected.length === 0) {
        selectedItems.innerHTML = '<span class="empty-state">Không có quảng cáo nào được chọn</span>';
    } else {
        selectedItems.innerHTML = '';
        const limit = 50;
        
        // Optimize rendering chips
        const fragment = document.createDocumentFragment();
        
        result.selected.slice(0, limit).forEach(ad => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerHTML = `<strong>#${ad.id}</strong> (P:${ad.profit}, C:${ad.cost})`;
            fragment.appendChild(chip);
        });
        
        if (result.selected.length > limit) {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.style.background = 'rgba(255,255,255,0.05)';
            chip.innerHTML = `<em>+ ${result.selected.length - limit} mục khác</em>`;
            fragment.appendChild(chip);
        }
        selectedItems.appendChild(fragment);
    }
}

function updateComparison(dpRes, greedyRes) {
    const cmpDpProfit = document.getElementById('cmp-dp-profit');
    if (dpRes) {
        cmpDpProfit.textContent = dpRes.profit.toLocaleString();
    } else {
        cmpDpProfit.textContent = "N/A";
    }
    
    const cmpGreedyProfit = document.getElementById('cmp-greedy-profit');
    cmpGreedyProfit.textContent = greedyRes.profit.toLocaleString();
    
    const cmpDiffProfit = document.getElementById('cmp-diff-profit');
    if (dpRes) {
        const diff = dpRes.profit - greedyRes.profit;
        if (diff > 0) {
            cmpDiffProfit.textContent = `+${diff.toLocaleString()} (DP thắng)`;
            cmpDiffProfit.className = 'highlight-warning';
        } else if (diff === 0) {
            cmpDiffProfit.textContent = `0 (Hòa)`;
            cmpDiffProfit.className = 'highlight-good';
        } else {
            cmpDiffProfit.textContent = `${diff.toLocaleString()} (Greedy thắng - hiếm)`;
        }
    } else {
        cmpDiffProfit.textContent = "--";
    }
    
    const cmpDpCost = document.getElementById('cmp-dp-cost');
    if (dpRes) {
        cmpDpCost.textContent = `${dpRes.cost.toLocaleString()} / ${budget.toLocaleString()}`;
    } else {
        cmpDpCost.textContent = `N/A / ${budget.toLocaleString()}`;
    }
    
    document.getElementById('cmp-greedy-cost').textContent = `${greedyRes.cost.toLocaleString()} / ${budget.toLocaleString()}`;
    
    const cmpDiffCost = document.getElementById('cmp-diff-cost');
    if (dpRes) {
        const diffCost = dpRes.cost - greedyRes.cost;
        if (diffCost > 0) {
            cmpDiffCost.textContent = `DP tốn hơn ${diffCost.toLocaleString()}`;
        } else if (diffCost < 0) {
            cmpDiffCost.textContent = `Greedy tốn hơn ${Math.abs(diffCost).toLocaleString()}`;
        } else {
            cmpDiffCost.textContent = `Bằng nhau`;
        }
    } else {
        cmpDiffCost.textContent = "--";
    }
    
    const cmpGreedyRatio = document.getElementById('cmp-greedy-ratio');
    if (dpRes && dpRes.profit > 0) {
        const ratio = (greedyRes.profit / dpRes.profit) * 100;
        cmpGreedyRatio.textContent = `${ratio.toFixed(2)}%`;
        if (ratio === 100) cmpGreedyRatio.className = 'highlight-good';
        else if (ratio > 90) cmpGreedyRatio.className = 'highlight-warning';
        else cmpGreedyRatio.className = 'highlight-bad';
    } else {
        cmpGreedyRatio.textContent = dpRes ? "100%" : "N/A";
    }
    
    if (dpRes) {
        document.getElementById('cmp-dp-time').textContent = `${dpRes.time} ms`;
        const timeDiff = parseFloat(dpRes.time) - parseFloat(greedyRes.time);
        document.getElementById('cmp-diff-time').textContent = `Greedy nhanh hơn ${Math.abs(timeDiff).toFixed(2)} ms`;
    } else {
        document.getElementById('cmp-dp-time').textContent = `N/A`;
        document.getElementById('cmp-diff-time').textContent = `--`;
    }
    
    document.getElementById('cmp-greedy-time').textContent = `${greedyRes.time} ms`;
    
    const conclusion = document.getElementById('comparison-conclusion');
    if (dpRes) {
        if (dpRes.profit === greedyRes.profit) {
            conclusion.innerHTML = "<strong>Kết luận:</strong> Trong trường hợp này, thuật toán Tham lam cho kết quả <strong>hoàn hảo</strong> ngang bằng với Quy hoạch động nhưng tốn ít thời gian và bộ nhớ hơn rất nhiều.";
        } else {
            const loss = dpRes.profit - greedyRes.profit;
            const pct = ((loss / dpRes.profit) * 100).toFixed(2);
            conclusion.innerHTML = `<strong>Kết luận:</strong> Quy hoạch động cho lợi nhuận cao hơn Tham lam <strong>${loss.toLocaleString()}</strong> (${pct}%). Tham lam chạy nhanh hơn nhưng bỏ lỡ mất một phần lợi nhuận tối ưu.`;
        }
    } else {
        conclusion.innerHTML = "<strong>Kết luận:</strong> Dữ liệu quá lớn (Big Data), trình duyệt không đủ RAM để chạy Quy hoạch động. Thuật toán Tham lam lúc này là giải pháp khả thi duy nhất và vẫn đưa ra kết quả rất tốt chỉ trong tích tắc.";
    }
}
