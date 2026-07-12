/**
 * <Todo /> — the entire to-do list feature: fetches, creates, edits,
 * completes, and deletes items against the backend API, and renders
 * the header, add-item form, stats, filters, and list.
 *
 * State is kept flat and local to this component (no Redux/Context) since
 * there's only one feature and one screen — that would be over-engineering
 * for this app's size.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";
import "./ToDo.css";

// Configurable via .env (REACT_APP_API_URL) so the same code works against
// a local backend in dev and the deployed one in prod, without editing source.
// The trailing-slash strip means both "http://host" and "http://host/" work.
const apiUrl = (process.env.REACT_APP_API_URL || "https://todolist-12qa.onrender.com").replace(/\/$/, "");

// Filter tab definitions — single source of truth for both the button labels
// and the switch statement in `visibleTodos` below.
const FILTERS = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
    { key: "overdue", label: "Overdue" },
];

// Formats an ISO deadline string into a short, locale-aware display string,
// e.g. "Jul 12, 03:45 PM". Falls back to a placeholder when there's no value.
function formatDeadline(value) {
    if (!value) return "No deadline";
    return new Date(value).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function Todo() {
    // --- "Add new item" form state ---
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");

    // --- Data + request/UI state ---
    const [todos, setTodos] = useState([]);
    const [message, setMessage] = useState("");   // transient success toast text
    const [error, setError] = useState("");        // persistent error banner text
    const [loading, setLoading] = useState(true);   // true only during the initial fetch
    const [submitting, setSubmitting] = useState(false); // true while add/edit is in flight (disables inputs)

    // --- Inline "edit existing item" state ---
    // editId === -1 means "nothing is being edited"; otherwise it holds the
    // _id of the todo currently in edit mode, and the fields below hold its
    // in-progress edited values (kept separate from `todos` until saved).
    const [editId, setEditId] = useState(-1);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDeadline, setEditDeadline] = useState("");

    // --- Filter tab state ---
    const [filter, setFilter] = useState("all");

    // Fetches the full todo list from the API and replaces local state with it.
    // Wrapped in useCallback (stable identity, no deps) so it's safe to use as
    // an effect dependency below without causing a re-fetch loop.
    const getItems = useCallback(() => {
        setLoading(true);
        apiFetch(`${apiUrl}/todos`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load todos.");
                return res.json();
            })
            .then((res) => {
                if (Array.isArray(res)) {
                    setTodos(res);
                    setError("");
                } else {
                    // Defensive: if the API ever returns something unexpected
                    // (e.g. an error object with 200 status), don't silently
                    // render garbage — surface it instead.
                    console.error("Invalid todos response", res);
                    setError("Received an unexpected response from the server.");
                }
            })
            .catch((err) => {
                console.error("Failed to fetch todos:", err);
                setError(err.message || "Failed to load todos.");
            })
            .finally(() => setLoading(false));
    }, []);

    // Load the list once on mount.
    useEffect(() => {
        getItems();
    }, [getItems]);

    // Submits the "add new item" form.
    const handleSubmit = () => {
        setError("");
        // Client-side validation mirrors the backend's rules so the user gets
        // instant feedback instead of waiting on a round-trip for something
        // we already know is invalid.
        if (title.trim() === '' || description.trim() === '' || !deadline) {
            setError("All fields are required.");
            return;
        }
        if (isNaN(Date.parse(deadline))) {
            setError("Invalid deadline format");
            return;
        }

        setSubmitting(true);
        apiFetch(`${apiUrl}/todos`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title.trim(), description: description.trim(), deadline })
        }).then(async (res) => {
            if (res.ok) {
                getItems(); // simplest way to stay in sync: just refetch the list
                setMessage("Item added successfully.");
                setTitle("");
                setDescription("");
                setDeadline("");
                setTimeout(() => setMessage(""), 4000); // auto-dismiss the toast
            } else {
                const body = await res.json().catch(() => ({}));
                setError(body.message || "Unable to create Todo item.");
            }
        }).catch((err) => {
            setError(err.message || "Unable to create Todo item.");
        }).finally(() => setSubmitting(false));
    }

    // Switches a list item into edit mode, seeding the edit fields with its
    // current values.
    const handleEdit = (item) => {
        setError("");
        setEditId(item._id);
        setEditTitle(item.title);
        setEditDescription(item.description);
        // datetime-local inputs expect "YYYY-MM-DDTHH:mm" — slice off the
        // seconds/milliseconds/timezone that the ISO string from Mongo includes.
        setEditDeadline(item.deadline ? item.deadline.slice(0, 16) : "");
    }

    // Saves the currently-edited item.
    const handleUpdate = () => {
        setError("");
        if (editTitle.trim() === '' || editDescription.trim() === '' || !editDeadline) {
            setError("All fields are required.");
            return;
        }
        if (isNaN(Date.parse(editDeadline))) {
            setError("Invalid deadline format");
            return;
        }

        setSubmitting(true);
        apiFetch(`${apiUrl}/todos/${editId}`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: editTitle.trim(),
                description: editDescription.trim(),
                deadline: editDeadline
            })
        }).then(async (res) => {
            if (res.ok) {
                getItems();
                setMessage("Item updated successfully.");
                setEditId(-1); // exit edit mode
                setEditTitle("");
                setEditDescription("");
                setEditDeadline("");
                setTimeout(() => setMessage(""), 4000);
            } else {
                const body = await res.json().catch(() => ({}));
                setError(body.message || "Unable to update Todo item.");
            }
        }).catch((err) => {
            setError(err.message || "Unable to update Todo item.");
        }).finally(() => setSubmitting(false));
    }

    // Exits edit mode without saving.
    const handleEditCancel = () => {
        setEditId(-1);
        setError("");
    }

    // Toggles a single item's completed state via the checkbox.
    // Uses an optimistic update: the UI flips instantly, and only rolls back
    // if the PUT request actually fails — this makes checking things off feel
    // instant instead of waiting on a network round-trip every time.
    const handleToggleComplete = (item) => {
        setError("");
        const nextCompleted = !item.completed;
        setTodos((prev) => prev.map((t) => t._id === item._id ? { ...t, completed: nextCompleted } : t));
        apiFetch(`${apiUrl}/todos/${item._id}`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: nextCompleted })
        }).then((res) => {
            if (!res.ok) throw new Error("Unable to update item.");
        }).catch((err) => {
            // Roll back the optimistic change since the server didn't accept it.
            setTodos((prev) => prev.map((t) => t._id === item._id ? { ...t, completed: item.completed } : t));
            setError(err.message || "Unable to update item.");
        });
    }

    // Deletes an item after a native confirm() prompt. Updates local state
    // directly on success rather than refetching, since we already know
    // exactly which item to remove.
    const handleDelete = (id) => {
        if (!window.confirm('Are you sure want to delete?')) return;

        setError("");
        apiFetch(`${apiUrl}/todos/${id}`, { method: "DELETE" })
            .then((res) => {
                if (!res.ok) throw new Error("Unable to delete item.");
                setTodos((prev) => prev.filter((item) => item._id !== id));
            }).catch((err) => {
                setError(err.message || "Unable to delete item.");
            });
    }

    // Derived counts for the stats bar. useMemo avoids recomputing on every
    // render — only recalculates when the todos array actually changes.
    const stats = useMemo(() => ({
        total: todos.length,
        active: todos.filter((t) => !t.completed).length,
        completed: todos.filter((t) => t.completed).length,
        overdue: todos.filter((t) => t.isOverdue).length, // isOverdue is computed server-side, see backend/server.js
    }), [todos]);

    // The list actually rendered below, after applying the active filter tab.
    const visibleTodos = useMemo(() => {
        switch (filter) {
            case "active": return todos.filter((t) => !t.completed);
            case "completed": return todos.filter((t) => t.completed);
            case "overdue": return todos.filter((t) => t.isOverdue);
            default: return todos;
        }
    }, [todos, filter]);

    return <>
        {/* Success toast — only rendered while `message` is set, auto-clears itself */}
        {message && (
            <div className="th-toast">
                <span aria-hidden="true">✓</span> {message}
            </div>
        )}

        {/* Page header */}
        <div className="th-header">
            <span className="th-badge">MERN Stack</span>
            <h1>Your To-Do List</h1>
            <p>Stay on top of every deadline, one task at a time.</p>
        </div>

        {/* Add-item form */}
        <div className="th-card">
            <h3>Add a task</h3>
            <div className="th-form-grid">
                <div className="th-field">
                    <label htmlFor="th-title">Title</label>
                    <input id="th-title" placeholder="e.g. Finish report" onChange={(e) => setTitle(e.target.value)} value={title} className="th-input" type="text" disabled={submitting} />
                </div>
                <div className="th-field">
                    <label htmlFor="th-desc">Description</label>
                    <input id="th-desc" placeholder="Add some detail" onChange={(e) => setDescription(e.target.value)} value={description} className="th-input" type="text" disabled={submitting} />
                </div>
                <div className="th-field">
                    <label htmlFor="th-deadline">Deadline</label>
                    <input id="th-deadline" type="datetime-local" onChange={(e) => setDeadline(e.target.value)} value={deadline} className="th-input" disabled={submitting} />
                </div>
            </div>
            {error && <div className="th-error-banner">⚠ {error}</div>}
            <div className="th-submit-row">
                <button className="th-btn th-btn-primary" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Saving…" : "＋ Add task"}
                </button>
            </div>
        </div>

        {/* Stats bar — quick counts, always reflects the full list regardless of active filter */}
        <div className="th-stats">
            <div className="th-stat"><div className="th-stat-num">{stats.total}</div><div className="th-stat-label">Total</div></div>
            <div className="th-stat"><div className="th-stat-num">{stats.active}</div><div className="th-stat-label">Active</div></div>
            <div className="th-stat"><div className="th-stat-num">{stats.completed}</div><div className="th-stat-label">Done</div></div>
            <div className="th-stat"><div className="th-stat-num">{stats.overdue}</div><div className="th-stat-label">Overdue</div></div>
        </div>

        {/* Filter tabs */}
        <div className="th-filters">
            {FILTERS.map((f) => (
                <button
                    key={f.key}
                    className={`th-filter-btn ${filter === f.key ? "active" : ""}`}
                    onClick={() => setFilter(f.key)}
                >
                    {f.label}
                </button>
            ))}
        </div>

        {/* Main list area: loading skeleton -> empty state -> actual list, in that priority */}
        {loading ? (
            <div className="th-skeleton">
                <div className="th-skeleton-item" />
                <div className="th-skeleton-item" />
                <div className="th-skeleton-item" />
            </div>
        ) : visibleTodos.length === 0 ? (
            <div className="th-empty">
                <div className="th-empty-icon">🗒️</div>
                {/* Different message depending on whether there are truly no
                    todos at all, vs. just none matching the current filter. */}
                <p>{todos.length === 0 ? "No tasks yet — add one above." : "Nothing here for this filter."}</p>
            </div>
        ) : (
            <ul className="th-list">
                {visibleTodos.map((item) => (
                    <li className={`th-item ${item.completed ? "completed" : ""}`} key={item._id}>
                        {/* Hide the checkbox while this item is being edited —
                            toggling completion mid-edit would be confusing */}
                        {editId === item._id ? null : (
                            <input
                                type="checkbox"
                                className="th-checkbox"
                                checked={!!item.completed}
                                onChange={() => handleToggleComplete(item)}
                                aria-label={`Mark "${item.title}" as ${item.completed ? "active" : "completed"}`}
                            />
                        )}
                        <div className="th-item-body">
                            {editId === -1 || editId !== item._id ? (
                                // --- Read-only view of the item ---
                                <>
                                    <p className="th-item-title">{item.title}</p>
                                    {item.description && <p className="th-item-desc">{item.description}</p>}
                                    <div className="th-meta-row">
                                        <span className="th-badge th-badge-deadline">📅 {formatDeadline(item.deadline)}</span>
                                        {item.isOverdue && <span className="th-badge th-badge-overdue">⏰ Overdue</span>}
                                        {item.completed && <span className="th-badge th-badge-done">✓ Done</span>}
                                    </div>
                                </>
                            ) : (
                                // --- Inline edit form, shown only for the item being edited ---
                                <div className="th-edit-grid">
                                    <input placeholder="Title" onChange={(e) => setEditTitle(e.target.value)} value={editTitle} className="th-input" type="text" />
                                    <input placeholder="Description" onChange={(e) => setEditDescription(e.target.value)} value={editDescription} className="th-input" type="text" />
                                    <input type="datetime-local" onChange={(e) => setEditDeadline(e.target.value)} value={editDeadline} className="th-input" />
                                </div>
                            )}
                        </div>
                        <div className="th-item-actions">
                            {editId === -1 || editId !== item._id ? (
                                <>
                                    <button className="th-btn th-btn-ghost th-btn-icon" onClick={() => handleEdit(item)} aria-label="Edit" title="Edit">✎</button>
                                    <button className="th-btn th-btn-danger th-btn-icon" onClick={() => handleDelete(item._id)} aria-label="Delete" title="Delete">🗑</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleUpdate} className="th-btn th-btn-primary" disabled={submitting}>
                                        {submitting ? "Saving…" : "Save"}
                                    </button>
                                    <button className="th-btn th-btn-ghost" onClick={handleEditCancel}>Cancel</button>
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        )}
    </>
}
