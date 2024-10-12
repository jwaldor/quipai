import React, { useContext, useState, useEffect, useRef } from "react";
import { socket } from "../routes/socket";
import { AccessContext } from "../helpers/StateProvider";
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode'


function ShareButton({ title, text, url }: { title: string, text: string, url: string }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      console.log('Web Share API not supported');
    }
  };

  return (
    <button 
      className="flex items-center justify-center px-4 py-2 bg-gray-200 rounded-full text-blue-500 font-semibold text-sm"
      onClick={handleShare}
    >
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
      </svg>
      Share Join Link
    </button>
  );
}


const JoinGameRoom: React.FC = () => {
  const {gamename} = useParams();
  const qrRef = useRef<HTMLCanvasElement>(null);

  console.log("URL params:", gamename);

  const [gameName, setGameName] = useState("");
  const [userName, setUserName] = useState("");
  const [newGameName, setNewGameName] = useState("");
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [gameCreated, setGameCreated] = useState(false);
  const [autoName,setAutoName] = useState<string | undefined>(undefined);
  const [createlocation, setCreateLocation] = useState<{latitude: number, longitude: number} | undefined>(undefined);
  const [nearbygameslocation, setNearbyGamesLocation] = useState<{latitude: number, longitude: number} | undefined>(undefined);
  const { gamestate } = useContext(AccessContext);

  useEffect(() => {
    
    if (gamename) {
      setGameName(gamename);
      // const canvas = document.getElementById('qrCanvas')

    }
  }, []);

  useEffect(() => {
    console.log("qrRef",qrRef.current);
    if (qrRef.current) {
     console.log("qrRef not null",qrRef.current);
   QRCode.toCanvas(qrRef.current, `https://quipai.onrender.com/${autoName}`, (error) => {
     if (error) console.error('Error generating QR code', error);
   });
 }},[autoName])

  console.log("gamestate", gamestate);
  // const { gamestate } = useContext(AccessContext);

  function getUserLocation(): Promise<{latitude: number, longitude: number}> {
    console.log("Getting location function");
    return new Promise((resolve, reject) => {
      if ("geolocation" in navigator) {
        console.log("Geolocation is supported");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Position:", position);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            alert("Failed to get location: " + error.message);
            reject(error);
          }
        );
      } else {
        alert("Geolocation is not supported by your browser");
        reject(new Error("Geolocation not supported"));
      }
    });
  }
  
  function handleCheckCreateLocation() {
    if (!createlocation) {
      console.log("Getting location");
      getUserLocation().then((location) => {
        setCreateLocation(location);
        console.log("Location:", location);
      }).catch((error) => {
        console.error("Error getting location:", error);
      });
    }
    else {
      setCreateLocation(undefined);
    }
  }

    
  function handleCheckNearbyGamesLocation() {
    if (!nearbygameslocation) {
      console.log("Getting location");
      getUserLocation().then((location) => {
        setNearbyGamesLocation(location);
        console.log("Location:", location);
      }).catch((error) => {
        console.error("Error getting location:", error);
      });
    }
    else {
      setNearbyGamesLocation(undefined);
    }
  }
  

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
    socket.emit("autocreategame", createlocation, (gamename: string) => {
      if (gamename) {
        setGameCreated(true); // Show success message
        setAutoName(gamename);
        setGameName(gamename);
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
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4 mt-3">
          Join a Game Room
        </h2>
        <form onSubmit={handleJoinGame} className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span>Room Name</span>
            <div className="flex items-center">
              <input type="checkbox" id="seeNearbyGames" className="mr-2"
              onClick={handleCheckNearbyGamesLocation}
              checked={!!nearbygameslocation}
              />
              <label htmlFor="seeNearbyGames" className="text-sm">See nearby games</label>
            </div>
          </div>
          
          <div>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder=""
              className="w-full px-4 py-2 rounded-full border-2 border-yellow-700 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-2 mt-1">Your Name</div>
          <div>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder=""
              className="w-full px-4 py-2 rounded-full border-2 border-blue-300 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Join Game
            </button>
          </div>
        </form>
        <hr className="my-8 border-gray-300" />
        {/* <div className="text-center">
          <button
            onClick={() => setShowCreateGame(!showCreateGame)}
            className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            {showCreateGame ? "Hide Create Game Room" : "Create Game Room"}
          </button>
        </div> */}
        {(
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
              <div className="flex flex-col items-center">
                <button
                  type="submit"
                  className="w-[75%] bg-green-500 text-white px-3 py-1.5 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 mb-2"
                >
                  Create Game
                </button>
                <div className="flex items-center"  title="Include location in game so that nearby players can find it">
                  <input
                    type="checkbox"
                    id="includeLocation"
                    className="form-checkbox h-5 w-5 text-green-600 mr-2"
                    onClick={handleCheckCreateLocation}
                    checked={!!createlocation}
                    // title="Include location in game so that nearby players can find it"
                  />
                  <label 
                    htmlFor="includeLocation" 
                    className="text-sm text-gray-700 cursor-pointer"
                    // title="Include location in game so that nearby players can find it"
                  >
                    Include location to connect with nearby players
                  </label>
                </div>
              </div>
            </form>
            
              <p className="text-green-500 text-center h-3">{!autoName && gameCreated && <span>Game created!</span>}</p>
              
              <p className="text-green-500 text-center h-3">{autoName && gameCreated && <span>Game created: {autoName} </span>}</p>
              {autoName && gameCreated && <p className="text-gray-600 text-center mt-2">You can now join this game room & share the name with your friends!

                <div className="mt-2 flex justify-center"><ShareButton title="Join my game room" text="Click to play!" url={`https://quipai.onrender.com/${autoName}`} /></div>

                </p>}
          {autoName && gameCreated && (
            <div  className="mt-4 text-center">
              <h3 className="text-lg font-semibold">Or share this QR code:</h3>
              <canvas ref={qrRef} className="mx-auto"></canvas>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default JoinGameRoom;
