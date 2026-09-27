const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const validateTask = require('../middleware/validateTask');
const cache = require('../config/cache');

// Protect all task routes
router.use(auth);

// GET all tasks (Cached)
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find(); // Direct MongoDB query
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Cache Debug endpoint (Must be placed before /:id)
router.get('/debug/cache', (req, res) => {
    res.status(200).json(cache.getStats());
});

// GET task by ID (Cached)
router.get('/:id', async (req, res, next) => {
    try {
        const cacheKey = `task_${req.params.id}`;
        const cachedTask = cache.get(cacheKey);
        if (cachedTask) {
            cache.recordHit();
            console.log(`CACHE HIT: ${cacheKey}`);
            return res.status(200).json(cachedTask);
        }

        cache.recordMiss();
        console.log(`CACHE MISS: ${cacheKey}`);
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }
        cache.set(cacheKey, task);
        res.status(200).json(task);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        next(err);
    }
});

// POST new task
router.post('/', validateTask, async (req, res, next) => {
    try {
        const task = await Task.create(req.body);
        cache.del('all_tasks');
        res.status(201).json(task);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation Failed",
                error: err.message
            });
        }
        next(err);
    }
});

// PUT update task
router.put('/:id', async (req, res, next) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }
        cache.del('all_tasks');
        cache.del(`task_${req.params.id}`);
        res.status(200).json(task);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation Failed",
                error: err.message
            });
        }
        if (err.name === 'CastError') {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        next(err);
    }
});

// DELETE task
router.delete('/:id', async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }
        cache.del('all_tasks');
        cache.del(`task_${req.params.id}`);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        next(err);
    }
});

module.exports = router;
