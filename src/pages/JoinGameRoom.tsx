import React, { useState } from "react";
import { socket } from "../routes/socket";
import { useContext } from "react";
import { AccessContext } from "../helpers/StateProvider";

const JoinGameRoom: React.FC = () => {
  const [gameName, setGameName] = useState("");
  const [userName, setUserName] = useState("");

  // const { gamestate } = useContext(AccessContext);


  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Joining game with", { gameName, userName });
    socket.emit("addusergame",gameName,userName)
    // Logic for joining the game would go here
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Join a Game Room
        </h2>
        <form onSubmit={handleJoinGame} className="space-y-4">
          <div>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Game"
              className="w-full px-4 py-2 rounded-full border-2 border-yellow-700 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Display name"
              className="w-full px-4 py-2 rounded-full border-2 border-blue-300 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Join Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGameRoom;