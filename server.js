const express = require('express');
const app = express();
const PORT = 5000;

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

let tasks = [];
let nextId = 1;

const validateTaskId = (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid Task ID format.' });
    }
    next();
};

app.post('/tasks', (req, res, next) => {
    try {
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Task title is required' });
        }
        const newTask = {
            id: nextId++,
            title,
            description: description || '',
            completed: false
        };
        tasks.push(newTask);
        res.status(201).json(newTask);
    } catch (err) {
        next(err);
    }
});

app.get('/tasks', (req, res, next) => {
    try {
        res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
});

app.put('/tasks/:id', validateTaskId, (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { title, description, completed } = req.body;
        const taskIndex = tasks.findIndex(t => t.id === id);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (title !== undefined) tasks[taskIndex].title = title;
        if (description !== undefined) tasks[taskIndex].description = description;
        if (completed !== undefined) tasks[taskIndex].completed = completed;

        res.status(200).json(tasks[taskIndex]);
    } catch (err) {
        next(err);
    }
});

app.delete('/tasks/:id', validateTaskId, (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const taskIndex = tasks.findIndex(t => t.id === id);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }

        tasks.splice(taskIndex, 1);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        next(err);
    }
});

app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
