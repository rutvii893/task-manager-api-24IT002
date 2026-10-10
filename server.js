const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
require('./listeners');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

const requireJsonContent = (req, res, next) => {
    if ((req.method === 'POST' || req.method === 'PUT') && req.headers['content-type'] !== 'application/json') {
        return res.status(400).json({ error: 'Content-Type must be application/json' });
    }
    next();
};

app.use(requireJsonContent);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Root Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Task Manager API. Use /tasks for the endpoints.' });
});

// Use Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong', message: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
