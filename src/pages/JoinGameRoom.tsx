import React, { useContext, useState } from "react";
import { socket } from "../routes/socket";
import { AccessContext } from "../helpers/StateProvider";



const JoinGameRoom: React.FC = () => {
  const [gameName, setGameName] = useState("");
  const [userName, setUserName] = useState("");
  const [newGameName, setNewGameName] = useState("");
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [gameCreated, setGameCreated] = useState(false);
  const [autoName,setAutoName] = useState<string | undefined>(undefined);
  const { gamestate } = useContext(AccessContext);

  console.log("gamestate", gamestate);
  // const { gamestate } = useContext(AccessContext);

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Joining game with", { gameName, userName });
    socket.emit("addusergame", gameName, userName,(success: boolean) => {console.log("success",success)
      if (!success) {
        alert("Name already taken");
      }
    });
    // Logic for joining the game would go here
  };

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating game with", { newGameName });
    socket.emit("creategame", newGameName);
    setNewGameName(""); // Clear the input field
    setGameCreated(true); // Show success message
    setTimeout(() => setGameCreated(false), 3000); // Hide success message after 3 seconds
    // Logic for creating the game would go here
  };

  const handleAutoCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    socket.emit("autocreategame", (gamename: string) => {
      if (gamename) {
        setGameCreated(true); // Show success message
        setAutoName(gamename);
      }
      else {
        alert("Could not create game. Perhaps unique name could not be generated.");
      }
    });
  };
  console.log("autoName",autoName,!autoName);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Join a Game Room
        </h2>
        <form onSubmit={handleJoinGame} className="space-y-4 mb-8">
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
        <hr className="my-8 border-gray-300" />
        <div className="text-center">
          <button
            onClick={() => setShowCreateGame(!showCreateGame)}
            className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            {showCreateGame ? "Hide Create Game Room" : "Create Game Room"}
          </button>
        </div>
        {showCreateGame && (
          <>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
              Create a Game Room
            </h2>
            {/* <form onSubmit={handleCreateGame} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  placeholder="name"
                  className="w-full px-3 py-1.5 rounded-full border-2 border-green-700 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white px-3 py-1.5 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  Create Game
                </button>
              </div>
            </form> */}
            <form onSubmit={handleAutoCreateGame} className="space-y-4">
              <div>
                
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white px-3 py-1.5 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  Create Game auto
                </button>
              </div>
            </form>
              <p className="text-green-500 text-center mt-4 h-3">{!autoName && gameCreated && <span>Game created!</span>}</p>
              
              <p className="text-green-500 text-center mt-4 h-3">{autoName && gameCreated && <span>Game created: {autoName} </span>}</p>
              {autoName && gameCreated && <p className="text-gray-600 text-center mt-2">You can now join this game room & share the name with your friends!</p>}

          </>
        )}
      </div>
    </div>
  );
};

export default JoinGameRoom;

