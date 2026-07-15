const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Danh sách hồ sơ mẫu chuẩn ban đầu nếu chưa có file database.json
const defaultMockRecords = [
    {
        id: "rec_1",
        code: "HS-DT-2026-003",
        citizen: "Nguyễn Duy Hùng",
        phone: "0987112233",
        field: "Đất Đai",
        tthcName: "1.013978.H41- Đăng ký đất đai, tài sản gắn liền với đất, cấp GCN lần đầu đối với hộ gia đình, cá nhân, cộng đồng dân cư...",
        dept: "Phòng Kinh tế",
        dateRec: "2026-06-25",
        duration: 15,
        deadline: "2026-07-10",
        status: "Đang xử lý",
        officer: "Nguyễn Văn Toàn - Công chức Địa chính - Nông nghiệp",
        notes: "Hồ sơ liên thông đã chuyển Phòng Kinh tế huyện thẩm định. Đang chờ ý kiến phản hồi hiện trạng đất thực tế.",
        journal: [
            { date: "2026-06-25 09:00", text: "Công chức Một cửa Nguyễn Văn Toàn tiếp nhận hồ sơ, kiểm tra thành phần pháp lý." },
            { date: "2026-06-26 14:30", text: "Đã chuyển tiếp liên thông trực tuyến lên Phòng Kinh tế Huyện Thanh Chương." }
        ]
    },
    {
        id: "rec_2",
        code: "HS-DT-2026-015",
        citizen: "Phan Thị Lan",
        phone: "0915223344",
        field: "Đất Đai",
        tthcName: "1.012790.000.00.00.H41-Đính chính Giấy chứng nhận đã cấp",
        dept: "Văn phòng Đất đai Thanh Chương",
        dateRec: "2026-07-08",
        duration: 10,
        deadline: "2026-07-18",
        status: "Đang xử lý",
        officer: "Lê Văn Tuấn - Công chức Địa chính (Phụ trách VP ĐKĐĐ)",
        notes: "Đang chuyển Chi nhánh Văn phòng Đăng ký Đất đai Thanh Chương thẩm duyệt sai sót phôi gốc.",
        journal: [
            { date: "2026-07-08 10:15", text: "Một cửa tiếp nhận hồ sơ gốc và tờ khai đề nghị đính chính của bà Lan." },
            { date: "2026-07-10 15:00", text: "Chuyển phát bưu điện chuyển hồ sơ gốc lên Văn phòng Đăng ký Đất đai Huyện." }
        ]
    },
    {
        id: "rec_3",
        code: "HS-HT-2026-092",
        citizen: "Lê Văn Tùng",
        phone: "0904334455",
        field: "Hộ tịch",
        tthcName: "1.001193.000.00.00.H41- Thủ tục đăng ký khai sinh",
        dept: "Văn phòng HĐND - UBND",
        dateRec: "2026-07-15",
        duration: 1,
        deadline: "2026-07-16",
        status: "Đang xử lý",
        officer: "Phan Hồng Sơn - Công chức Tư pháp - Hộ tịch",
        notes: "Đang rà soát sổ bộ hộ tịch xã để làm thủ tục cấp giấy khai sinh gốc.",
        journal: [
            { date: "2026-07-15 08:30", text: "Tiếp nhận trực tiếp của công dân tại Trung tâm Một cửa xã Cát Ngạn." }
        ]
    },
    {
        id: "rec_4",
        code: "HS-BT-2026-041",
        citizen: "Trần Văn Bình",
        phone: "0345123456",
        field: "Bảo trợ xã hội",
        tthcName: "1.001776.000.00.00.H41- Thực hiện, thôi hưởng trợ cấp xã hội hàng tháng, kinh phí chăm sóc...",
        dept: "Phòng Văn hóa - Xã hội",
        dateRec: "2026-07-02",
        duration: 7,
        deadline: "2026-07-09",
        status: "Đã hoàn thành",
        officer: "Lê Thị Mai - Công chức Văn hóa - Xã hội",
        notes: "Huyện đã ký phê duyệt đồng bộ về hệ thống Một cửa xã Cát Ngạn.",
        journal: [
            { date: "2026-07-02 11:30", text: "Một cửa tiếp nhận đơn trợ cấp bảo trợ xã hội." },
            { date: "2026-07-08 16:00", text: "Phòng VH-XH huyện duyệt đồng ý và gửi trả kết quả số hóa về xã." }
        ]
    }
];

