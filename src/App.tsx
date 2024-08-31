import { useState } from "react";
import GameStart from "./pages/GameStart";

export const MAX_NUM_OF_USERS = 8

interface User {
  name: string;
  sprite_id: number;
  score: number;
}


export interface GameState  {
  users: User[];
}

function App() {
  // states are joinGame, 
  const [step, setStep] = useState<'joinGame' | 'gameplay'>('joinGame') 

  const [gameState, setGameState] = useState<GameState>({
    users: [
      { name: "Player1", sprite_id: 1, score: 0 },
      { name: "Player2", sprite_id: 2, score: 0 },
      { name: "Player3", sprite_id: 3, score: 0 },
    ]
  });
  


  return (
    <>
      {step === 'joinGame' && <GameStart gameState={gameState}/>}
    </>
  );
}

export default App;
