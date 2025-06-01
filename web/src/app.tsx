import "./app.css";
import { Counter } from "./counter";

const counter = new Counter();

export function App() {
  return (
    <div>
      <h1>Counter</h1>

      <p>Value: {counter.value}</p>

      <button
        onClick={() => {
          counter.increment();
        }}
      >
        Increment
      </button>
    </div>
  );
}
