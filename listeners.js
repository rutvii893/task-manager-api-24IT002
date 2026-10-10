const taskEvents = require('./events');

// Global error listener for unhandled event errors
taskEvents.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] [EVENT ERROR] Caught event error:`, err.message || err);
});

// Listener for task-created event
taskEvents.on('task-created', (data) => {
    try {
        const { task, assignedUser } = data;
        const startTime = new Date().toISOString();
        console.log(`[${startTime}] [EVENT RECEIVED] task-created for Task "${task.title}" assigned to user "${assignedUser}"`);
        
        // Check for simulated failure trigger
        if (task.title && task.title.toLowerCase().includes('fail-test')) {
            throw new Error('Simulated notification processing error');
        }

        setTimeout(() => {
            try {
                const completionTime = new Date().toISOString();
                console.log(`[${completionTime}] [NOTIFICATION SENT] Email/Notification sent for Task "${task.title}" to assigned user "${assignedUser}"`);
            } catch (err) {
                taskEvents.emit('error', err);
            }
        }, 2000);
    } catch (err) {
        taskEvents.emit('error', err);
    }
});

// Listener for task-deleted event
taskEvents.on('task-deleted', (data) => {
    try {
        const { taskId, title, deletedBy } = data;
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [EVENT RECEIVED] task-deleted: Task "${title || taskId}" (ID: ${taskId}) deleted by user "${deletedBy}"`);
    } catch (err) {
        taskEvents.emit('error', err);
    }
});

console.log('Event listeners initialized successfully.');
