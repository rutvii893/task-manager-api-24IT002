const express = require('express');
const router = express.Router();
const { generateTaskDescription } = require('../services/aiService');

// In-memory rate limiting map: ipOrKey -> timestamp of last request
// Requirement: Limit AI generation to one request per task/client per minute
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

router.post('/generate-description', async (req, res) => {
    try {
        const { title } = req.body;

        // 1. Input Validation
        if (!title || typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({
                error: 'Task title is required to generate a description.'
            });
        }

        const trimmedTitle = title.trim();

        // 2. Rate Limiting Check (by IP + sanitized title prefix to limit 1 req / task / min)
        const clientIdentifier = `${req.ip || 'client'}_${trimmedTitle.toLowerCase()}`;
        const lastRequestTime = rateLimitMap.get(clientIdentifier);
        const now = Date.now();

        if (lastRequestTime && (now - lastRequestTime) < RATE_LIMIT_WINDOW_MS) {
            const retryAfterSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - lastRequestTime)) / 1000);
            return res.status(429).json({
                error: `Rate limit reached. Please wait ${retryAfterSeconds} seconds before requesting AI generation for this task again.`
            });
        }

        // Set current timestamp for rate limiter
        rateLimitMap.set(clientIdentifier, now);

        // 3. Call AI Service (Isolated with safe error handling)
        try {
            const description = await generateTaskDescription(trimmedTitle);
            return res.status(200).json({
                description
            });
        } catch (aiError) {
            // Log server-side only for debugging (never log API keys)
            console.error('[AI Service Error]:', aiError.message);

            // Return safe fallback error response without leaking internal keys or stack traces
            return res.status(503).json({
                error: 'AI service currently unavailable. Please enter task description manually.',
                fallback: true
            });
        }
    } catch (err) {
        console.error('Unexpected error in /api/ai/generate-description:', err.message);
        return res.status(500).json({
            error: 'Failed to process AI generation request. Please enter description manually.',
            fallback: true
        });
    }
});

module.exports = router;

