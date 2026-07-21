<div align="center">

# 📝 ToDoList

### A clean, full-stack task manager built with the MERN stack

[![Live Demo](https://img.shields.io/badge/demo-live-6366f1?style=for-the-badge)](https://todolist-web-mern-project.netlify.app/)
[![License: ISC](https://img.shields.io/badge/license-ISC-blue?style=for-the-badge)](#-license)

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white)

[Live Demo](https://todolist-web-mern-project.netlify.app/) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📸 Preview

<div align="center">
  <img src="https://github.com/user-attachments/assets/2a5e922f-59a3-4af1-9e02-6a2fbead1391" alt="ToDoList dashboard showing task list, stats, and filters" width="800"/>
  <p><em>Main dashboard — stats bar, filter tabs, and task list</em></p>
</div>

<table>
  <tr>
    <td width="50%" align="center">
      <img src="https://github.com/user-attachments/assets/e88ea4d2-2ab7-4f29-81c7-9cd812d2b126" alt="Add task form" width="100%"/>
      <p><em>Adding a new task</em></p>
    </td>
    <td width="50%" align="center">
      <img src="https://github.com/user-attachments/assets/0d7e3b35-36dd-4cdd-bded-89c0518976bf" alt="Overdue task badge" width="100%"/>
      <p><em>Overdue detection in action</em></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="https://github.com/user-attachments/assets/b27c1246-33ec-4caf-b83d-8da4ba1bc36b" alt="Inline task editing" width="100%"/>
      <p><em>Inline editing</em></p>
    </td>
    <td width="50%" align="center">
      <img src="https://github.com/user-attachments/assets/34b62458-2926-49d0-8173-1d0af8ad8ad6" alt="Mobile responsive view" width="220"/>
      <p><em>Mobile view</em></p>
    </td>
  </tr>
</table>

---

## ✨ Features

- ✅ Create, edit, and delete tasks with a title, description, and deadline
- ✅ One-click complete/active toggle with optimistic UI updates
- ⏰ Automatic overdue detection, computed server-side in real time
- 🔍 Filter by All / Active / Completed / Overdue
- 📊 Live task stats - total, active, completed, overdue
- 💨 Smooth loading skeletons, toasts, and empty states
- 📱 Fully responsive gradient-based design, no UI framework dependency

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), custom CSS |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| Security | Helmet, express-rate-limit, express-mongo-sanitize, CORS allowlisting |
| Hosting | Render (API) · Netlify (frontend) |

## 📁 Project Structure

```
ToDoList/
├── backend/
│   ├── server.js          # Express app, routes, DB connection
│   ├── package.json
│   └── .env.example       # copy to .env and fill in real values
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── ToDo.jsx        # main feature component
│   │   ├── ToDo.css
│   │   ├── Clock.jsx        # live header clock
│   │   ├── DevToolsGuard.jsx
│   │   ├── api.js          # fetch wrapper with timeout handling
│   │   └── index.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20.19.0
- npm
- A MongoDB Atlas cluster (or local MongoDB instance)

### 1. Clone the repo

```bash
git clone https://github.com/mageshit24/ToDoList.git
cd ToDoList
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create and fill in `backend/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
PORT=8000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

Run it:

```bash
npm run dev      # native Node --watch, auto-restarts on changes
# or
npm start        # plain node, for production
```

Server starts on `http://localhost:8000` - check `http://localhost:8000/health`, should return `{"status":"ok","dbConnected":true}`.

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

Fill in `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Run it:

```bash
npm run dev
```

Opens on `http://localhost:3000`.

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Uptime / DB connection check |
| `GET` | `/todos` | List all todos, sorted by deadline |
| `POST` | `/todos` | Create a todo (`title`, `description`, `deadline`) |
| `PUT` | `/todos/:id` | Update a todo (any subset of fields) |
| `DELETE` | `/todos/:id` | Delete a todo |

## 🔒 Security

- **Helmet** - standard HTTP security headers (CSP, HSTS, no-sniff)
- **Rate limiting** - 300 requests / 15 min per IP on `/todos`
- **Input sanitization** - `express-mongo-sanitize` blocks NoSQL operator injection; explicit type/length checks on all inputs
- **CORS allowlisting** - fails closed in production if `ALLOWED_ORIGINS` isn't set
- **No secrets in git** - `.env` files are gitignored; `.env.example` provides the template

## ☁️ Deployment

**Backend (Render)** - environment variables required:
```
MONGODB_URI=<your connection string>
NODE_ENV=production
ALLOWED_ORIGINS=https://your-site-name.netlify.app
```

**Frontend (Netlify)** - environment variable required:
```
VITE_API_URL=https://your-backend.onrender.com
```
Build command: `npm run build` · Publish directory: `dist`

## 🧪 Scripts

<table>
<tr><th>Backend</th><th>Frontend</th></tr>
<tr>
<td>

| Command | Description |
|---|---|
| `npm start` | Production mode |
| `npm run dev` | Dev mode (native `--watch`) |

</td>
<td>

| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |

</td>
</tr>
</table>

## 👤 Author

**Magesh Hariram K**

[![GitHub](https://img.shields.io/badge/GitHub-mageshit24-181717?style=flat-square&logo=github)](https://github.com/mageshit24)
[![Portfolio](https://img.shields.io/badge/Portfolio-mageshhariramk.netlify.app-6366f1?style=flat-square&logo=netlify)](https://mageshhariramk.netlify.app)

## 📄 License

ISC

---

<div align="center">
<sub>Built with ☕ and the MERN stack</sub>
</div>
