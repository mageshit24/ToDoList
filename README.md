
# 📝 ToDoList MERN Stack Application

A full-stack To-Do List application built using the MERN stack (MongoDB, Express.js, React.js, Node.js). This app allows users to manage their tasks efficiently with features to add, edit, delete, and view tasks.

## 🚀 Live Demo

Experience the live application here: [ToDoList Web App](https://todolist-web-mern-project.netlify.app/)

## 🧱 Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Deployment**:
  - Frontend: [Netlify](https://www.netlify.com/)
  - Backend: [Render](https://render.com/)

## ⚙️ Features

- **Add Task**: Create new tasks with titles and descriptions.
- **Edit Task**: Modify existing tasks.
- **Delete Task**: Remove tasks from the list.
- **View Tasks**: Display all tasks in a user-friendly interface.

## 🛠️ Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/mageshit24/ToDoList.git
cd ToDoList
```
### Backend Setup
Navigate to the backend directory:
```bash
cd backend
```
Install dependencies:
```bash
npm install
```
Start the backend server:
```bash
npm start
```
The backend will run on http://localhost:8000
### Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
```
Install dependencies:
```bash
npm install
```
Start the frontend development server:
```bash
npm start
```
The frontend will run on http://localhost:3000
### 🔐 Environment Variables
Ensure you have the following environment variables set up in a .env file in the backend directory:
```bash
MONGO_URI=your_mongodb_connection_string
PORT=8000
```
Replace your_mongodb_connection_string with your actual MongoDB URI.
