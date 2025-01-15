const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Middleware to parse JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up view engine to use EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, JS) from public folder
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/todo-list', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// Define Task Schema with date and time
const taskSchema = new mongoose.Schema({
    name: String,
    priority: Number,
    dueDate: Date, // Store both date and time
});

const Task = mongoose.model('Task', taskSchema);

// Route to serve the login page (login.ejs)
app.get('/login', (req, res) => {
    res.render('login'); // Render the login page
});

// Redirect to login page if accessing root
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Route to render the To-Do list page (index.ejs) with tasks
app.get('/todo', async (req, res) => {
    try {
        const tasks = await Task.find(); // Get tasks from MongoDB
        res.render('index', { tasks }); // Render the To-Do list page
    } catch (err) {
        res.status(500).send('Error fetching tasks');
    }
});

// POST route to add new task with date and time
app.post('/add-task', async (req, res) => {
    const { name, priority, dueDate, dueTime } = req.body;

    // Combine date and time into a single Date object
    const date = new Date(dueDate);
    const [hours, minutes] = dueTime.split(':');
    date.setHours(hours, minutes);

    const task = new Task({
        name,
        priority,
        dueDate: date,
    });

    try {
        await task.save();
        res.redirect('/todo'); // Redirect to To-Do list after adding task
    } catch (err) {
        res.status(500).send('Error adding task');
    }
});

// DELETE route to delete a task by ID
app.delete('/delete-task/:id', async (req, res) => {
    const taskId = req.params.id;
    try {
        const deletedTask = await Task.findByIdAndDelete(taskId);
        if (deletedTask) {
            res.status(200).json({ message: 'Task deleted successfully' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (err) {
        res.status(500).send('Error deleting task');
    }
});

//Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
