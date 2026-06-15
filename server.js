const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ================= HỆ THỐNG CƠ SỞ DỮ LIỆU TRÊN RAM SERVER =================
let db = {
    news: [
        { id: 'N1', type: 'QUYẾT ĐỊNH', title: 'Chính thức vận hành Cổng thông tin điện tử hành chính liên thông', content: 'Ban hành quy chế phối hợp liên ngành số hóa quốc gia diện Web Service tập trung.', time: '15/06/2026, 08:00:00' }
    ],
    warrants: [
        { id: 'W1', name: 'Robber_Pro', crime: 'Cướp ngân hàng trung ương, có vũ khí nguy hiểm', bounty: '50,000$', time: '15/06/2026' }
    ],
    citizens: {
        'Nguyen_Manh_Hoang': { name: 'Nguyen_Manh_Hoang', idCard: 'CCCD-2026', job: 'Đại tá Cục trưởng Cục An Ninh', status: 'Diện Cư Dân Hợp Pháp', record: 'Không tiền án tiền sự', military: 'Sĩ quan chuyên nghiệp', money: '1,500,000,000$', license: 'A1, A2, B2', weaponPermit: 'Đặc quyền tối cao' }
    ],
    documents: [
        { id: 'HS-9999', sender: 'Nguyen_Manh_Hoang', dept: 'CÔNG AN', content: 'Yêu cầu thẩm định cấp phát công cụ hỗ trợ đặc chủng tuần tra ban đêm.', status: 'Chờ thẩm xét', time: '15/06/2026, 08:10:00', replies: [{author: 'Hệ thống', role: 'Hệ thống', text: 'Hồ sơ đã khởi tạo thành công trên cụm máy chủ Render Web Service.'}], escalationStage: 'Bộ phận tiếp nhận', satisfaction: 'Chưa đánh giá' }
    ],
    accounts: {
        'admin': { username: 'admin', password: '123', realname: 'Đại tá Nguyễn Mạnh Hoàng', dept: 'QUẢN TRỊ', level: 'Lãnh đạo', statReceived: 1, statProcessed: 1, actionHistory: ['[15/06/2026, 08:00:00] Khởi tạo hệ thống quản trị tối cao hành chính liên thông.'] }
    },
    logs: ['[15/06/2026, 08:00:00] KHỞI TẠO MÁY CHỦ: Đồng bộ luồng đàm thoại 2 chiều và mô-đun kết xuất đồ họa Chart.js.'],
    securityStatus: 'SAFE'
};

// ================= CÁC API ENDPOINTS NGHIỆP VỤ =================
app.get('/api/db', (req, res) => res.json(db));

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (db.accounts[username] && db.accounts[username].password === password) {
        return res.json({ success: true, user: db.accounts[username] });
    }
    res.json({ success: false, message: 'Thông tin xác thực cơ yếu không chính xác!' });
});

app.post('/api/public-form', (req, res) => {
    const { sender, dept, content, time, id } = req.body;
    const newDoc = { id, sender, dept, content, status: 'Chờ thẩm xét', time, replies: [{author: 'Hệ thống', role: 'Hệ thống', text: 'Hồ sơ đã được đẩy lên hàng đợi xét duyệt.'}], escalationStage: 'Bộ phận tiếp nhận', satisfaction: 'Chưa đánh giá' };
    db.documents.unshift(newDoc);
    db.logs.unshift(`[${time}] Công dân @${sender} nộp đơn hồ sơ trực tuyến mới mã: ${id}`);
    res.json({ success: true });
});

app.post('/api/document/action', (req, res) => {
    const { id, status, username } = req.body;
    let doc = db.documents.find(d => d.id === id);
    if (doc) {
        doc.status = status;
        if (db.accounts[username]) {
            if (status === 'Đã tiếp nhận') db.accounts[username].statReceived = (db.accounts[username].statReceived || 0) + 1;
            else db.accounts[username].statProcessed = (db.accounts[username].statProcessed || 0) + 1;
            db.accounts[username].actionHistory.unshift(`[15/06/2026] Cập nhật tiến độ hồ sơ ${id} sang trạng thái: ${status}`);
        }
        db.logs.unshift(`[15/06/2026] Cán bộ @${username} cập nhật đơn thư ${id} thành: [${status}]`);
        return res.json({ success: true });
    }
    res.json({ success: false });
});

app.post('/api/document/reply', (req, res) => {
    const { id, author, role, text, username } = req.body;
    let doc = db.documents.find(d => d.id === id);
    if (doc) {
        doc.replies.push({ author, role, text });
        if (username && db.accounts[username]) {
            db.accounts[username].actionHistory.unshift(`[15/06/2026] Phát tin nhắn đàm thoại vào hồ sơ ${id}: "${text}"`);
        }
        db.logs.unshift(`[15/06/2026] Ghi nhận đàm thoại mới tại hồ sơ ${id} bởi ${author}`);
        return res.json({ success: true });
    }
    res.json({ success: false });
});

app.post('/api/document/transfer', (req, res) => {
    const { id, targetDept, username } = req.body;
    let doc = db.documents.find(d => d.id === id);
    if (doc) {
        const oldDept = doc.dept;
        doc.dept = targetDept;
        doc.status = `Đã điều chuyển từ [${oldDept}]`;
        if (db.accounts[username]) {
            db.accounts[username].actionHistory.unshift(`[15/06/2026] Điều chuyển đơn thư ${id} sang đơn vị [${targetDept}]`);
        }
        db.logs.unshift(`[15/06/2026] Cán bộ @${username} điều chuyển đơn thư ${id} sang phối hợp liên phòng [${targetDept}]`);
        return res.json({ success: true });
    }
    res.json({ success: false });
});

app.post('/api/document/escalate', (req, res) => {
    const { id, nextStage, username } = req.body;
    let doc = db.documents.find(d => d.id === id);
    if (doc) {
        doc.escalationStage = nextStage;
        if (db.accounts[username]) {
            db.accounts[username].actionHistory.unshift(`[15/06/2026] Trình chuyển tiếp tuyến hành chính đơn ${id} lên cấp [${nextStage}]`);
        }
        db.logs.unshift(`[15/06/2026] Tuyến hành chính hồ sơ ${id} được chuyển cấp lên: [${nextStage}]`);
        return res.json({ success: true });
    }
    res.json({ success: false });
});

