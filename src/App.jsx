import { Mixer } from "./components/Mixer";
import { roxanne } from "./songs/roxanne";
import "./App.css";

const song = roxanne;

function App() {
  return (
    <div>
      <Mixer song={song} />
    </div>
  );
}

export default App;
