import { useContext, useState } from "react";
import GameStart from "./pages/GameStart";
import { PickTopicScreen } from "./pages/PickTopicScreen";
import { AccessContext } from "./helpers/StateProvider";

export const MAX_NUM_OF_USERS = 8;

interface User {
  name: string;
  sprite_id: number;
  score: number;
}

export interface GameState {
  users: User[];
  gameStarted: boolean;
}

function App() {
  // states are joinGame,
  const [step, setStep] = useState<"joinGame" | "gameplay">("joinGame");

  const { gamestate } = useContext(AccessContext);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 to-cyan-400 mx-auto">
      {step === "joinGame" && gamestate.mode === "start" && (
        <GameStart gamestate={gamestate} />
      )}
      {gamestate.mode === "topic" && <PickTopicScreen gamestate={gamestate} />}
    </div>
  );
}

export default App;
