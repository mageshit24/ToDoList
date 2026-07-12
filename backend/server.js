/**
 * ToDoList API — Express + MongoDB (Mongoose)
 *
 * Endpoints:
 *   GET    /health       - uptime/cold-start check
 *   GET    /todos        - list all todos (sorted by deadline, includes isOverdue)
 *   POST   /todos         - create a todo
 *   PUT    /todos/:id    - update a todo (partial update)
 *   DELETE /todos/:id    - delete a todo
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const nodeEnv = process.env.NODE_ENV || 'development';

// ---------------------------------------------------------------------------
// Startup config check
// ---------------------------------------------------------------------------
// Fail fast if required config is missing instead of limping along
if (!process.env.MONGODB_URI) {
  console.error('FATAL: MONGODB_URI is not set. Check your .env file.');
  process.exit(1);
}

const app = express();

// ---------------------------------------------------------------------------
// Global middleware (order matters: security/parsing first, routes last)
// ---------------------------------------------------------------------------

// Security headers (helmet sets sane defaults: no-sniff, hidden X-Powered-By,
// Content-Security-Policy, HSTS, etc). This is the single biggest "free"
// security win for an Express app.
app.use(helmet());
app.disable('x-powered-by'); // belt-and-braces, helmet already does this

// Gzip/deflate every response — smaller payloads, faster page loads.
app.use(compression());

// Parse JSON request bodies. Capped at 100kb: this API never needs more,
// and a small cap makes it harder to use the endpoint for a memory-exhaustion
// style DoS with huge payloads.
app.use(express.json({ limit: '100kb' }));

// Strip any keys starting with "$" or containing "." from req.body/query/params
// so a crafted payload like { "title": { "$gt": "" } } can't be used for
// NoSQL operator injection (e.g. bypassing filters or triggering unexpected
// query behaviour in Mongo).
app.use(mongoSanitize());

// --- CORS -------------------------------------------------------------
// Restrict CORS to known origins. Set ALLOWED_ORIGINS="https://your-frontend.com,https://other.com"
// in env. In production, if it's not set, we fail closed (reject cross-origin
// requests) rather than silently allowing every origin — the old behaviour
// (`origin: true`) would let *any* website's JS call this API on a visitor's
// behalf, which is fine for local dev but not for a public deployment.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : null;

if (!allowedOrigins && nodeEnv === 'production') {
  console.warn('WARNING: ALLOWED_ORIGINS is not set in production. CORS will reject all cross-origin requests until it is configured.');
}

app.use(cors({
  origin: allowedOrigins || (nodeEnv === 'production' ? false : true),
}));

// --- Rate limiting ------------------------------------------------------
// Basic rate limiting on the API so a single client can't hammer the DB
// (protects the free-tier Mongo cluster / Render instance from abuse, and
// blunts basic scripted attacks against the write endpoints).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,                 // generous for normal use, blocks scripted abuse
  standardHeaders: true,    // return RateLimit-* headers
  legacyHeaders: false,     // don't bother with the older X-RateLimit-* headers
  message: { message: 'Too many requests, please slow down and try again shortly.' },
});
app.use('/todos', apiLimiter);

// --- Request logging ------------------------------------------------------
// Simple request logger — helps diagnose 500s / slow responses in prod logs.
// Logs after the response finishes so we can include status code + duration.
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// ---------------------------------------------------------------------------
// Database connection
// ---------------------------------------------------------------------------

// mongoose 6+ no longer needs useNewUrlParser/useUnifiedTopology — they're
// deprecated no-ops in modern versions and were only clutter/warnings, not
// fixes, so they're intentionally left out.
mongoose.set('strictQuery', true);

let isDbConnected = false; // tracked separately so /health can report it even mid-reconnect

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // fail fast instead of hanging requests forever
})
  .then(() => {
    isDbConnected = true;
    console.log('MongoDB connected');
  })
  .catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
  console.warn('MongoDB disconnected');
});
mongoose.connection.on('reconnected', () => {
  isDbConnected = true;
  console.log('MongoDB reconnected');
});

// Guard every /todos route: return a clear 503 instead of a confusing 500
// when the DB isn't ready yet (e.g. Render cold start racing the connection).
// This must be registered *after* the rate limiter (so limited requests still
// count) but *before* the actual /todos handlers below.
app.use('/todos', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database is not ready yet, please retry shortly.' });
  }
  next();
});

// Lightweight endpoint for uptime pings / cold-start warmup — avoids the
// "buffering" feel of Render free-tier instances spinning down. Doesn't
// require the DB to be up, so it always responds fast.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', dbConnected: isDbConnected });
});

// ---------------------------------------------------------------------------
// Schema / Model
// ---------------------------------------------------------------------------

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,                                          // strips leading/trailing whitespace automatically
    maxlength: [200, 'Title must be 200 characters or fewer.'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description must be 2000 characters or fewer.'],
    default: '',
  },
  deadline: {
    type: Date,
    required: true,
    index: true, // list view always sorts by deadline — index keeps that cheap as data grows
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true }); // adds createdAt/updatedAt automatically, useful for debugging/auditing

const todoModel = mongoose.model('Todo', todoSchema);

// ---------------------------------------------------------------------------
// Small validation helpers (shared by multiple routes below)
// ---------------------------------------------------------------------------

// Basic ObjectId check so bad ids return 400, not an ugly CastError-as-500.
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// A couple of fields arrive as free text from the client — guard against
// non-string types (e.g. a crafted { "title": { "$ne": null } } payload)
// before touching them, on top of the mongo-sanitize middleware above.
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isString = (v) => typeof v === 'string';

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// --- Create Todo ---------------------------------------------------------
app.post('/todos', async (req, res) => {
  const { title, description, deadline } = req.body;

  // Validate before touching the DB — cheap checks first, DB round-trip only
  // once the input actually looks usable.
  if (!isNonEmptyString(title)) {
    return res.status(400).json({ message: 'Title is required.' });
  }
  if (description !== undefined && !isString(description)) {
    return res.status(400).json({ message: 'Description must be text.' });
  }
  if (!deadline || isNaN(Date.parse(deadline))) {
    return res.status(400).json({ message: 'A valid deadline is required.' });
  }

  try {
    const newTodo = new todoModel({
      title: title.trim(),
      description: description ? description.trim() : '',
      deadline,
    });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('POST /todos error:', error);
    if (error.name === 'ValidationError') {
      // Schema-level validation failed (e.g. maxlength) — safe to show the message.
      return res.status(400).json({ message: error.message });
    }
    // Don't leak internals (stack traces, driver errors) to the client.
    res.status(500).json({ message: 'Something went wrong creating the todo.' });
  }
});

// --- Update Todo (partial) ------------------------------------------------
app.put('/todos/:id', async (req, res) => {
  const { title, description, deadline, completed } = req.body;
  const id = req.params.id;

  if (!isValidId(id)) {
    return res.status(400).json({ message: 'Invalid todo id.' });
  }
  // Every field here is optional on PUT — only validate the ones actually sent
  // (the frontend uses this both for full edits and for just toggling `completed`).
  if (title !== undefined && !isNonEmptyString(title)) {
    return res.status(400).json({ message: 'Title cannot be empty.' });
  }
  if (description !== undefined && !isString(description)) {
    return res.status(400).json({ message: 'Description must be text.' });
  }
  if (deadline !== undefined && isNaN(Date.parse(deadline))) {
    return res.status(400).json({ message: 'Invalid deadline format.' });
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'Completed must be true or false.' });
  }

  try {
    // Build the update object from only the fields that were actually sent,
    // so e.g. toggling `completed` doesn't accidentally wipe the title.
    const update = {};
    if (title !== undefined) update.title = title.trim();
    if (description !== undefined) update.description = description.trim();
    if (deadline !== undefined) update.deadline = deadline;
    if (completed !== undefined) update.completed = completed;

    const updatedTodo = await todoModel.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true } // return the updated doc, re-run schema validation
    );
    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found.' });
    }
    res.json(updatedTodo);
  } catch (error) {
    console.error('PUT /todos/:id error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Something went wrong updating the todo.' });
  }
});

// --- List Todos (with computed isOverdue flag) ----------------------------
app.get('/todos', async (req, res) => {
  try {
    // .lean() skips hydrating full Mongoose documents — plain JS objects are
    // enough here since we only read and reshape, which is faster and uses
    // less memory on every request (no change-tracking, getters, etc).
    const todos = await todoModel.find().sort({ deadline: 1 }).lean();

    // isOverdue is derived, not stored — computing it at request time means
    // it's always correct relative to "now", with no need for a cron job to
    // keep a stored flag in sync.
    const currentTime = new Date();
    const todosWithOverdueStatus = todos.map(todo => ({
      ...todo,
      isOverdue: new Date(todo.deadline) < currentTime && !todo.completed,
    }));

    res.json(todosWithOverdueStatus);
  } catch (error) {
    console.error('GET /todos error:', error);
    res.status(500).json({ message: 'Something went wrong fetching todos.' });
  }
});

// --- Delete Todo -----------------------------------------------------------
app.delete('/todos/:id', async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) {
    return res.status(400).json({ message: 'Invalid todo id.' });
  }
  try {
    const result = await todoModel.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Todo not found for deletion.' });
    }
    res.status(204).end(); // 204 No Content: successful delete, nothing to return
  } catch (error) {
    console.error('DELETE /todos/:id error:', error);
    res.status(500).json({ message: 'Something went wrong deleting the todo.' });
  }
});

// ---------------------------------------------------------------------------
// Fallback handlers (must be registered last)
// ---------------------------------------------------------------------------

// 404 for anything unmatched (unknown routes/methods)
app.use((req, res) => {
  res.status(404).json({ message: 'Not found.' });
});

// Centralized error handler — catches anything that slips past try/catch
// (e.g. malformed JSON bodies from express.json()) instead of crashing with
// a raw stack trace or letting Express's default HTML error page leak details.
// Express recognizes this as an error handler specifically because it takes
// 4 arguments (err, req, res, next).
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: 'Internal server error.' });
});

// ---------------------------------------------------------------------------
// Server startup / shutdown
// ---------------------------------------------------------------------------

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port} (${nodeEnv})`);
});

// Graceful shutdown: on SIGTERM (e.g. platform redeploy/restart), stop
// accepting new connections, let in-flight requests finish, close the DB
// connection cleanly, then exit — avoids dropped requests and connection leaks.
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
});
