import { useState, useEffect, FC, ReactNode } from "react";
import { createContext } from "react";
import { socket } from "../routes/socket";

export type GameStateType = {
  mode: "start" | "topic" | "ask" | "results" | "end";
  ask_state: { prompt: string; answers: Map<string, string> } | undefined;
  answers: Array<{ text: string; user_id:string;}>;
  topic_state: { topic: string } | undefined;
  elapsed_rounds: number;
  count_time: number | undefined;
  users: Array<{ name: string; score: number; id: string }>;
  last_winner: string | undefined;
};

export const AccessContext = createContext<{
  gamestate: GameStateType;
}>({
  gamestate: {
    mode: "start",
    ask_state: undefined,
    answers: [],
    topic_state: undefined,
    users: [],
    count_time: undefined,
    elapsed_rounds: 0,
    last_winner: undefined,
  },
});

type Props = {
  children: ReactNode;
};

export const StateProvider: FC<Props> = ({ children }) => {
  const [gamestate, setGameState] = useState<GameStateType>({
    mode: "start",
    ask_state: undefined,
    answers: [],
    topic_state: undefined,
    users: [],
    count_time: undefined,
    elapsed_rounds: 0,
    last_winner: undefined,
  });

  // const redirectUri = import.meta.env.VITE_REDIRECT_URI;
  function msleep(n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
  }
  // function seekSong()
  useEffect(() => {
    const fetchData = async () => {
      socket.on("gamestate", (state) => {
        console.log("state", state);
        setGameState(state);
      });
      console.log("test");
      socket.emit("creategame", "game1");
      await new Promise(r => setTimeout(r, 3000));
      console.log("addusergame")
      socket.emit("addusergame", "game1","bob");
      await new Promise(r => setTimeout(r, 1000));
      console.log("test emit")
      socket.emit("test");
    };

    fetchData();

    return () => {
      socket.removeListener("gamestate");
    };
  }, []);

  return (
    <>
      <AccessContext.Provider
        value={{
          gamestate: gamestate,
        }}
      >
        {children}
      </AccessContext.Provider>
    </>
  );
};
