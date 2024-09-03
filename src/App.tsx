import { useContext, useState } from "react";
import GameStart from "./pages/GameStart";
import { PickTopicScreen } from "./pages/PickTopicScreen";
import { AccessContext } from "./helpers/StateProvider";
import RoundResults from "./pages/RoundResults";
import GamePlay from "./pages/GamePlay";

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

  const { gamestate } = useContext(AccessContext);
  console.log('got state', gamestate)

  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 to-cyan-400 mx-auto">
      {gamestate.mode === "start" && gamestate.mode === "start" && <GameStart />}
      {gamestate.mode === "topic" && <PickTopicScreen />}
      {gamestate.mode === "ask" && <GamePlay />}
      {gamestate.mode === "results" && <RoundResults/>}

       
    </div>
  );
}

export default App;