app.post('/api/document/evaluate', (req, res) => {
    const { id, result } = req.body;
    let doc = db.documents.find(d => d.id === id);
    if (doc) {
        doc.satisfaction = result;
        if (result.includes('Khiếu nại')) {
            doc.status = 'Khiếu nại Khẩn cấp';
            doc.escalationStage = 'Cấp thanh tra chính phủ giám sát';
        }
        db.logs.unshift(`[15/06/2026] Hồ sơ ${id} nhận được đánh giá dân sự: [${result}]`);
        return res.json({ success: true });
    }
    res.json({ success: false });
});

app.post('/api/publish', (req, res) => {
    const { type, data, username } = req.body;
    if (type === 'news') db.news.unshift(data);
    else db.warrants.unshift(data);
    if (db.accounts[username]) {
        db.accounts[username].actionHistory.unshift(`[15/06/2026] Khắc bản chỉ thị ký duyệt văn bản quốc gia sắc lệnh mới.`);
    }
    db.logs.unshift(`[15/06/2026] Văn phòng lãnh đạo ban hành văn bản quy sắc pháp lý mới.`);
    res.json({ success: true });
});

app.post('/api/sync-id', (req, res) => {
    const { name, citizenData, username } = req.body;
    db.citizens[name] = citizenData;
    if (db.accounts[username]) {
        db.accounts[username].actionHistory.unshift(`[15/06/2026] Đồng bộ cập nhật cơ sở dữ liệu CCCD cư dân: ${name}`);
    }
    db.logs.unshift(`[15/06/2026] Đồng bộ số hóa hệ thống thông tin cư dân quốc gia: ${name}`);
    res.json({ success: true });
});

app.post('/api/account/create', (req, res) => {
    const { username, accountData } = req.body;
    db.accounts[username] = accountData;
    db.logs.unshift(`[15/06/2026] Cấp phát quyền trích xuất & tạo tài khoản cán bộ mới: @${username}`);
    res.json({ success: true });
});

app.post('/api/security/update', (req, res) => {
    db.securityStatus = req.body.status;
    db.logs.unshift(`[15/06/2026] Lãnh đạo tối cao ban sắc thay đổi tình trạng an ninh sang mức: [${req.body.status}]`);
    res.json({ success: true });
});

