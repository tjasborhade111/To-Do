const mongoose = require('mongoose');

// Task Schema
const taskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    priority: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    sessionId: { type: String, required: true } // Store session ID to identify the user
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