// Hàm đọc dữ liệu an toàn từ tệp JSON
function readDatabase() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            // Khởi tạo file database mẫu nếu chưa tồn tại
            fs.writeFileSync(DB_FILE, JSON.stringify(defaultMockRecords, null, 2), 'utf-8');
            return defaultMockRecords;
        }
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Lỗi khi đọc file cơ sở dữ liệu JSON:", error);
        return [];
    }
}

// Hàm ghi dữ liệu an toàn vào tệp JSON
function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error("Lỗi khi ghi dữ liệu vào tệp JSON:", error);
        return false;
    }
}

// Cấu hình Express Middleware
app.use(cors()); // Cho phép các máy trạm khác kết nối qua mạng LAN
app.use(express.json({ limit: '50mb' })); // Hỗ trợ gửi dữ liệu JSON lớn (khi import Excel nhiều dòng)
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API lấy toàn bộ danh sách hồ sơ
app.get('/api/records', (req, res) => {
    const records = readDatabase();
    res.json({
        success: true,
        count: records.length,
        data: records
    });
});

// API Tiếp nhận hồ sơ hành chính mới
app.post('/api/records', (req, res) => {
    const records = readDatabase();
    const newRecord = {
        id: "rec_" + Date.now(),
        code: req.body.code,
        citizen: req.body.citizen,
        phone: req.body.phone || "",
        field: req.body.field,
        tthcName: req.body.tthcName,
        dept: req.body.dept,
        dateRec: req.body.dateRec,
        duration: parseInt(req.body.duration) || 1,
        deadline: req.body.deadline,
        status: req.body.status || "Đang xử lý",
        officer: req.body.officer,
        notes: req.body.notes || "Đã tiếp nhận thành công.",
        journal: req.body.journal || [
            {
                date: new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5),
                text: `Công chức Một cửa [${req.body.officer}] đã tiếp nhận hồ sơ gốc và đồng bộ lên hệ thống giám sát.`
            }
        ]
    };

    // Kiểm tra trùng mã hồ sơ
    const isDuplicate = records.some(r => r.code === newRecord.code);
    if (isDuplicate) {
        return res.status(400).json({
            success: false,
            message: `Mã hồ sơ ${newRecord.code} đã tồn tại trong cơ sở dữ liệu!`
        });
    }

    records.push(newRecord);
    if (writeDatabase(records)) {
        res.status(201).json({
            success: true,
            message: "Tiếp nhận hồ sơ mới thành công!",
            data: newRecord
        });
    } else {
        res.status(500).json({ success: false, message: "Lỗi lưu dữ liệu máy chủ!" });
    }
});

// API Cập nhật/Chỉnh sửa thông tin hồ sơ
app.put('/api/records/:id', (req, res) => {
    const records = readDatabase();
    const id = req.params.id;
    const index = records.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ yêu cầu!" });
    }

    // Tiến hành cập nhật các trường thay đổi
    records[index] = {
        ...records[index],
        code: req.body.code || records[index].code,
        citizen: req.body.citizen || records[index].citizen,
        phone: req.body.phone !== undefined ? req.body.phone : records[index].phone,
        field: req.body.field || records[index].field,
        tthcName: req.body.tthcName || records[index].tthcName,
        dept: req.body.dept || records[index].dept,
        dateRec: req.body.dateRec || records[index].dateRec,
        duration: req.body.duration !== undefined ? parseInt(req.body.duration) : records[index].duration,
        deadline: req.body.deadline || records[index].deadline,
        status: req.body.status || records[index].status,
        officer: req.body.officer || records[index].officer,
        notes: req.body.notes !== undefined ? req.body.notes : records[index].notes,
        journal: req.body.journal || records[index].journal
    };

    if (writeDatabase(records)) {
        res.json({
            success: true,
            message: "Cập nhật hồ sơ thành công!",
            data: records[index]
        });
    } else {
        res.status(500).json({ success: false, message: "Lỗi lưu cập nhật lên máy chủ!" });
    }
});

