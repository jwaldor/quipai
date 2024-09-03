// src/index.js
import client from "client";
import { Server, Socket } from "socket.io"; // Update this import
import cors from "cors";
import express, { Express, Request, Response } from "express";
import { prompt_quip, get_winner } from "usegpt";

const app: Express = express();
const { createServer } = require("node:http");
const port = process.env.PORT || 3000;

// const jwt = require("express-jwt");

let bodyParser = require("body-parser");
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(cors());

const MAX_ROUNDS = 8;
const START_TIME_LIMIT = 30;
const ASK_TIME_LIMIT = 60;
const RESULTS_TIME_LIMIT = 40;

export type GameStateType = {
  mode: "start" | "topic" | "ask" | "results" | "end";
  ask_state: { prompt: string; answers: Map<string, string> } | undefined;
  answers : Array<{text:string,user_id:string}>
  topic_state: { topic: string } | undefined;
  elapsed_rounds: number;
  count_time: number | undefined;
  users: Array<{ name: string; score: number; id: string }>;
  last_winner: string | undefined;
};

const gamestate: GameStateType = {
  mode: "start",
  ask_state: undefined,
  answers: [],
  topic_state: undefined,
  users: [],
  count_time: undefined,
  elapsed_rounds: 0,
  last_winner: undefined,
};

const origins = [process.env.FRONTEND_ADDRESS as string];

const server = createServer(app);
const io = new Server({
  cors: {
    origin: origins,
  },
});
io.listen(4000);

// Extend the Socket type to include gamestate
declare module "socket.io" {
  interface Socket {
    gamestate?: { name: string; gamestate: GameStateType };
  }
}

function broadcastStates() {
  // io.to(socketId).emit(/* ... */);
  gamestates.forEach((state) => state.gamestate.users.forEach((user) => {
    io.to(user.id).emit("gamestate",state.gamestate)
  }))
  // io.emit("gamestate", gamestate);
  if (gamestate.mode === "results"){
    console.log("gamestate",gamestate)

  }
  // console.log("io", roomName, gameState);
  // console.log(io.in(roomName).fetchSockets());
  if (gamestate.count_time && gamestate.count_time > 0) {
    gamestate.count_time--;
  }
  if (gamestate.mode === "ask" && gamestate.count_time === 0) {
    gamestate.mode = "results";
  }
}

setInterval(() => broadcastStates(), 1000);

// let socketRoomMap = new Map();

function generatePrompt(topic: string) {
  console.log("topic", gamestate.topic_state?.topic);
  if (gamestate.topic_state) {
    return prompt_quip(gamestate.topic_state.topic).then((res) => {
      console.log("res", res);
      return res;
    });
  }
  return "No prompt generated";
}

function judgeAnswers() {
  if (gamestate.ask_state) {
    // console.log("answers",gamestate.ask_state.answers)
    get_winner(gamestate.ask_state?.answers, gamestate.ask_state?.prompt).then(
      (res) => {
        gamestate.last_winner = res;
        gamestate.users.forEach((user) => {
          if (user.id === gamestate.last_winner) {
            user.score += 1;
          }
        });
      }
    );
  }
}

//erases stuff from last round that could interfere
function clearPalette() {
  gamestate.last_winner = undefined;
  gamestate.answers=[]
  if (gamestate.ask_state) {
    gamestate.ask_state.answers = new Map();
  }
}

export const gamestates: Array<{name:string,gamestate:GameStateType}> = []

// declare module 'socket.io' {
//   interface Socket {
//     user?: { id: string; name: string };
//     roomId?: string;
//     someOtherData?: { foo: string };
//   }
// }

// function assignMiddle(socket: Socket, next) { // Use the correct Socket type
//   console.log("middleware called");
//   socket.gamestate = gamestates.find((g) => 
//     g.gamestate.users.find((u) => u.id === socket.id)
//   );
//   console.log("gamestatemiddle", gamestates, gamestates.find((g) => 
//     g.gamestate.users.find((u) => u.id === socket.id)
//   ));
//   console.log("socket.gamestate middle", socket.gamestate);
//   next();
// }


