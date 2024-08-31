import { useState } from "react";
import GameStart from "./pages/GameStart";
import { PickTopicScreen } from "./pages/PickTopicScreen";

export const MAX_NUM_OF_USERS = 8

interface User {
  name: string;
  sprite_id: number;
  score: number;
}


export interface GameState  {
  users: User[];
  gameStarted: boolean;
}

function App() {
  // states are joinGame, 
  const [step, setStep] = useState<'joinGame' | 'gameplay'>('joinGame') 

  const [gameState, setGameState] = useState<GameState>({
    users: [
      { name: "Player1", sprite_id: 1, score: 0 },
      { name: "Player2", sprite_id: 2, score: 0 },
      { name: "Player3", sprite_id: 3, score: 0 },
    ],
    gameStarted: true
  });

  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 to-cyan-400 mx-auto">

      {step === 'joinGame' && !gameState.gameStarted && <GameStart gameState={gameState}/>}
      {gameState.gameStarted && <PickTopicScreen gameState={gameState}/> }
    </div>
  );
}

export default App;
