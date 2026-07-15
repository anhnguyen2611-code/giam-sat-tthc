const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Sử dụng CONNECTION_STRING từ môi trường (Supabase/Render)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use(express.json());
app.use(express.static(__dirname));

async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS dossiers (
                id TEXT PRIMARY KEY,
                citizen TEXT NOT NULL,
                procedure TEXT NOT NULL,
                dept TEXT NOT NULL,
                field TEXT NOT NULL,
                created_at TEXT NOT NULL,
                deadline_date TEXT NOT NULL,
                officer TEXT NOT NULL,
                deadline_hours INTEGER NOT NULL,
                status TEXT NOT NULL,
                step INTEGER NOT NULL
            )
        `);
        console.log('[OK] Bảng hồ sơ đã sẵn sàng trên Cloud!');
    } catch (err) {
        console.error('[LỖI] Khởi tạo DB:', err);
    }
}
initializeDatabase();

app.get('/api/dossiers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM dossiers ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/dossiers', async (req, res) => {
    const { id, citizen, procedure, dept, field, created_at, deadline_date, officer, deadline_hours } = req.body;
    try {
        await pool.query(
            'INSERT INTO dossiers (id, citizen, procedure, dept, field, created_at, deadline_date, officer, deadline_hours, status, step) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
            [id, citizen, procedure, dept, field, created_at, deadline_date, officer, deadline_hours, "Đang xử lý (Chuyên môn)", 2]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'tracking_system.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});