// io.on("new_namespace", (namespace) => {
//   namespace.use(assignMiddle);
// });

io.on("connection", (socket) => {
  console.log("connecton started");
  // socket.use(assignMiddle)
  socket.use((packet, next) => {
    console.log("middleware called");
    socket.gamestate = gamestates.find((g) =>
      g.gamestate.users.find((u) => u.id === socket.id)
    );
    console.log("gamestatemiddle", gamestates, socket.gamestate);
    next();
  });
  socket.on("creategame", (gamename) => {
    console.log('creating game')
    gamestates.push({name:gamename,gamestate:{
      mode: "start",
      ask_state: undefined,
      answers: [],
      topic_state: undefined,
      users: [],
      count_time: undefined,
      elapsed_rounds: 0,
      last_winner: undefined,
    }})
  })
  socket.on("addusergame", (gamename,name) => {
    console.log("adding user");
    console.log("games",gamestates)
    const thegame = gamestates.find((game) => game.name===gamename)
    if (thegame){
      thegame.gamestate.users.push({name:name,score:0,id:socket.id});
      console.log("new gamestates",gamestates)
    }
    else{
      console.error("error, game not found")
    }
  });
  socket.on("test",()=>{console.log("socket",socket.gamestate,"socket.gamestate")})

  socket.on("adduser", (name) => {
    console.log("adding user");
    gamestate.users.push({ name: name, score: 0, id: socket.id });
  });
  socket.on("begingame", () => {
    console.log("beginning game");
    gamestate.mode = "topic";
  });
  //someone chooses a topic
  socket.on("settopic", async (msg) => {
    clearPalette();
    console.log("get settopic", msg);
    gamestate.topic_state = { topic: msg };
    gamestate.ask_state = {
      prompt: (await generatePrompt(msg)) || "Failed to generate or something",
      answers: new Map(),
    };
    gamestate.mode = "ask";
    gamestate.count_time = ASK_TIME_LIMIT;
  });
  //someone answers a question
  socket.on("answerquestion", (msg) => {
    console.log("msg", msg);
    if (gamestate.ask_state) {
      console.log("setting answer");
      gamestate.ask_state.answers.set(socket.id, msg);
      gamestate.answers.push({text:msg,user_id:socket.id})
      if (gamestate.ask_state.answers.size === gamestate.users.length) {
        gamestate.mode = "results";
        console.log("judging answers");
        judgeAnswers();
        gamestate.count_time = RESULTS_TIME_LIMIT;
      }
    } else {
      console.error(
        "trying to answer question when we're not in question answering state"
      );
    }
  });
  // socket.on("adduser", (user) => {
  //   CacheService.addName(user, socket.id);
  //   io.emit("newuser", CacheService.listUsers());
  // });
  // socket.on("moveup", () => {
  //   console.log("moveup: " + socket.id);
  //   CacheService.updateStateMove("up", socket.id, socketRoomMap.get(socket.id));
  // });
  // socket.on("movedown", () => {
  //   console.log("movedown: " + socket.id);
  //   CacheService.updateStateMove(
  //     "down",
  //     socket.id,
  //     socketRoomMap.get(socket.id)
  //   );
  // });
  // socket.on("movenone", () => {
  //   console.log("movenone: " + socket.id);
  //   CacheService.updateStateMove(
  //     "none",
  //     socket.id,
  //     socketRoomMap.get(socket.id)
  //   );
  // });
  // socket.on("startaroom", (roomName) => {
  //   CacheService.blankGame(roomName);
  //   console.log("room added");
  //   io.emit("gamelist", CacheService.listRooms());
  // });

  // // socket.on("leaveroom", )

  // socket.on("joinroom", (roomName) => {
  //   console.log("cache", CacheService.viewGame());
  //   console.log("joining room", roomName);
  //   socket.join(roomName);
  //   socketRoomMap.set(socket.id, roomName);
  //   CacheService.addPlayerGame(roomName, socket.id);
  // });
});
