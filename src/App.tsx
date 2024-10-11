import { useContext } from "react";
import GameStart from "./pages/GameStart";
import { PickTopicScreen } from "./pages/PickTopicScreen";
import { AccessContext } from "./helpers/StateProvider";
import RoundResults from "./pages/RoundResults";
import GamePlay from "./pages/GamePlay";
import JoinGameRoom from "./pages/JoinGameRoom";
import WinModal from "./pages/WinModal";

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

  const { gamestate,userstate } = useContext(AccessContext);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 to-cyan-400 mx-auto">
      {userstate === "joined" && <>
      {gamestate.mode === "start" && gamestate.mode === "start" && <GameStart />}
      {gamestate.mode === "topic" && <PickTopicScreen />}
      {gamestate.mode === "ask" && <GamePlay />}
      {gamestate.mode === "results" && <RoundResults/>}
      {gamestate.mode === "end" && <WinModal/>}
      </>}
      {userstate === "not_joined" && <JoinGameRoom />}
       
    </div>
  );
}

export default App;
