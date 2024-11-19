import { useEffect, useState } from "react";

export default function Todo() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState(""); // New state for deadline
    const [todos, setTodos] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [editId, setEditId] = useState(-1);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDeadline, setEditDeadline] = useState(""); // New state for editing deadline

    const apiUrl = "http://localhost:8000/";

    const handleSubmit = () => {
        setError("");
        // Check inputs
        if (title.trim() !== '' && description.trim() !== '' && deadline) {
            // API call
            fetch(apiUrl + "todos", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description, deadline }) // Include deadline
            }).then((res) => {
                if (res.ok) {
                    // Add Item to list
                    setTodos([...todos, { title, description, deadline }]);
                    setMessage("Item added successfully.");
                    setTitle("");
                    setDescription("");
                    setDeadline(""); // Reset deadline
                    setTimeout(() => {
                        setMessage("");
                    }, 3000);
                } else {
                    // Set Error
                    setError("Unable to create Todo item.");
                }
            }).catch(() => {
                setError("Unable to create Todo item.");
            });
        }
    }

    useEffect(() => {
        getItems();
    }, []);

    const getItems = () => {
        fetch(apiUrl + "todos")
            .then((res) => res.json())
            .then((res) => {
                setTodos(res);
            });
    }

    const handleEdit = (item) => {
        setEditId(item._id);
        setEditTitle(item.title);
        setEditDescription(item.description);
        setEditDeadline(item.deadline); // Set the deadline for editing
    }

    const handleUpdate = () => {
        setError("");
        // Check inputs
        if (editTitle.trim() !== '' && editDescription.trim() !== '' && editDeadline) {
            // API call
            fetch(apiUrl + "todos/" + editId, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: editTitle, description: editDescription, deadline: editDeadline }) // Include deadline
            }).then((res) => {
                if (res.ok) {
                    // Update Item to list
                    const updatedTodos = todos.map((item) => {
                        if (item._id === editId) {
                            item.title = editTitle;
                            item.description = editDescription;
                            item.deadline = editDeadline; // Update deadline
                        }
                        return item;
                    });
                    setTodos(updatedTodos);
                    setMessage("Item updated successfully.");
                    setEditTitle("");
                    setEditDescription("");
                    setEditDeadline(""); // Reset edit deadline
                    setTimeout(() => {
                        setMessage("");
                    }, 3000);

                    setEditId(-1);
                } else {
                    // Set Error
                    setError("Unable to update Todo item.");
                }
            }).catch(() => {
                setError("Unable to update Todo item.");
            });
        }
    }

    const handleEditCancel = () => {
        setEditId(-1);
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure want to delete?')) {
            fetch(apiUrl + 'todos/' + id, {
                method: "DELETE"
            })
                .then(() => {
                    const updatedTodos = todos.filter((item) => item._id !== id);
                    setTodos(updatedTodos);
                });
        }
    }

    return <>
        <div className="row p-3 bg-success text-light">
            <h1>ToDo Project with MERN stack.</h1>
        </div>
        <div className="row">
            <h3>Add Item</h3>
            {message && <p className="text-success">{message}</p>}
            <div className="form-group d-flex gap-2">
                <input placeholder="Title" onChange={(e) => setTitle(e.target.value)} value={title} className="form-control" type="text" />
                <input placeholder="Description" onChange={(e) => setDescription(e.target.value)} value={description} className="form-control" type="text" />
                <input type="datetime-local" onChange={(e) => setDeadline(e.target.value)} value={deadline} className="form-control" /> {/* Deadline input */}
                <button className="btn btn-dark" onClick={handleSubmit}>Submit</button>
            </div>
            {error && <p className="text-danger">{error}</p>}
        </div>
        <div className="row mt-3">
            <h3>Tasks</h3>
            <div className="col-md-6">
                <ul className="list-group">
                    {
                        todos.map((item) =>
                            <li className="list-group-item bg-info d-flex justify-content-between align-items-center my-2" key={item._id}>
                                <div className="d-flex flex-column me-2">
                                    {
                                        editId === -1 || editId !== item._id ? <>
                                            <span className="fw-bold">{item.title}</span>
                                            <span>{item.description}</span>
                                            <span>Deadline: {new Date(item.deadline).toLocaleString()}</span> {/* Display the deadline */}
                                        </> : <>
                                            <div className="form-group d-flex gap-2">
                                                <input placeholder="Title" onChange={(e) => setEditTitle(e.target.value)} value={editTitle} className="form-control" type="text" />
                                                <input placeholder="Description" onChange={(e) => setEditDescription(e.target.value)} value={editDescription} className="form-control" type="text" />
                                                <input type="datetime-local" onChange={(e) => setEditDeadline(e.target.value)} value={editDeadline} className="form-control" /> {/* Edit deadline input */}
                                            </div>
                                        </>
                                    }
                                </div>
                                <div className="d-flex gap-2">
                                    {editId === -1 || editId !== item._id ? 
                                        <button className="btn btn-warning" onClick={() => handleEdit(item)}>Edit</button> : 
                                        <button onClick={handleUpdate} className="btn btn-warning">Update</button>}
                                    {editId === -1 || editId !== item._id ? 
                                        <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>Delete</button> : 
                                        <button className="btn btn-danger" onClick={handleEditCancel}>Cancel</button>}
                                </div>
                            </li>
                        )
                    }
                </ul>
            </div>
        </div>
    </>
}