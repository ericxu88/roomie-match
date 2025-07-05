const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// test route
app.get('/', (req, res) => {
    res.json({
        message: 'RoomieMatch API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

//health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'RoomieMatch API',
        uptime: process.uptime()
    });
});

// error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong'
    });
});

//start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`API URL: http://localhost:${PORT}`);
});

module.exports = app;