// src/index.js
import { Server, Socket } from "socket.io"; // Update this import
import cors from "cors";
import express, { Express, Request, Response } from "express";
import { createServer } from "http";
import { randomBytes } from "crypto";

// import { prompt_quip, get_winner } from "usegpt";

const app: Express = express();
// const { createServer } = require("node:http");
const port = Number(process.env.PORT) || 4000;
console.log("port", port);

// const jwt = require("express-jwt");

let bodyParser = require("body-parser");
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

const MAX_ROUNDS = 4;
const START_TIME_LIMIT = 30;
const ASK_TIME_LIMIT = 60;
const RESULTS_TIME_LIMIT = 40;

function generateStrangeWord(): string {
  const prefixes = [
    "cyber",
    "quantum",
    "neo",
    "hyper",
    "astro",
    "mega",
    "ultra",
    "omni",
    "retro",
    "crypto",
  ];
  const roots = [
    "punk",
    "flux",
    "nova",
    "nexus",
    "quark",
    "zephyr",
    "vortex",
    "synth",
    "pulse",
    "nebula",
  ];
  const suffixes = [
    "oid",
    "tron",
    "scape",
    "verse",
    "matic",
    "core",
    "sphere",
    "naut",
    "mancer",
    "forge",
  ];

  const usePrefix = Math.random() < 0.5;
  const useSuffix = !usePrefix;

  let word = roots[Math.floor(Math.random() * roots.length)];

  if (usePrefix) {
    word = prefixes[Math.floor(Math.random() * prefixes.length)] + word;
  }

  if (useSuffix) {
    word += suffixes[Math.floor(Math.random() * suffixes.length)];
  }

  // Capitalize the first letter
  word = word.charAt(0).toUpperCase() + word.slice(1);

  // Add a random number (0-999) to ensure uniqueness
  const randomNum = parseInt(randomBytes(2).toString("hex"), 16) % 100;
  return `${word}${randomNum.toString().padStart(2, "0")}`;
}

export type GameStateType = {
  mode: "start" | "topic" | "ask" | "results" | "end";
  ask_state: { prompt: string; answers: Map<string, string> } | undefined;
  answers: Array<{ text: string; user_id: string }>;
  topic_state: { topic: string } | undefined;
  remaining_rounds: number;
  count_time: number | undefined;
  users: Array<{
    name: string;
    score: number;
    id: string;
    disconnection_time: number | undefined;
  }>;
  last_winner: string | undefined;
  empty_time: number | undefined;
};

const origins = [process.env.FRONTEND_ADDRESS as string];
console.log("origins", origins);

// const server = createServer((req: any, res: any) => {
//   res.statusCode = 200;
//   res.setHeader("Content-Type", "text/plain");
//   res.end("Hello World\n");
// });

// const server2 = server.listen(port, "0.0.0.0", () => {
//   console.log("server listening on port", port);
// });
console.log(origins, "origins");

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: origins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000, // Increase ping timeout to 60 seconds
  pingInterval: 25000, // Ping every 25 seconds
  transports: ["websocket", "polling"], // Enable both WebSocket and polling
});
// io.listen(port);
// Extend the Socket type to include gamestate
declare module "socket.io" {
  interface Socket {
    gamestate?: { name: string; gamestate: GameStateType };
  }
}

// Function to check if a specific socket ID is connected
function isUserConnected(socketId: string) {
  const socket = io.sockets.sockets.get(socketId);
  return socket ? socket.connected : false;
}

function getNearbyGames(location: { latitude: number; longitude: number }) {
  return gamestates
    .filter(
      (game) =>
        game.location &&
        6371000 *
          Math.acos(
            Math.cos((location.latitude * Math.PI) / 180) *
              Math.cos((game.location.latitude * Math.PI) / 180) *
              Math.cos(
                ((game.location.longitude - location.longitude) * Math.PI) / 180
              ) +
              Math.sin((location.latitude * Math.PI) / 180) *
                Math.sin((game.location.latitude * Math.PI) / 180)
          ) <=
          1609.34 // 1 mile in meters
    )
    .map((game) => game.name);
}

