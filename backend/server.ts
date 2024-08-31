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

const MAX_ROUNDS = 3;
const START_TIME_LIMIT = 30;
const ASK_TIME_LIMIT = 60;

type GameStateType = {
  mode: "start" | "topic" | "ask" | "results" | "end";
  ask_state: { prompt: string; answers: Map<string, string> } | undefined;
  topic_state: { topic: string } | undefined;
  elapsed_rounds: number;
  count_time: number | undefined;
  users: Array<{ name: string; score: number }>;
};

const gamestate: GameStateType = {
  mode: "start",
  ask_state: undefined,
  topic_state: undefined,
  users: [],
  count_time: undefined,
  elapsed_rounds: 0,
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
}

setInterval(() => broadcastStates(), 1000);

// let socketRoomMap = new Map();

function generatePrompt(topic: string) {
  return "ai_generated_prompt";
}

io.on("connection", (socket) => {
  //all of the users have arrived and they decide to start the game
  socket.on("adduser", (name) => {
    gamestate.users.push({ name: name, score: 0 });
  });
  socket.on("begingame", () => {
    gamestate.mode = "topic";
  });
  //someone chooses a topic
  socket.on("settopic", (msg) => {
    gamestate.topic_state = { topic: msg };
    gamestate.ask_state = { prompt: generatePrompt(msg), answers: new Map() };
  });

  socket.on("answerquestion", (msg) => {
    gamestate.topic_state = { topic: msg };
  });
  socket.on("adduser", (user) => {
    CacheService.addName(user, socket.id);
    io.emit("newuser", CacheService.listUsers());
  });
  socket.on("moveup", () => {
    console.log("moveup: " + socket.id);
    CacheService.updateStateMove("up", socket.id, socketRoomMap.get(socket.id));
  });
  socket.on("movedown", () => {
    console.log("movedown: " + socket.id);
    CacheService.updateStateMove(
      "down",
      socket.id,
      socketRoomMap.get(socket.id)
    );
  });
  socket.on("movenone", () => {
    console.log("movenone: " + socket.id);
    CacheService.updateStateMove(
      "none",
      socket.id,
      socketRoomMap.get(socket.id)
    );
  });
  socket.on("startaroom", (roomName) => {
    CacheService.blankGame(roomName);
    console.log("room added");
    io.emit("gamelist", CacheService.listRooms());
  });

  // socket.on("leaveroom", )

  socket.on("joinroom", (roomName) => {
    console.log("cache", CacheService.viewGame());
    console.log("joining room", roomName);
    socket.join(roomName);
    socketRoomMap.set(socket.id, roomName);
    CacheService.addPlayerGame(roomName, socket.id);
  });
});