// API Xóa hồ sơ hành chính
app.delete('/api/records/:id', (req, res) => {
    let records = readDatabase();
    const id = req.params.id;
    const isExist = records.some(r => r.id === id);

    if (!isExist) {
        return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ để xóa!" });
    }

    records = records.filter(r => r.id !== id);
    if (writeDatabase(records)) {
        res.json({ success: true, message: "Đã xóa hồ sơ khỏi bảng giám sát!" });
    } else {
        res.status(500).json({ success: false, message: "Lỗi khi thực hiện xóa trên máy chủ!" });
    }
});

// API nạp dữ liệu hàng loạt (Import Excel/Bulk Import)
app.post('/api/records/bulk', (req, res) => {
    const importedRecords = req.body.records;
    const mode = req.body.mode; // 'append' hoặc 'replace'

    if (!Array.isArray(importedRecords)) {
        return res.status(400).json({ success: false, message: "Định dạng dữ liệu nạp hàng loạt không hợp lệ!" });
    }

    let records = readDatabase();

    if (mode === "replace") {
        // Ghi đè toàn bộ dữ liệu cũ
        records = importedRecords;
    } else {
        // Chế độ cộng dồn: Loại bỏ trùng mã hồ sơ cũ bằng cách lấy dữ liệu mới trong file Excel đè lên
        const newCodes = importedRecords.map(r => r.code);
        records = records.filter(r => !newCodes.includes(r.code));
        records = records.concat(importedRecords);
    }

    if (writeDatabase(records)) {
        res.json({
            success: true,
            message: `Nạp thành công ${importedRecords.length} hồ sơ từ Excel vào hệ thống!`,
            count: records.length
        });
    } else {
        res.status(500).json({ success: false, message: "Lỗi ghi nạp hàng loạt trên máy chủ!" });
    }
});

// API Đóng vai trò Reset về dữ liệu gốc để kiểm thử hệ thống
app.post('/api/database/reset', (req, res) => {
    if (writeDatabase(defaultMockRecords)) {
        res.json({
            success: true,
            message: "Đã khôi phục cơ sở dữ liệu mẫu thành công!",
            data: defaultMockRecords
        });
    } else {
        res.status(500).json({ success: false, message: "Lỗi khi reset cơ sở dữ liệu!" });
    }
});

// Cấu hình phục vụ file Frontend tĩnh (Giao diện web của chúng ta)
// Nếu bạn Build dự án React/Vite, thư mục tĩnh sẽ là 'dist'.
// Đối với tệp đơn 'index.html', chúng ta có thể đặt nó trong thư mục 'public'.
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
    });
} else {
    // Nếu chưa tạo thư mục public, trả về thông báo chào mừng
    app.get('/', (req, res) => {
        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                <h2 style="color: #065f46;">MÁY CHỦ GIÁM SÁT TTHC UBND XÃ ĐANG HOẠT ĐỘNG!</h2>
                <p>Hãy tạo thư mục <strong>"public"</strong> trong dự án và di chuyển tệp giao diện <strong>index.html</strong> vào đó để khởi chạy toàn diện.</p>
                <p style="color: #64748b;">Hệ thống chạy trên Cổng LAN: <strong>${PORT}</strong></p>
            </div>
        `);
    });
}

// Khởi động HTTP Server
app.listen(PORT, '0.0.0.0', () => {
    console.log("\n========================================================");
    console.log("   HỆ THỐNG GIÁM SÁT HỒ SƠ TTHC UBND XÃ CÁT NGẠN");
    console.log("========================================================");
    console.log(`[*] Máy chủ đang hoạt động tại cổng: ${PORT}`);
    console.log(`[*] Kết nối nội bộ: http://localhost:${PORT}`);
    console.log(`[*] Hướng dẫn chia sẻ LAN cho các máy Một cửa khác:`);
    console.log(`    Tìm địa chỉ IP máy chủ này (chạy lệnh 'ipconfig' trên Cmd),`);
    console.log(`    ví dụ truy cập từ máy khách: http://192.168.1.XX:${PORT}`);
    console.log("========================================================\n");
});