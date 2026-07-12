import './App.css';
import Todo from './ToDo';

// Root component. Kept intentionally thin — all the actual to-do logic and
// UI lives in <Todo />, this just provides the centered page container.
function App() {
  return (
    <div className="container">
      <Todo />
    </div>
  );
}

export default App;
