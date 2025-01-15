// models/Task.js
const mongoose = require('mongoose');

// Define the Task schema
const taskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    priority: { type: Number, required: true },
    dueDate: { type: Date, required: true }
});

// Create and export the model
const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
