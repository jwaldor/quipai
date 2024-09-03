import React, { useEffect, useState } from "react";
import { MAX_NUM_OF_USERS } from "../App";
import { FunnySprites } from "./DisplayUsers"; // Assuming FunnySprites is exported from DisplayUsers
import { socket } from "../routes/socket";
import { AccessContext } from "../helpers/StateProvider";
import { useContext } from "react";

const GameStart: React.FC = () => {
  const { gamestate } = useContext(AccessContext);

  const users = gamestate.users;

  const paddedUsers = [
    ...users,
    ...Array(MAX_NUM_OF_USERS - users.length).fill(undefined),
  ];

  const [newUser, setNewUser] = useState("");
  const [disabled, setDisabled] = useState(
    !!gamestate.users.find((u) => u.id === socket.id)
  );
  console.log("gamestate", gamestate);
  console.log("socket.id", socket.id);

  const handleAddNewUser = (e: any) => {
    e.preventDefault();
    console.log("adding new usre");
    socket.emit("adduser", newUser);
    setDisabled(true);
  };


  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 to-cyan-400 mx-auto">
      <div className="flex justify-center w-full pt-8">
        <h1 className="text-4xl font-bold text-white mb-8">Game Lobby</h1>
      </div>
      <div className="relative w-[70vw] h-[70vh] max-w-[700px] max-h-[700px] mx-auto">
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
                  sprite_id={index % 5}
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

      {!disabled ? (
        <form
          onSubmit={handleAddNewUser}
          className="w-full max-w-md flex mx-auto justify-center"
        >
          <input
            type="text"
            onChange={(e) => {
              setNewUser(e.target.value);
            }}
            placeholder="Enter your name ... "
            className="flex-grow px-4 py-2 rounded-l-full border-2 border-blue-300 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Join game
          </button>
        </form>
      ) : (
        <div className="text-center mt-4">
          <p className="text-white text-lg font-semibold">
            You have joined the game. Waiting for the host to start...
          </p>
        </div>
      )}
      {disabled && (
        <div className="flex justify-center mt-2 sm:mt-16 md:scale-150">
          <button
            type="submit"
            onClick={() => {
              console.log("begin game");
              socket.emit("begingame");
            }}
            className="bg-green-500 text-white px-4 py-2 mb-3 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Start game
          </button>
        </div>
      )}
    </div>
  );
};
const EmptyUserSprite: React.FC = () => {
  return <FunnySprites name="Empty" empty sprite_id={0} score={undefined} />;
};

export default GameStart;
