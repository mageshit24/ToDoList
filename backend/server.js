//Express
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

//Create an instance of Express
const app = express();
app.use(express.json());
app.use(cors());

//Sample in-memory storage for todo items
//let todos = [];

//Connecting MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/ToDoList')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

//Creating schema
const todoSchema = new mongoose.Schema({
    title: {
        required: true,
        type: String
    },
    description: String,
    deadline: { // Add this line
        type: Date,
        required: true // Make it required if you want to enforce deadline for every task
    }
});

//Creating model
const todoModel = mongoose.model('Todo', todoSchema);

//Define a Route to create ToDo Post Route
app.post('/todos', async (req, res) => {
    const { title, description, deadline } = req.body; // Extract deadline
    try {
        const newTodo = new todoModel({ title, description, deadline }); // Include deadline
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

//Update Route
app.put("/todos/:id", async (req,res) => {
    try {
        const {title,description} = req.body;
        const id = req.params.id;
        const updatedTodo = await todoModel.findByIdAndUpdate(
            id,
            {
                title, description
            },
            {
                new: true
            }
        )
        if (!updatedTodo){
            return res.status(404).json({message: "Can't find ToDo work."})
        }
        res.json(updatedTodo)
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
})

//Get Route
app.get('/todos', async (req, res) => {
    try {
        const todos = await todoModel.find();
        const currentTime = new Date();
        const todosWithOverdueStatus = todos.map(todo => ({
            ...todo._doc,
            isOverdue: new Date(todo.deadline) < currentTime && !todo.completed // Assuming you might have a 'completed' field in the future
        }));
        res.json(todosWithOverdueStatus);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

//Delete a route
app.delete('/todos/:id', async (req,res) => {
    try {
        const id = req.params.id;
        await todoModel.findByIdAndDelete(id);
        res.status(204).end();
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
})

//Start the server
const port = 8000;
app.listen(port, () => {
    console.log("Server is listening to port "+port);
})