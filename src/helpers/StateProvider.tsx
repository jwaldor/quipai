import { useState, useEffect, FC, ReactNode } from "react";
import { createContext } from "react";
import { socket } from "../routes/socket";

export type GameStateType = {
  mode: "start" | "topic" | "ask" | "results" | "end";
  ask_state: { prompt: string; answers: Map<string, string> } | undefined;
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
    topic_state: undefined,
    users: [],
    count_time: undefined,
    elapsed_rounds: 0,
    last_winner: undefined,
  });

  // const redirectUri = import.meta.env.VITE_REDIRECT_URI;

  // function seekSong()
  useEffect(() => {
    socket.on("gamestate", (state) => {
      setGameState(state);
    });

    return () => {
      // socket.removeListener("newuser");
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
