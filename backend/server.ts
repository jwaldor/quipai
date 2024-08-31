// src/index.js
import client from "client";
import cors from "cors";
import express, { Express, Request, Response } from "express";
import CacheService from "services/gameStateServices";
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

const origins = [process.env.FRONTEND_ADDRESS as string];

const server = createServer(app);
const io = new Server({
  cors: {
    origin: origins,
  },
});
io.listen(4000);

// function broadcastStates() {
//   const newgames = CacheService.updateGames();
//   newgames.forEach((gameState, roomName) => {
//     // io.to(socketId).emit(/* ... */);
//     io.to(roomName).emit("newstate", gameState);
//     // console.log("io", roomName, gameState);
//     // console.log(io.in(roomName).fetchSockets());
//   });
// }

// setInterval(() => broadcastStates(), 50);

let socketRoomMap = new Map();

io.on("connection", (socket) => {
  io.emit("gamelist", CacheService.listRooms());
  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
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
