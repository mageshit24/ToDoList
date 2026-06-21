# 📝 ToDoList — MERN Stack Application

A full-stack To-Do List app built with the **MERN stack** (MongoDB, Express, React, Node.js). Add tasks with a title, description, and deadline, edit or delete them anytime, and automatically see which tasks are **overdue** — all backed by a live REST API and a cloud-hosted MongoDB database.

## 🚀 Live Demo

🔗 **[ToDoList Web App](https://todolist-web-mern-project.netlify.app/)** — hosted on Netlify (frontend) + Render (backend)

---

## ✨ Features

- ➕ **Add Task** — create tasks with a title, description, and deadline (date + time)
- ✏️ **Edit Task** — update any task's details inline
- ❌ **Delete Task** — remove tasks with a confirmation prompt
- 📋 **View Tasks** — all tasks listed and auto-sorted by nearest deadline
- ⏰ **Overdue Detection** — the backend flags any incomplete task past its deadline
- ✅ **Completion Status** — tasks track a `completed` state
- 💬 **Inline Feedback** — success/error messages for every action

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Create React App), Bootstrap classes |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Deployment | Netlify (frontend) · Render (backend) |

---

## 🏗️ Project Structure

```
ToDoList/
├── backend/
│   ├── server.js          # Express app, MongoDB connection, REST endpoints
│   ├── Procfile            # Render deployment start command
│   └── package.json
└── frontend/
    ├── src/
    │   ├── ToDo.js          # Main To-Do UI — add, edit, delete, list tasks
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## 🔗 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/todos` | Create a new task |
| `GET` | `/todos` | Get all tasks, sorted by deadline, with `isOverdue` computed |
| `PUT` | `/todos/:id` | Update a task by ID |
| `DELETE` | `/todos/:id` | Delete a task by ID |

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/mageshit24/ToDoList.git
cd ToDoList
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=8000
```

Start the backend server:
```bash
node server.js
```
> The `start` script isn't defined in `package.json` yet — `node server.js` matches what the `Procfile` runs on Render. You can add `"start": "node server.js"` to the `scripts` block to enable `npm start` too.

The backend will run on **http://localhost:8000**.

### 3. Frontend setup
```bash
cd frontend
npm install
npm start
```
The frontend will run on **http://localhost:3000**.

> Note: `ToDo.js` currently points at the deployed Render API URL (`https://todolist-12qa.onrender.com/`). For local full-stack development, update the `apiUrl` constant to `http://localhost:8000/`.

---

## 📸 Screenshots

*(Add your own screenshots here — drop image files into a `/screenshots` folder in the repo and reference them below, or grab them straight from the [live demo](https://todolist-web-mern-project.netlify.app/))*

| Task List | Add / Edit Task |
|---|---|
| ![Task List](screenshots/task-list.png) | ![Add Task](screenshots/add-task.png) |

---

## 🔮 Future Enhancements

- 🔒 User authentication so tasks are private per user
- 🏷️ Task categories/tags and priority levels
- 🔍 Search and filter (e.g. show only overdue or completed tasks)
- 🔔 Reminder notifications as deadlines approach
- 📱 Mobile-responsive UI polish

---

## 👤 Contact

**Magesh Hariram K**
🔗 [LinkedIn](https://www.linkedin.com/in/magesh-hariram-k-6011132a4)
💻 [GitHub](https://github.com/mageshit24)

---

## 📄 License

This project is open source — feel free to use, modify, and build on it. Consider adding a `LICENSE` file (e.g. MIT) to make the terms explicit.
