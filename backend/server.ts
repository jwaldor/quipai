// src/index.js
import client from "client";
import cors from "cors";
import express, { Express, Request, Response } from "express";
import { Server } from "socket.io";

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
  topic_state: { topic: string } | undefined;
  elapsed_rounds: number;
  count_time: number | undefined;
  users: Array<{ name: string; score: number; id: string }>;
  last_winner: string | undefined;
};

const gamestate: GameStateType = {
  mode: "start",
  ask_state: undefined,
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

function broadcastStates() {
  // io.to(socketId).emit(/* ... */);
  io.emit("gamestate", gamestate);
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
  return "ai_generated_prompt";
}

function judgeAnswers() {
  //evaluate best answer using GPT
  //append to winner's score
  return;
}

//erases stuff from last round that could interfere
function clearPalette() {
  gamestate.last_winner = undefined;
  if (gamestate.ask_state) {
    gamestate.ask_state.answers = new Map();
  }
}

io.on("connection", (socket) => {
  console.log("connecton started");
  //all of the users have arrived and they decide to start the game
  socket.on("adduser", (name) => {
    console.log("adding user");
    gamestate.users.push({ name: name, score: 0, id: socket.id });
  });
  socket.on("begingame", () => {
    console.log("beginning game");
    gamestate.mode = "topic";
  });
  //someone chooses a topic
  socket.on("settopic", (msg) => {
    clearPalette();
    console.log('get settopic', msg)
    gamestate.topic_state = { topic: msg };
    gamestate.ask_state = { prompt: generatePrompt(msg), answers: new Map() };
    gamestate.mode = "ask";
    gamestate.count_time = ASK_TIME_LIMIT;
  });
  //someone answers a question
  socket.on("answerquestion", (msg) => {
    if (gamestate.ask_state) {
      gamestate.ask_state.answers.set(socket.id, msg);
      if (gamestate.ask_state.answers.size === gamestate.users.length) {
        gamestate.mode = "results";
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