function broadcastStates() {
  // io.to(socketId).emit(/* ... */);
  gamestates.forEach((state) => {
    state.gamestate.users.forEach((user) => {
      io.to(user.id).emit("gamestate", state.gamestate);
      if (!isUserConnected(user.id) && !user.disconnection_time) {
        console.log("user", user.id, "not connected");
        user.disconnection_time = Date.now();
      } else if (!isUserConnected(user.id) && user.disconnection_time) {
        if (Date.now() - user.disconnection_time > 100000) {
          console.log("removing user", user.id);
          state.gamestate.users = state.gamestate.users.filter(
            (u) => u.id !== user.id
          );
        }
      }
    });
    if (state.gamestate.users.length === 0 && !state.gamestate.empty_time) {
      state.gamestate.empty_time = Date.now();
    } else if (
      state.gamestate.users.length === 0 &&
      state.gamestate.empty_time &&
      Date.now() - state.gamestate.empty_time > 100000
    ) {
      console.log("removing game", state.name);
      const index = gamestates.findIndex((g) => g.name === state.name);
      if (index !== -1) gamestates.splice(index, 1);
    } else if (state.gamestate.empty_time && state.gamestate.users.length > 0) {
      console.log("resetting empty time for", state.name);
      state.gamestate.empty_time = undefined;
    }

    // io.emit("gamestate", gamestate);

    if (state.gamestate.mode === "results") {
      // console.log("gamestate", state.gamestate);
    }
    // console.log("io", roomName, gameState);
    // console.log(io.in(roomName).fetchSockets());
    if (state.gamestate.count_time && state.gamestate.count_time > 0) {
      console.log("count_time", state.gamestate.count_time);
      state.gamestate.count_time--;
    }
    if (state.gamestate.mode === "ask" && state.gamestate.count_time === 0) {
      transitionResults(state.gamestate);
    }
  });
}

function broadcastState(state: GameStateType) {
  state.users.forEach((user) => {
    io.to(user.id).emit("gamestate", state);
  });
}

setInterval(() => broadcastStates(), 1000);

// let socketRoomMap = new Map();

//erases stuff from last round that could interfere
function clearPalette(state: GameStateType) {
  state.last_winner = undefined;
  state.answers = [];
  if (state.ask_state) {
    state.ask_state.answers = new Map();
  }
}

export const gamestates: Array<{
  name: string;
  gamestate: GameStateType;
  location: { latitude: number; longitude: number } | undefined;
}> = [];
console.log("gamestates", gamestates);

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
function transitionResults(state: GameStateType) {
  state.mode = "results";
  console.log("judging answers");
  if (state.ask_state) {
    // console.log("answers",gamestate.ask_state.answers)
    get_winner(state.ask_state?.answers, state.ask_state?.prompt).then(
      (res) => {
        console.log("judgment", res);
        state.last_winner = res;
        state.users.forEach((user) => {
          if (user.id === state.last_winner) {
            user.score += 1;
          }
        });
      }
    );
  }
  state.count_time = RESULTS_TIME_LIMIT;
}

