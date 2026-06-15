const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ================= HỆ THỐNG CƠ SỞ DỮ LIỆU TẬP TRUNG TRÊN SERVER =================
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

// ================= CÁC API ENDPOINTS =================
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

// GỌI FILE TĨNH FRONTEND KHÔNG LO SẬP CHUỖI KÝ TỰ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Máy chủ chính phủ đang vận hành tại Port: ${PORT}`));
