require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


// Todo Schema
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

// Create Todo
app.post('/todos', async (req, res) => {
  const { title, description, deadline } = req.body;
  try {
    const newTodo = new todoModel({ title, description, deadline });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("POST /todos error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update Todo
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
      return res.status(404).json({ message: "Todo not found." });
    }
    res.json(updatedTodo);
  } catch (error) {
    console.error("PUT /todos/:id error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get All Todos with Overdue Status
app.get('/todos', async (req, res) => {
  try {
    const todos = await todoModel.find().sort({ deadline: 1 });

    const currentTime = new Date();
    const todosWithOverdueStatus = todos.map(todo => {
      let deadlineDate = new Date(todo.deadline);
      let completed = todo.completed ?? false; // fallback in case it's undefined

      return {
        ...todo._doc,
        isOverdue: deadlineDate < currentTime && !completed
      };
    });

    res.json(todosWithOverdueStatus);
  } catch (error) {
    console.error("GET /todos error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete Todo
app.delete('/todos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await todoModel.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: "Todo not found for deletion." });
    }
    res.status(204).end();
  } catch (error) {
    console.error("DELETE /todos/:id error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Server Listener
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("Server running on port " + port);
});
