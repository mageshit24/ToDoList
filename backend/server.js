const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Create an instance of Express
const app = express();
app.use(express.json());
app.use(cors());

// Connecting to MongoDB
mongoose.connect('mongodb://localhost:27017/ToDoList')
    .then(() => {
        console.log('DB connected successfully.');
    })
    .catch((err) => {
        console.log(err);
    });

// Creating schema with deadline
const todoSchema = new mongoose.Schema({
    title: {
        required: true,
        type: String
    },
    description: String,
    deadline: {
        type: Date,
        required: true
    }
});

// Creating model
const todoModel = mongoose.model('Todo', todoSchema);

// Define a route to create ToDo (POST Route)
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

// Update Route
app.put("/todos/:id", async (req, res) => {
    try {
        const { title, description, deadline } = req.body;
        const id = req.params.id;
        const updatedTodo = await todoModel.findByIdAndUpdate(
            id,
            {
                title,
                description,
                deadline // Update deadline
            },
            {
                new: true
            }
        );
        if (!updatedTodo) {
            return res.status(404).json({ message: "Can't find ToDo item." });
        }
        res.json(updatedTodo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Get Route
app.get('/todos', async (req, res) => {
    try {
        const todos = await todoModel.find();
        res.json(todos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Delete Route
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

// Start the server
const port = 8000;
app.listen(port, () => {
    console.log("Server is listening on port " + port);
});