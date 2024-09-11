const express = require('express');
const pg = require('pg');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// เชื่อมต่อกับ PostgreSQL
const client = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'mydb',
    password: '1234', // เปลี่ยนข้อมูลนี้ให้เป็นรหัสผ่านจริงของคุณ
    port: 5432
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));

// ฟังก์ชันลงทะเบียน
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // ตรวจสอบว่าชื่อผู้ใช้มีอยู่แล้วหรือไม่
        const userCheck = await client.query('SELECT * FROM users WHERE username = $1', [username]);

        if (userCheck.rows.length > 0) {
            return res.status(409).send('Username already exists');
        }

        // เพิ่มผู้ใช้ใหม่ในฐานข้อมูล
        await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
});

// ฟังก์ชันล็อคอิน
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // ตรวจสอบชื่อผู้ใช้และรหัสผ่าน
        const userCheck = await client.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);

        if (userCheck.rows.length > 0) {
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
});

// เริ่มเซิร์ฟเวอร์
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
