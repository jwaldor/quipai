// import React from "react";
// import { FunnySprites } from "./DisplayUsers"; // Assuming FunnySprites is exported from DisplayUsers
import { AccessContext } from "../helpers/StateProvider";
import { useContext } from "react";
import { socket } from "../routes/socket";

const WinModal = () => {
  const { gamestate } = useContext(AccessContext);

  const users = [...gamestate.users];
  users.sort((a, b) => b.score - a.score);

  const topUser = users[0];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Leaderboard</h2>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className={`p-4 rounded-lg ${user.id === topUser.id ? "bg-green-100" : "bg-gray-100"}`}
            >
              <p className="text-lg font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">Score: {user.score}</p>
              {user.id === topUser.id && (
                <p className="text-sm text-green-500 font-bold">Top Scorer!</p>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={() => {
              console.log("begin game");
              socket.emit("beginnewgame");
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinModal;