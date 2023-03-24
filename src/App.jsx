import { useState } from "react";
import { Transport } from "./components/Transport";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <Transport />
    </div>
  );
}

export default App;