io.on("connection", (socket) => {
  console.log("Client connected!", socket.id);
  function generatePrompt(topic: string) {
    console.log("topic", socket.gamestate!.gamestate.topic_state?.topic);
    if (socket.gamestate!.gamestate.topic_state) {
      return prompt_quip(socket.gamestate!.gamestate.topic_state.topic).then(
        (res) => {
          return res;
        }
      );
    }
    return "No prompt generated";
  }

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
  // socket.on("creategame", (gamename) => {
  //   console.log("creating game");
  //   gamestates.push({
  //     name: gamename.toLowerCase(),
  //     gamestate: {
  //       mode: "start",
  //       ask_state: undefined,
  //       answers: [],
  //       topic_state: undefined,
  //       users: [],
  //       count_time: undefined,
  //       remaining_rounds: 4,
  //       last_winner: undefined,
  //       empty_time: undefined,
  //     },
  //   });
  // });
  socket.on("getnearbygames", (location, callback) => {
    callback(getNearbyGames(location));
  });
  socket.on("autocreategame", (location, callback) => {
    console.log("creating game");
    let gamename: string | undefined = generateStrangeWord().toLowerCase();
    let tries = 0;
    while (gamestates.find((game) => game.name === gamename) && tries < 5) {
      gamename = generateStrangeWord();
      tries++;
    }
    if (tries >= 5) {
      console.error("could not generate unique gamename");
      gamename = undefined;
    } else {
      console.log("created game", gamename);
      gamestates.push({
        name: gamename.toLowerCase(),
        location: location,
        gamestate: {
          mode: "start",
          ask_state: undefined,
          answers: [],
          topic_state: undefined,
          users: [],
          count_time: undefined,
          remaining_rounds: 4,
          last_winner: undefined,
          empty_time: undefined,
        },
      });
    }
    callback(gamename);
  });
  socket.on("addusergame", (gamename, name, callback) => {
    console.log("adding user");
    console.log("games", gamestates);
    const thegame = gamestates.find(
      (game) => game.name === gamename.toLowerCase()
    );
    if (thegame) {
      if (!thegame.gamestate.users.find((user) => user.name === name)) {
        thegame.gamestate.users.push({
          name: name,
          score: 0,
          id: socket.id,
          disconnection_time: undefined,
        });
        console.log("new gamestates", gamestates);
        broadcastState(thegame.gamestate);
        callback(true);
      } else {
        callback(false);
      }
    } else {
      console.error("error, game not found");
    }
  });
  socket.on("test", () => {
    console.log("socket", socket.gamestate, "socket.gamestate");
  });

  // socket.on("adduser", (name) => {
  //   console.log("adding user");
  //   gamestate.users.push({ name: name, score: 0, id: socket.id });
  // });
  socket.on("begingame", () => {
    console.log("beginning game");
    socket.gamestate!.gamestate.remaining_rounds--;
    if (socket.gamestate!.gamestate.remaining_rounds === -1) {
      socket.gamestate!.gamestate.mode = "end";
    } else {
      socket.gamestate!.gamestate.mode = "topic";
    }
    broadcastState(socket.gamestate!.gamestate);
  });
  socket.on("beginnewgame", () => {
    console.log("beginning new game");
    socket.gamestate!.gamestate = {
      ...socket.gamestate!.gamestate,
      users: socket.gamestate!.gamestate.users.map((user) => ({
        id: user.id,
        name: user.name,
        score: 0,
        disconnection_time: undefined,
      })),
      mode: "topic",
      ask_state: undefined,
      answers: [],
      topic_state: undefined,
      count_time: undefined,
      remaining_rounds: 4,
    };
    socket.gamestate!.gamestate.mode = "topic";
    // socket.gamestate!.gamestate.elapsed_rounds++
    // if (socket.gamestate!.gamestate.elapsed_rounds >= MAX_ROUNDS){
    //   socket.gamestate!.gamestate.mode = "end";
    //   socket.gamestate!.gamestate.elapsed_rounds = -1
    // }
    // else {
    //   socket.gamestate!.gamestate.mode = "topic";
    // }
    broadcastState(socket.gamestate!.gamestate);
  });
  //someone chooses a topic
  socket.on("settopic", async (msg) => {
    clearPalette(socket.gamestate!.gamestate);
    console.log("get settopic", msg);
    socket.gamestate!.gamestate.topic_state = { topic: msg };
    socket.gamestate!.gamestate.ask_state = {
      prompt: (await generatePrompt(msg)) || "Failed to generate or something",
      answers: new Map(),
    };
    socket.gamestate!.gamestate.mode = "ask";
    socket.gamestate!.gamestate.count_time = ASK_TIME_LIMIT;
    broadcastState(socket.gamestate!.gamestate);
  });
  //someone answers a question
  socket.on("answerquestion", (msg) => {
    console.log("msg", msg);
    if (socket.gamestate!.gamestate.ask_state) {
      console.log("setting answer");
      socket.gamestate!.gamestate.ask_state.answers.set(socket.id, msg);
      socket.gamestate!.gamestate.answers.push({
        text: msg,
        user_id: socket.id,
      });
      if (
        socket.gamestate!.gamestate.ask_state.answers.size ===
        socket.gamestate!.gamestate.users.length
      ) {
        transitionResults(socket.gamestate!.gamestate);
      }
    } else {
      console.error(
        "trying to answer question when we're not in question answering state"
      );
    }
    broadcastState(socket.gamestate!.gamestate);
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

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

export async function prompt_quip(topic: string) {
  console.log("topic_prompt", topic);
  console.log(
    "quip prompt: ",
    `Generate a random funny Quiplash prompt for this topic: ${JSON.stringify(
      topic
    )} \n Examples of other Quiplash prompts:\n The worst theme for a pinball machine.\nWhat should be dumped on the losing coach at the end of a football game.`
  );
  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Generate a random funny Quiplash prompt for this topic: ${JSON.stringify(
          topic
        )} \n Examples of other Quiplash prompts:\n The worst theme for a pinball machine.\nWhat should be dumped on the losing coach at the end of a football game.`,
      },
    ],
    model: "gpt-4o-mini",
  });
  console.log("gpt prompt return", chatCompletion.choices[0].message.content);
  return chatCompletion.choices[0].message.content;
}

export async function get_winner(answers: Map<string, string>, prompt: string) {
  console.log(
    "provided_answers",
    answers,
    JSON.stringify(Object.fromEntries(answers))
  );
  console.log(
    "initial_prompt",
    `When users were given the prompt "${prompt}", they gave the answers below. Output the key associated with the best answer in triple backticks (\`\`\`) so that it can be parsed by regex. \n ${JSON.stringify(
      Object.fromEntries(answers)
    )}`
  );
  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `When users were given the prompt "${prompt}", they gave the answers below. Output the key associated with the best answer in triple backticks (\`\`\`) so that it can be parsed by regex. \n ${JSON.stringify(
          Object.fromEntries(answers)
        )}`,
      },
    ],
    model: "gpt-4o-mini",
  });
  // Extract the content between triple backticks using regex
  const pre_output = chatCompletion.choices[0].message.content;
  console.log("pre_output", pre_output);
  const output = pre_output === null ? "" : pre_output;
  console.log("output", output);
  const match = output.match(/```([\s\S]*?)```/);
  console.log("match", match);

  if (match) {
    const extractedContent = match[1].trim();
    console.log("Extracted content:", extractedContent);
    // Do something with the extracted content, like parsing it as JSON or further processing
    return extractedContent;
  } else {
    console.log("No content found within triple backticks.");
    return;
  }
}

server.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