// ================= GIAO DIỆN NGƯỜI DÙNG CHUẨN ĐỒ HỌA =================
const htmlContent = `
<!DOCTYPE html>
<html lang="vi" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CỔNG THÔNG TIN ĐIỆN TỬ CHÍNH PHỦ GIẢ LẬP</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #0b111e; color: #e5e7eb; }
        .marquee-container { overflow: hidden; white-space: nowrap; }
        .marquee-text { display: inline-block; animation: marquee 25s linear infinite; }
        @keyframes marquee { 0% { transform: translate3d(100%, 0, 0); } 100% { transform: translate3d(-100%, 0, 0); } }
        .stamp { font-size: 11px; font-weight: 900; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; border: 2px solid; display: inline-block; transform: rotate(-5deg); font-family: monospace; letter-spacing: 1px; }
        .stamp-pending { border-color: #f59e0b; color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
        .stamp-received { border-color: #3b82f6; color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
        .stamp-approved { border-color: #10b981; color: #10b981; background: rgba(16, 185, 129, 0.1); }
        .stamp-rejected { border-color: #ef4444; color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        .stamp-complained { border-color: #ec4899; color: #ec4899; background: rgba(236, 72, 153, 0.15); animation: pulse 2s infinite; }
    </style>
</head>
<body class="min-h-screen flex flex-col justify-between">
    <header class="bg-[#090d16] border-b border-gray-800 shadow-xl">
        <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-4">
                <div class="bg-amber-500/10 p-3 rounded-lg border border-amber-500/30"><i class="fa-solid fa-landmark text-3xl text-amber-500"></i></div>
                <div>
                    <p class="text-xs font-bold tracking-widest text-amber-500 uppercase">Hệ thống quản lý hành chính liên thông giả lập [WEB SERVICE]</p>
                    <h1 class="text-xl md:text-2xl font-black text-white flex items-center gap-2 tracking-wide uppercase">Cổng thông tin điện tử chính phủ</h1>
                </div>
            </div>
            <div class="flex flex-wrap items-center gap-4 text-xs">
                <div class="bg-gray-900 border border-gray-800 px-3 py-2 rounded text-center">
                    <p class="text-gray-500 font-medium uppercase text-[10px]">Thời gian thực quốc gia</p>
                    <p id="live-clock" class="text-cyan-400 font-mono text-sm font-bold mt-0.5">00:00:00 15/6/2026</p>
                </div>
                <div class="bg-gray-900 border border-gray-800 px-3 py-2 rounded flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-emerald-500" id="status-dot"></div>
                    <div>
                        <p class="text-gray-500 font-medium uppercase text-[10px]">Tình trạng an ninh</p>
                        <p id="current-security-status" class="text-emerald-400 font-bold uppercase tracking-wide">An Toàn</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="bg-amber-500 text-black font-bold text-sm py-2 flex items-center">
            <div class="bg-red-600 text-white px-4 py-1 flex items-center gap-2 uppercase tracking-wider text-xs font-black shrink-0 h-full">Hỏa tốc khẩn sắc</div>
            <div class="marquee-container w-full"><span id="web-marquee" class="marquee-text px-4">[🔥 ĐÀM THOẠI 2 CHIỀU]: Hệ thống liên thông bảo mật lõi xử lý, đồng bộ dữ liệu đàm thoại đa phương thời gian thực...</span></div>
        </div>
        <nav class="bg-[#0e1726] border-b border-gray-800">
            <div class="max-w-7xl mx-auto px-2 flex flex-wrap justify-between items-center">
                <div class="flex flex-wrap text-sm font-medium">
                    <button onclick="switchTab('tab-news')" id="btn-tab-news" class="nav-btn px-4 py-3.5 border-b-2 border-amber-500 text-amber-500 flex items-center gap-2"><i class="fa-solid fa-newspaper"></i> Bản Tin Quốc Gia</button>
                    <button onclick="switchTab('tab-id')" id="btn-tab-id" class="nav-btn px-4 py-3.5 border-b-2 border-transparent text-gray-400 hover:text-white flex items-center gap-2"><i class="fa-solid fa-id-card"></i> Tra Cứu Căn Cước</button>
                    <button onclick="switchTab('tab-public-admin')" id="btn-tab-public-admin" class="nav-btn px-4 py-3.5 border-b-2 border-transparent text-gray-400 hover:text-white flex items-center gap-2"><i class="fa-solid fa-file-invoice"></i> Hành Chính Trực Tuyến</button>
                    <button onclick="switchTab('tab-officer')" id="btn-tab-officer" class="nav-btn hidden px-4 py-3.5 border-b-2 border-transparent text-emerald-400 hover:text-emerald-300 items-center gap-2 font-semibold"><i class="fa-solid fa-shield-halved"></i> Khối Ban Ngành</button>
                    <button onclick="switchTab('tab-supervisor')" id="btn-tab-supervisor" class="nav-btn hidden px-4 py-3.5 border-b-2 border-transparent text-purple-400 hover:text-purple-300 items-center gap-2 font-semibold"><i class="fa-solid fa-crown"></i> Văn Phòng Chủ Tịch</button>
                </div>
                <div class="px-4 py-2 text-xs flex items-center gap-4">
                    <div id="logged-user-info" class="hidden items-center gap-2">
                        <span id="user-level-badge" class="bg-amber-500 text-black px-1.5 py-0.5 rounded font-bold text-[10px]">CÁN BỘ</span>
                        <span id="current-session-user" class="font-mono text-white"></span>
                        <button onclick="logoutSystem()" class="text-red-400 hover:text-red-300 font-bold ml-2 underline">Đăng Xuất</button>
                    </div>
                    <button id="login-trigger-btn" onclick="openLoginModal()" class="bg-amber-500 hover:bg-amber-600 text-black font-black px-3 py-1 rounded text-[11px] uppercase tracking-wide"><i class="fa-solid fa-lock-open"></i> Đăng Nhập Cán Bộ</button>
                </div>
            </div>
        </nav>
    </header>
    <main class="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6">
        <section id="tab-news" class="tab-content block">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 space-y-4">
                    <h2 class="text-lg font-bold text-white flex items-center gap-2 border-l-4 border-amber-500 pl-2 uppercase">Hệ Thống Văn Bản / Sắc Chỉ Ban Hành</h2>
                    <div id="news-container" class="space-y-4"></div>
                </div>
                <div class="space-y-4">
                    <h2 class="text-lg font-bold text-white flex items-center gap-2 border-l-4 border-red-500 pl-2 uppercase">Danh Sách Đối Tượng Tầm Nã Đặc Biệt</h2>
                    <div id="warrant-container" class="space-y-4"></div>
                </div>
            </div>
        </section>
        <section id="tab-id" class="tab-content hidden">
            <div class="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl">
                <div class="text-center mb-6">
                    <h2 class="text-lg font-bold text-white uppercase flex items-center justify-center gap-2"><i class="fa-solid fa-magnifying-glass text-amber-500"></i> Trung Tâm Truy Xuất Thông Tin Định Danh Dân Sự</h2>
                </div>
                <div class="flex gap-2 mb-4">
                    <input type="text" id="search-id-input" placeholder="Nhập Họ_Tên nhân vật tra cứu..." class="w-full bg-[#0b111e] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 font-mono">
                    <button onclick="executeIdSearch()" class="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 rounded-lg text-xs uppercase">Truy xuất</button>
                </div>
                <div id="id-search-result" class="mt-4"></div>
            </div>
        </section>
        <section id="tab-public-admin" class="tab-content hidden">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                    <h3 class="text-md font-bold text-white flex items-center gap-2 uppercase border-b border-gray-800 pb-2">Khởi tạo đơn thư điện tử</h3>
                    <div class="space-y-3 text-sm">
                        <div>
                            <label class="block text-gray-400 mb-1">Tên nhân vật (Họ_Tên)</label>
                            <input type="text" id="form-sender" placeholder="Nguyen_Manh_Hoang" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white font-mono">
                        </div>
                        <div>
                            <label class="block text-gray-400 mb-1">Thể loại dịch vụ</label>
                            <select id="form-dept" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white">
                                <option value="CÔNG AN">CÔNG AN - Đăng ký Thẻ Căn Cước Gắn Chíp</option>
                                <option value="CÔNG AN">CÔNG AN - Cấp phép sở hữu vũ khí</option>
                                <option value="QUÂN SỰ">QUÂN SỰ - Đăng ký tham gia Nghĩa vụ quân sự tự nguyện</option>
                                <option value="TÒA ÁN">TÒA ÁN - Đơn khởi kiện dân sự / Hình sự toàn quốc</option>
                                <option value="KHO BẠC">KHO BẠC - Giao dịch ngân sách quốc gia</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-gray-400 mb-1">Nội dung đề xuất giải quyết</label>
                            <textarea id="form-content" rows="4" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white text-xs"></textarea>
                        </div>
                        <button onclick="submitPublicForm()" class="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2.5 rounded uppercase text-xs">Gửi đơn thẩm định</button>
                    </div>
                </div>
                <div class="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col justify-between min-h-[420px]">
                    <div class="space-y-4 w-full">
                        <h3 class="text-md font-bold text-white flex items-center gap-2 uppercase border-b border-gray-800 pb-2">Kiểm tra tiến độ & Đàm thoại trực tuyến</h3>
                        <div class="flex gap-2">
                            <input type="text" id="track-id-input" placeholder="Nhập mã đơn thư hệ thống cấp (HS-XXXX)" class="w-full bg-[#0b111e] border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm">
                            <button onclick="trackDocument()" class="bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-4 rounded uppercase text-xs">Tra cứu</button>
                        </div>
                        <div id="track-result" class="hidden bg-gray-950 border border-gray-800 rounded-lg p-4 space-y-3"></div>
                    </div>
                </div>
            </div>
        </section>
        <section id="tab-officer" class="tab-content hidden">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="bg-gray-900 border border-gray-800 rounded-xl p-5" id="officer-publish-block">
                    <h4 class="text-sm font-bold text-white uppercase border-b border-gray-800 pb-2 mb-3">Ban hành chỉ thị Sắc lệnh</h4>
                    <div class="space-y-3 text-xs">
                        <div class="flex gap-4">
                            <label><input type="radio" name="publish-type" value="news" checked onchange="toggleFormInputs('news')"> Tin Tức</label>
                            <label><input type="radio" name="publish-type" value="warrant" onchange="toggleFormInputs('warrant')"> Lệnh Truy Nã</label>
                        </div>
                        <div id="group-input-news" class="space-y-3">
                            <div class="flex items-center gap-2"><input type="checkbox" id="news-marquee"> <label for="news-marquee" class="text-amber-500 font-bold">Chạy chữ khẩn cấp</label></div>
                            <input type="text" id="news-title" placeholder="Tiêu đề..." class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white">
                            <textarea id="news-content" rows="3" placeholder="Nội dung điều khoản..." class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white"></textarea>
                        </div>
                        <div id="group-input-warrant" class="space-y-3 hidden">
                            <input type="text" id="warrant-name" placeholder="Tên nhân vật @Họ_Tên" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white font-mono">
                            <input type="text" id="warrant-crime" placeholder="Tội danh..." class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white">
                            <input type="text" id="warrant-bounty" placeholder="Tiền thưởng..." class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white font-mono">
                        </div>
                        <button onclick="executePublish()" class="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 rounded uppercase text-xs">Phát hành sắc lệnh</button>
                    </div>
                </div>
                <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                    <h4 class="text-sm font-bold text-white uppercase border-b border-gray-800 pb-2">Đồng bộ căn cước dân cư</h4>
                    <div class="space-y-2 text-xs">
                        <input type="text" id="id-name" placeholder="Họ_Tên" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white font-mono">
                        <input type="text" id="id-number" placeholder="Mã Số CCCD" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white font-mono">
                        <input type="text" id="id-job" placeholder="Chức vụ/Nghề nghiệp" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white">
                        <input type="text" id="id-license" placeholder="Bằng lái GPLX" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white">
                        <input type="text" id="id-weapon-permit" placeholder="Giấy phép súng" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white">
                        <select id="id-status" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white">
                            <option value="Diện Cư Dân Hợp Pháp">Diện Cư Dân Hợp Pháp</option>
                            <option value="Đang Bị Điều Tra Tư Pháp">Đang Bị Điều Tra Tư Pháp</option>
                        </select>
                        <input type="text" id="id-record" placeholder="Tiền án tiền sự" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white">
                        <input type="text" id="id-military" placeholder="Nghĩa vụ quân sự" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white">
                        <input type="text" id="id-cash" placeholder="Tài sản ví dụ: 500,000$" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white font-mono">
                        <button onclick="executeSyncId()" class="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2 rounded uppercase text-xs">Đồng bộ dữ liệu</button>
                    </div>
                </div>
                <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 flex flex-col">
                    <h4 class="text-sm font-bold text-white uppercase border-b border-gray-800 pb-2">Tiếp nhận & xử lý hồ sơ hành chính</h4>
                    <div id="officer-assigned-dept-badge" class="text-xs text-amber-400 font-bold bg-gray-950 p-2 rounded border border-gray-800 font-mono"></div>
                    <div id="officer-docs-list" class="space-y-3 flex-grow overflow-y-auto max-h-[360px] text-xs"></div>
                </div>
            </div>
        </section>
        <section id="tab-supervisor" class="tab-content hidden">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                    <h3 class="text-md font-bold text-purple-400 uppercase border-b border-gray-800 pb-2">Cấp phát tài khoản cán bộ</h3>
                    <div class="space-y-3 text-xs">
                        <input type="text" id="account-username" placeholder="Tên tài khoản (username)" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white font-mono">
                        <input type="password" id="account-password" placeholder="Mật mã an ninh" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white font-mono">
                        <input type="text" id="account-realname" placeholder="Họ tên cán bộ thực tế" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white">
                        <select id="account-dept" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white">
                            <option value="CÔNG AN">CÔNG AN</option>
                            <option value="QUÂN SỰ">QUÂN SỰ</option>
                            <option value="TÒA ÁN">TÒA ÁN</option>
                            <option value="KHO BẠC">KHO BẠC</option>
                        </select>
                        <select id="account-level" class="w-full bg-[#0b111e] border border-gray-700 rounded p-2 text-white">
                            <option value="Trực ban">Cán bộ Tiếp nhận (Trực ban)</option>
                            <option value="Lãnh đạo">Cấp bậc chỉ huy Lãnh đạo</option>
                        </select>
                        <button onclick="executeCreateAccount()" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded uppercase text-xs">Kích hoạt tài khoản</button>
                    </div>
                    <div class="pt-4 border-t border-gray-800">
                        <h4 class="text-xs font-bold text-amber-400 uppercase mb-2"><i class="fa-solid fa-history"></i> Nhật ký quá trình xử lý của cán bộ</h4>
                        <select id="select-officer-history" onchange="viewOfficerHistory(this.value)" class="w-full bg-gray-950 border border-gray-700 text-white rounded p-1.5 text-xs focus:outline-none mb-2"></select>
                        <div id="officer-history-logs" class="bg-gray-950 p-2 rounded border border-gray-800 text-[11px] font-mono max-h-[150px] overflow-y-auto text-gray-400">Vui lòng chọn cán bộ để xem lại quá trình làm việc.</div>
                    </div>
                </div>
                <div class="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                    <div class="flex justify-between items-center border-b border-gray-800 pb-2">
                        <h3 class="text-md font-bold text-purple-400 uppercase"><i class="fa-solid fa-chart-line"></i> Thống kê biểu đồ KPI hiệu suất phòng ban</h3>
                        <div class="flex items-center gap-2 text-xs">
                            <span class="text-gray-400">An ninh quốc gia:</span>
                            <select id="config-security-select" onchange="updateSecurityStatus(this.value)" class="bg-gray-950 border border-gray-700 rounded px-2 py-0.5 text-white">
                                <option value="SAFE">AN TOÀN / BÌNH THƯỜNG</option>
                                <option value="WARN">TĂNG CƯỜNG CẢNH GIÁC</option>
                                <option value="DANGER">BÁO ĐỘNG ĐỎ KHẨN CẤP</option>
                            </select>
                        </div>
                    </div>
                    <div class="bg-gray-950 p-4 rounded-xl border border-gray-800 h-[220px] flex items-center justify-center">
                        <canvas id="kpiChart" class="w-full h-full"></canvas>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr class="border-b border-gray-800 text-gray-500 font-bold uppercase">
                                    <th class="py-2 px-3">Tài khoản</th>
                                    <th class="py-2 px-3">Họ Tên Cán Bộ</th>
                                    <th class="py-2 px-3">Cơ Quan</th>
                                    <th class="py-2 px-3">Cấp Bậc</th>
                                    <th class="py-2 px-3 text-center">Đã Nhận</th>
                                    <th class="py-2 px-3 text-center">Đã Duyệt</th>
                                </tr>
                            </thead>
                            <tbody id="supervisor-stats-table-body" class="divide-y divide-gray-800 font-mono text-gray-300"></tbody>
                        </table>
                    </div>
                    <div class="pt-2 border-t border-gray-800">
                        <div id="system-logs-container" class="space-y-2 max-h-[120px] overflow-y-auto text-[11px] font-mono"></div>
                    </div>
                </div>
            </div>
        </section>
    </main>
    <div id="login-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="bg-gray-900 border border-gray-800 w-full max-w-sm rounded-xl p-6 relative shadow-2xl">
            <h3 class="text-sm font-bold text-white uppercase text-center mb-4">Xác thực chứng thư điện tử ban ngành</h3>
            <div class="space-y-3 text-xs">
                <input type="text" id="login-username" placeholder="Mã tài khoản..." class="w-full bg-[#0b111e] border border-gray-700 rounded p-2.5 text-white font-mono">
                <input type="password" id="login-password" placeholder="Mật mã bảo mật..." class="w-full bg-[#0b111e] border border-gray-700 rounded p-2.5 text-white font-mono">
                <button onclick="processLogin()" class="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-2.5 rounded uppercase text-xs">Xác thực</button>
            </div>
        </div>
    </div>
    <footer class="bg-[#090d16] border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        <p>© 2026 CỔNG THÔNG TIN ĐIỆN TỬ CHÍNH PHỦ GIẢ LẬP - FULLSTACK WEB SERVICE</p>
    </footer>
    <script>
        let globalDB = {};
        let myChartInstance = null;
        let currentUserSession = null;

        async function refreshDataFromServer() {
            try {
                const res = await fetch('/api/db');
                globalDB = await res.json();
                document.getElementById('current-security-status').innerText = globalDB.securityStatus === 'SAFE' ? 'An Toàn / Bình Thường' : globalDB.securityStatus === 'WARN' ? 'Tăng Cường Cảnh Giác' : 'NGUY HIỂM / BÁO ĐỘNG ĐỎ';
                document.getElementById('status-dot').className = "w-3 h-3 rounded-full " + (globalDB.securityStatus === 'SAFE' ? 'bg-emerald-500' : globalDB.securityStatus === 'WARN' ? 'bg-amber-500' : 'bg-red-500 animate-ping');
                renderNewsAndWarrants();
                renderOfficerDocs();
                renderSupervisorStats();
                renderLogs();
                updateOfficerSelectMenu();
                renderChartKPI();
            } catch (err) { console.error("Lỗi đồng bộ hệ thống:", err); }
        }

        async function processLogin() {
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value.trim();
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if(data.success) {
                currentUserSession = data.user;
                alert('Xác thực chứng thư thành công!');
                closeLoginModal();
                updateAuthUI();
                await refreshDataFromServer();
                switchTab('tab-news');
            } else { alert(data.message); }
        }

        function updateAuthUI() {
            const triggerBtn = document.getElementById('login-trigger-btn');
            const userInfoZone = document.getElementById('logged-user-info');
            const tabOfficerBtn = document.getElementById('btn-tab-officer');
            const tabSupervisorBtn = document.getElementById('btn-tab-supervisor');
            if (currentUserSession) {
                if(triggerBtn) triggerBtn.classList.add('hidden');
                if(userInfoZone) userInfoZone.classList.remove('hidden');
                document.getElementById('current-session-user').innerText = currentUserSession.realname + " (" + currentUserSession.level + ")";
                if(tabOfficerBtn) tabOfficerBtn.classList.remove('hidden');
                if (currentUserSession.username === 'admin' || currentUserSession.dept === 'QUẢN TRỊ') {
                    if(tabSupervisorBtn) tabSupervisorBtn.classList.remove('hidden');
                } else { if(tabSupervisorBtn) tabSupervisorBtn.classList.add('hidden'); }
            } else {
                if(triggerBtn) triggerBtn.classList.remove('hidden');
                if(userInfoZone) userInfoZone.classList.add('hidden');
                if(tabOfficerBtn) tabOfficerBtn.classList.add('hidden');
                if(tabSupervisorBtn) tabSupervisorBtn.classList.add('hidden');
            }
        }

        async function submitPublicForm() {
            const sender = document.getElementById('form-sender').value.trim();
            const dept = document.getElementById('form-dept').value;
            const content = document.getElementById('form-content').value.trim();
            if(!sender || !content) return alert('Vui lòng nhập đầy đủ thông tin!');
            const randomId = 'HS-' + Math.floor(1000 + Math.random() * 9000);
            const now = new Date();
            const timeStr = String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0') + " 15/6/2026";
            await fetch('/api/public-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: randomId, sender, dept, content, time: timeStr })
            });
            alert("Nộp đơn thư thành công! Mã tra cứu: " + randomId);
            document.getElementById('form-content').value = '';
            document.getElementById('track-id-input').value = randomId;
            await refreshDataFromServer();
            trackDocument();
        }

        function trackDocument() {
            const trackId = document.getElementById('track-id-input').value.trim();
            const resultBox = document.getElementById('track-result');
            if(!trackId || !resultBox) return;
            const doc = globalDB.documents.find(d => d.id === trackId);
            if(doc) {
                resultBox.classList.remove('hidden');
                let stampHtml = '<div class="stamp stamp-pending">[CHỜ THẨM XÉT]</div>';
                if(doc.status.includes('tiếp nhận')) stampHtml = '<div class="stamp stamp-received">[ĐÃ TIẾP NHẬN]</div>';
                if(doc.status.includes('Chấp thuận') || doc.status.includes('Phê chuẩn')) stampHtml = '<div class="stamp stamp-approved">[ĐÃ PHÊ CHUẨN]</div>';
                if(doc.status.includes('Từ chối') || doc.status.includes('Bác bỏ')) stampHtml = '<div class="stamp stamp-rejected">[BÁC BỎ ĐƠN]</div>';
                if(doc.status.includes('Khiếu nại')) stampHtml = '<div class="stamp stamp-complained">[KHIẾU NẠI KHẨN]</div>';
                let repliesHtml = '';
                doc.replies.forEach(r => {
                    repliesHtml += '<div class="bg-gray-900 border border-gray-800 p-2 rounded text-xs"><p class="text-cyan-400 font-bold">' + r.author + ' (' + r.role + '):</p><p class="text-white italic">\"' + r.text + '\"</p></div>';
                });
                resultBox.innerHTML = '\\
                    <div class="border-b border-gray-800 pb-2 flex justify-between items-center text-xs">\\
                        <div>\\
                            <p class="font-mono text-gray-400 font-bold">Mã hồ sơ: <span class="text-cyan-400">' + doc.id + '</span></p>\\
                            <p class="text-purple-400 text-[11px]">Tuyến hành chính: ' + doc.escalationStage + '</p>\\
                            <p class="text-gray-500 text-[10px] mt-0.5">Đánh giá: ' + doc.satisfaction + '</p>\\
                        </div>\\
                        <div>' + stampHtml + '</div>\\
                    </div>\\
                    <p class="text-xs bg-gray-900 p-2 rounded mt-2 italic">\"' + doc.content + '\"</p>\\
                    <div class="space-y-1.5 max-h-[100px] overflow-y-auto pt-2">' + repliesHtml + '</div>\\
                    <div class="pt-2 border-t border-gray-800 space-y-2">\\
                        <div class="flex gap-2">\\
                            <input type="text" id="citizen-reply-text" placeholder="Nhập tin nhắn..." class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white">\\
                            <button onclick="submitCitizenReply(\'' + doc.id + '\')" class="bg-cyan-500 text-black font-bold px-3 py-1 text-xs rounded">Gửi</button>\\
                        </div>\\
                        <div class="flex gap-2">\\
                            <button onclick="submitEvaluation(\'' + doc.id + '\', \'Hài lòng\')" class="bg-emerald-600 px-2 py-0.5 text-[10px] text-white font-bold rounded">HÀI LÒNG</button>\\
                            <button onclick="submitEvaluation(\'' + doc.id + '\', \'Khiếu nại Khẩn cấp\')" class="bg-amber-500 px-2 py-0.5 text-[10px] text-black font-bold rounded">KHIẾU NẠI</button>\\
                        </div>\\
                    </div>';
            }
        }

        async function submitCitizenReply(id) {
            const text = document.getElementById('citizen-reply-text').value.trim();
            if(!text) return;
            await fetch('/api/document/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, author: 'Cư dân chủ đơn', role: 'Công dân', text })
            });
            await refreshDataFromServer();
            trackDocument();
        }

        async function submitEvaluation(id, result) {
            await fetch('/api/document/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, result })
            });
            await refreshDataFromServer();
            trackDocument();
        }

        function renderOfficerDocs() {
            if(!currentUserSession || !globalDB.documents) return;
            const container = document.getElementById('officer-docs-list');
            if(!container) return;
            container.innerHTML = '';
            const filtered = globalDB.documents.filter(d => currentUserSession.username === 'admin' || currentUserSession.dept === 'QUẢN TRỊ' || d.dept === currentUserSession.dept || d.status === 'Khiếu nại Khẩn cấp');
            filtered.forEach(doc => {
                let repliesHtml = '';
                doc.replies.forEach(r => {
                    repliesHtml += '<div class="py-0.5 border-b border-gray-900 text-gray-500"><span class="text-cyan-400 font-bold">' + r.author + ':</span> ' + r.text + '</div>';
                });
                container.innerHTML += '\\
                    <div class="bg-gray-950 p-3 rounded border border-gray-800 space-y-2">\\
                        <div class="flex justify-between font-mono text-[10px]">\\
                            <span class="text-cyan-400 font-bold">' + doc.id + '</span>\\
                            <span class="text-amber-400 uppercase">' + doc.status + '</span>\\
                        </div>\\
                        <p class="text-gray-300 font-medium text-xs">Người nộp: @' + doc.sender + ' | Tuyến: ' + doc.escalationStage + '</p>\\
                        <p class="text-gray-400 italic bg-gray-900 p-2 rounded">\"' + doc.content + '\"</p>\\
                        <div class="bg-gray-900/60 p-2 rounded text-[11px] max-h-[80px] overflow-y-auto space-y-0.5">\\
                            ' + repliesHtml + '\\
                        </div>\\
                        <div class="flex flex-wrap gap-1">\\
                            <button onclick="updateDocStatus(\'' + doc.id + '\', \'Đã tiếp nhận\')" class="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px]">TIẾP NHẬN</button>\\
                            <button onclick="updateDocStatus(\'' + doc.id + '\', \'Phê chuẩn / Chấp thuận\')" class="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px]">DUYỆT</button>\\
                            <button onclick="updateDocStatus(\'' + doc.id + '\', \'Bác bỏ / Từ chối đơn\')" class="bg-red-600 text-white px-2 py-0.5 rounded text-[10px]">BÁC BỎ</button>\\
                            <button onclick="escalateToLeader(\'' + doc.id + '\')" class="bg-purple-600 text-white px-2 py-0.5 rounded text-[10px]">TRÌNH LÃNH ĐẠO</button>\\
                        </div>\\
                        <div class="text-[10px] text-gray-500">\\
                            Chuyển cơ quan khác:\\
                            <select onchange="transferDepartment(\'' + doc.id + '\', this.value)" class="bg-gray-900 border border-gray-700 text-white text-[10px]">\\
                                <option value="">-- Chọn --</option>\\
                                <option value="CÔNG AN">CÔNG AN</option>\\
                                <option value="QUÂN SỰ">QUÂN SỰ</option>\\
                                <option value="TÒA ÁN">TÒA ÁN</option>\\
                                <option value="KHO BẠC">KHO BẠC</option>\\
                            </select>\\
                        </div>\\
                        <div class="flex gap-1">\\
                            <input type="text" id="off-reply-' + doc.id + '" placeholder="Nhập câu trả lời..." class="w-full bg-gray-900 text-white text-[10px] border border-gray-700 rounded px-1">\\
                            <button onclick="submitOfficerReply(\'' + doc.id + '\')" class="bg-cyan-500 text-black px-2 text-[10px] rounded">Gửi</button>\\
                        </div>\\
                    </div>';
            });
        }

        async function updateDocStatus(id, status) {
            await fetch('/api/document/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, username: currentUserSession.username })
            });
            await refreshDataFromServer();
        }

        async function transferDepartment(id, targetDept) {
            if(!targetDept) return;
            await fetch('/api/document/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, targetDept, username: currentUserSession.username })
            });
            await refreshDataFromServer();
        }

        async function escalateToLeader(id) {
            await fetch('/api/document/escalate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, nextStage: 'Cấp chỉ huy Lãnh đạo thẩm định tối cao', username: currentUserSession.username })
            });
            await refreshDataFromServer();
        }

        async function submitOfficerReply(id) {
            const text = document.getElementById('off-reply-' + id).value.trim();
            if(!text) return;
            await fetch('/api/document/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, author: currentUserSession.realname, role: currentUserSession.level, text, username: currentUserSession.username })
            });
            document.getElementById('off-reply-' + id).value = '';
            await refreshDataFromServer();
        }

        function renderNewsAndWarrants() {
            const newsCon = document.getElementById('news-container');
            const warCon = document.getElementById('warrant-container');
            if(newsCon && globalDB.news) {
                newsCon.innerHTML = '';
                globalDB.news.forEach(n => {
                    newsCon.innerHTML += '<div class="bg-gray-900 border border-gray-800 rounded-xl p-4"><span class="bg-amber-500/10 text-amber-500 border border-amber-500/30 font-bold px-2 py-0.5 rounded text-[10px] uppercase">' + n.type + '</span><h3 class="text-sm font-bold text-white mt-1">' + n.title + '</h3><p class="text-gray-400 text-xs mt-1">' + n.content + '</p></div>';
                });
            }
            if(warCon && globalDB.warrants) {
                warCon.innerHTML = '';
                globalDB.warrants.forEach(w => {
                    warCon.innerHTML += '<div class="bg-red-950/20 border border-red-900/40 rounded-xl p-3 text-xs"><p class="text-red-500 font-bold uppercase"><i class="fa-solid fa-triangle-exclamation"></i> LỆNH TRUY NÃ: @' + w.name + '</p><p class="text-gray-400 mt-1">💡 Tội danh: ' + w.crime + ' | Thưởng: ' + w.bounty + '</p></div>';
                });
            }
        }

        function executeIdSearch() {
            const query = document.getElementById('search-id-input').value.trim();
            const resBox = document.getElementById('id-search-result');
            if(!query || !resBox || !globalDB.citizens) return;
            const c = globalDB.citizens[query];
            if(c) {
                resBox.innerHTML = '\\
                    <div class="bg-gray-950 border-2 border-emerald-500 rounded-xl p-4 text-xs space-y-2">\\
                        <div class="border-b border-gray-800 pb-1 flex justify-between font-bold text-emerald-400"><span>HỒ SƠ CÔNG DÂN CHÍNH THỨC</span><span>' + c.status + '</span></div>\\
                        <p>Họ tên: <span class="text-white font-bold font-mono">@' + c.name + '</span> | CCCD: <span class="text-amber-500 font-bold">' + c.idCard + '</span></p>\\
                        <p>Nghề nghiệp: ' + c.job + ' | GPLX: ' + c.license + ' | Súng: ' + c.weaponPermit + '</p>\\
                        <p class="text-red-400">Tiền án: ' + c.record + '</p>\\
                    </div>';
            } else { resBox.innerHTML = '<p class="text-xs text-red-400 text-center">Không tìm thấy dữ liệu.</p>'; }
        }

        async function executeCreateAccount() {
            const username = document.getElementById('account-username').value.trim();
            const password = document.getElementById('account-password').value.trim();
            const realname = document.getElementById('account-realname').value.trim();
            const dept = document.getElementById('account-dept').value;
            const level = document.getElementById('account-level').value;
            if(!username || !password || !realname) return alert('Điền đủ thông tin!');
            await fetch('/api/account/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, accountData: { username, password, realname, dept, level, statReceived: 0, statProcessed: 0, actionHistory: ['Tài khoản kích hoạt trên hệ thống.'] } })
            });
            alert('Cấp phát tài khoản cán bộ thành công!');
            await refreshDataFromServer();
        }

        async function executeSyncId() {
            const name = document.getElementById('id-name').value.trim();
            const idCard = document.getElementById('id-number').value.trim();
            const job = document.getElementById('id-job').value.trim();
            const license = document.getElementById('id-license').value.trim();
            const weaponPermit = document.getElementById('id-weapon-permit').value.trim();
            const status = document.getElementById('id-status').value;
            const record = document.getElementById('id-record').value.trim();
            const military = document.getElementById('id-military').value.trim();
            const money = document.getElementById('id-cash').value.trim();
            if(!name || !idCard) return alert('Nhập đủ thông tin!');
            await fetch('/api/sync-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username: currentUserSession.username, citizenData: { name, idCard, job, license, weaponPermit, status, record, military, money } })
            });
            alert('Đồng bộ cơ sở dữ liệu công dân thành công!');
            await refreshDataFromServer();
        }

        async function executePublish() {
            const type = document.querySelector('input[name="publish-type"]:checked').value;
            const now = new Date();
            const timeStr = String(now.getHours()).padStart(2, '0') + ":15 15/6/2026";
            let payload = {};
            if(type === 'news') {
                payload = { id: 'N'+Date.now(), type: document.getElementById('news-type').value, title: document.getElementById('news-title').value.trim(), content: document.getElementById('news-content').value.trim(), time: timeStr };
            } else {
                payload = { id: 'W'+Date.now(), name: document.getElementById('warrant-name').value.trim(), crime: document.getElementById('warrant-crime').value.trim(), bounty: document.getElementById('warrant-bounty').value.trim(), time: '15/06/2026' };
            }
            await fetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, username: currentUserSession.username, data: payload })
            });
            alert('Ký ban hành thành công!');
            await refreshDataFromServer();
            switchTab('tab-news');
        }

        function renderChartKPI() {
            if(!globalDB.accounts) return;
            const labels = [];
            const dataReceived = [];
            const dataProcessed = [];
            Object.keys(globalDB.accounts).forEach(k => {
                const a = globalDB.accounts[k];
                labels.push(a.realname);
                dataReceived.push(a.statReceived || 0);
                dataProcessed.push(a.statProcessed || 0);
            });
            const ctx = document.getElementById('kpiChart').getContext('2d');
            if(myChartInstance) { myChartInstance.destroy(); }
            myChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'Đã tiếp nhận', data: dataReceived, backgroundColor: '#3b82f6', border: 0 },
                        { label: 'Đã xử lý quyết toán', data: dataProcessed, backgroundColor: '#10b981', border: 0 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#1f2937' }, ticks: { color: '#9ca3af' } },
                        x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
                    },
                    plugins: { legend: { labels: { color: '#e5e7eb', font: { size: 10 } } } }
                }
            });
        }

        function updateOfficerSelectMenu() {
            const select = document.getElementById('select-officer-history');
            if(!select || !globalDB.accounts) return;
            const currentSelection = select.value;
            select.innerHTML = '<option value=\"\">-- Chọn cán bộ cần kiểm xét --</option>';
            Object.keys(globalDB.accounts).forEach(k => {
                const a = globalDB.accounts[k];
                select.innerHTML += '<option value=\"' + a.username + '\">' + a.realname + ' (@' + a.username + ')</option>';
            });
            select.value = currentSelection;
        }

        function viewOfficerHistory(username) {
            const logBox = document.getElementById('officer-history-logs');
            if(!username || !globalDB.accounts[username]) {
                logBox.innerHTML = 'Vui lòng chọn cán bộ để xem lại quá trình làm việc.';
                return;
            }
            const history = globalDB.accounts[username].actionHistory || [];
            if(history.length === 0) {
                logBox.innerHTML = 'Cán bộ chưa thực hiện hoạt động hành chính nào.';
                return;
            }
            logBox.innerHTML = history.map(h => '<p class="border-b border-gray-900 py-0.5 text-purple-400"><i class="fa-solid fa-angle-right"></i> ' + h + '</p>').join('');
        }

        async function updateSecurityStatus(status) {
            await fetch('/api/security/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
            await refreshDataFromServer();
        }

        function renderSupervisorStats() {
            const tbody = document.getElementById('supervisor-stats-table-body');
            if(!tbody || !globalDB.accounts) return;
            tbody.innerHTML = '';
            Object.keys(globalDB.accounts).forEach(k => {
                const a = globalDB.accounts[k];
                tbody.innerHTML += '<tr class="border-b border-gray-800 text-xs"><td class="py-2 px-3 text-purple-400">@' + a.username + '</td><td class="py-2 px-3 text-white">' + a.realname + '</td><td class="py-2 px-3 font-bold text-amber-500">' + a.dept + '</td><td class="py-2 px-3">' + a.level + '</td><td class="py-2 px-3 text-center text-cyan-400">' + (a.statReceived || 0) + '</td><td class="py-2 px-3 text-center text-emerald-400">' + (a.statProcessed || 0) + '</td></tr>';
            });
        }

        function renderLogs() {
            const con = document.getElementById('system-logs-container');
            if(!con || !globalDB.logs) return;
            con.innerHTML = '';
            globalDB.logs.forEach(l => { con.innerHTML += '<p class="text-emerald-500 py-0.5 border-b border-gray-900"><i class="fa-solid fa-angle-right text-purple-400"></i> ' + l + '</p>'; });
        }

        function switchTab(id) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.replace('block', 'hidden'));
            const target = document.getElementById(id); if(target) target.classList.replace('hidden', 'block');
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('border-amber-500', 'text-amber-500'));
            const btn = document.getElementById('btn-' + id); if(btn) btn.classList.add('border-amber-500', 'text-amber-500');
        }

        function openLoginModal() { document.getElementById('login-modal').classList.remove('hidden'); }
        function closeLoginModal() { document.getElementById('login-modal').classList.add('hidden'); }

        window.addEventListener('load', () => {
            updateAuthUI();
            refreshDataFromServer();
            setInterval(refreshDataFromServer, 4000);
        });
    </script>
</body>
</html>
`;

app.get('/', (req, res) => {
    res.send(htmlContent);
});

app.listen(PORT, () => console.log(`Máy chủ chính phủ đang vận hành tại Port: ${PORT}`));
