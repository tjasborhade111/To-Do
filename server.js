const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const Task = require('./models/Task');  // Import the Task model

const app = express();
const PORT = 5000;

// Middleware to parse JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up view engine to use EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, JS) from public folder
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/todoDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB", err));

// Session setup
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true
}));

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
        const tasks = await Task.find({ sessionId: req.sessionID }); // Get tasks for current session ID
        res.render('index', { tasks }); // Render the To-Do list page with tasks
    } catch (err) {
        res.status(500).send('Error fetching tasks');
    }
});

// POST route to add new task with date and time
app.post('/add-task', async (req, res) => {
    const { name, priority, dueDate, hour, minute, ampm } = req.body;

    // Convert hour to 24-hour format
    let formattedHour = parseInt(hour);
    if (ampm === 'PM' && formattedHour !== 12) {
        formattedHour += 12;
    }
    if (ampm === 'AM' && formattedHour === 12) {
        formattedHour = 0;
    }

    // Create a new Date object with the correct time
    const date = new Date(dueDate);
    date.setHours(formattedHour, parseInt(minute), 0, 0); // Set hours, minutes, seconds, milliseconds

    const task = new Task({
        name,
        priority,
        dueDate: date,
        sessionId: req.sessionID // Save the session ID with the task
    });

    try {
        await task.save();
        res.redirect('/todo'); // Redirect back to the todo list
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
