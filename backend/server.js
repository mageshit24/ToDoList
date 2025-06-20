require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Schema
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  deadline: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const todoModel = mongoose.model('Todo', todoSchema);

// POST - Create a new todo
app.post('/todos', async (req, res) => {
  const { title, description, deadline } = req.body;
  try {
    const newTodo = new todoModel({ title, description, deadline });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// PUT - Update an existing todo
app.put("/todos/:id", async (req, res) => {
  const { title, description, deadline, completed } = req.body;
  const id = req.params.id;
  try {
    const updatedTodo = await todoModel.findByIdAndUpdate(
      id,
      { title, description, deadline, completed },
      { new: true }
    );
    if (!updatedTodo) {
      return res.status(404).json({ message: "Can't find ToDo work." });
    }
    res.json(updatedTodo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// GET - Fetch all todos
app.get('/todos', async (req, res) => {
  try {
    const todos = await todoModel.find().sort({ deadline: 1 });

    if (!Array.isArray(todos)) {
      return res.status(500).json({ message: "Todos is not an array." });
    }

    const currentTime = new Date();
    const todosWithOverdueStatus = todos.map(todo => ({
      ...todo._doc,
      isOverdue: new Date(todo.deadline) < currentTime && !todo.completed
    }));

    res.json(todosWithOverdueStatus);
  } catch (error) {
    console.log("GET /todos error:", error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE - Delete a todo
app.delete('/todos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await todoModel.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Start server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("Server is listening to port " + port);
});
