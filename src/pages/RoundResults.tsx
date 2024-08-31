import React from "react";
import { FunnySprites } from "./DisplayUsers"; // Assuming FunnySprites is exported from DisplayUsers
import { socket } from "../routes/socket";
import { AccessContext } from "../helpers/StateProvider";
import { useContext } from "react";

const RoundResults = () => {
  const { gamestate } = useContext(AccessContext);

  const users = gamestate.users;
  users.sort((a, b) => b.score - a.score);


  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 to-cyan-400 mx-auto">
      <div className="flex justify-center w-full pt-8">
        <h1 className="text-4xl font-bold text-white mb-8">Results</h1>
      </div>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Question Prompt:</h2>
        <p className="text-lg mb-6 text-gray-600">{gamestate.ask_state?.prompt}</p>

        <h3 className="text-xl font-semibold mb-2 text-gray-800">Winning Answer:</h3>
        {gamestate.last_winner && (
          <div className="bg-green-100 p-4 rounded-lg mb-6">
            <p className="text-lg font-medium text-gray-800">
              {users.find(user => user.id === gamestate.last_winner)?.name}
            </p>
            <p className="text-gray-600">
              {gamestate.ask_state?.answers.get(gamestate.last_winner)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Score: {users.find(user => user.id === gamestate.last_winner)?.score}
            </p>
          </div>
        )}

        <hr className="my-6 border-t border-gray-300" />

        <h3 className="text-xl font-semibold mb-4 text-gray-800">All Answers:</h3>
        <div className="space-y-4">
          {Array.from(gamestate.ask_state?.answers || []).map(([userId, answer]) => {
            const user = users.find(u => u.id === userId);
            return (
              <div key={userId} className="bg-gray-100 p-4 rounded-lg">
                <p className="text-lg font-medium text-gray-800">{user?.name}</p>
                <p className="text-gray-600">{answer}</p>
                <p className="text-sm text-gray-500 mt-2">Score: {user?.score}</p>
              </div>
            );
          })}
        </div>
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
