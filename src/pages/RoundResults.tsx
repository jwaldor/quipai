import React, { useState } from "react";
import { GameState, MAX_NUM_OF_USERS } from "../App";
import { FunnySprites } from "./DisplayUsers"; // Assuming FunnySprites is exported from DisplayUsers
import { socket } from "../routes/socket";
import { GameStateType } from "../helpers/StateProvider";
import { AccessContext } from "../helpers/StateProvider";
import { useContext } from "react";

const RoundResults: React.FC = () => {
  const { gamestate } = useContext(AccessContext);

  const users = gamestate.users;
  users.sort((a, b) => b.score - a.score);

  const paddedUsers = [
    ...users,
    ...Array(MAX_NUM_OF_USERS - users.length).fill(undefined),
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 to-cyan-400 mx-auto">
      <div className="flex flex-col items-center justify-center w-full pt-8">
        <h1 className="text-4xl font-bold text-white mb-8">Results</h1>
        {/* <div className="flex flex-row">
          <span className="sr-only">Awaiting results...</span>
          <div class="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div class="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div class="h-2 w-2 bg-black rounded-full animate-bounce"></div>
        </div> */}
        <div>
          {" "}
          <span className="loading loading-spinner text-primary"></span>
          <span className="loading loading-spinner text-secondary"></span>
          <span className="loading loading-spinner text-accent"></span>
          <span className="loading loading-spinner text-warning"></span>
          <span className="loading loading-spinner text-error"></span>
        </div>
      </div>
      <div className="relative w-[70vw] h-[70vh] max-w-[700px] max-h-[400px] mx-auto">
        {paddedUsers.map((user, index) => {
          const angle = (index / MAX_NUM_OF_USERS) * 2 * Math.PI;
          const radius = Math.min(
            200,
            window.innerWidth * 0.4,
            window.innerHeight * 0.4
          );
          const left = `calc(50% + ${radius * Math.cos(angle)}px)`;
          const top = `calc(50% + ${radius * Math.sin(angle)}px)`;
          const size = Math.min(
            80,
            window.innerWidth * 0.1,
            window.innerHeight * 0.1
          );
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left,
                top,
                transform: "translate(-50%, -50%)",
                width: `${size}px`,
                height: `${size}px`,
              }}
            >
              {user ? (
                <FunnySprites
                  sprite_id={user.sprite_id}
                  name={user.name}
                  score={user.score}
                />
              ) : (
                <EmptyUserSprite />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-2 sm:mt-16 md:scale-150">
        <button
          type="submit"
          onClick={() => {
            console.log("begin game");
            socket.emit("begingame");
          }}
          className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Next Game
        </button>
      </div>
    </div>
  );
};
const EmptyUserSprite: React.FC = () => {
  return <FunnySprites name="Empty" empty sprite_id={0} score={undefined} />;
};

export default RoundResults;
