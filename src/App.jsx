import { Transport } from "./components/Transport";
import { roxanne } from "./songs/roxanne";
import "./App.css";

const song = roxanne;

function App() {
  return (
    <div>
      <Transport song={song} />
    </div>
  );
}

export default App;
