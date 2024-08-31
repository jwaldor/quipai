import { Server } from "http";
import { Game, getNextState, getInitialState } from "../managestate";

type PairedGame = {
  gameState: Game;
  players: [
    { name: string | undefined; orientation: "up" | "down" | "none" },
    { name: string | undefined; orientation: "up" | "down" | "none" }
  ];
};

type ServerCache = { ids: Array<String>; names: Array<String>; games: GameMap };

type GameMap = Map<String, PairedGame>;
let cache: ServerCache = { ids: [], names: [], games: new Map() };

const CacheService = {
  viewGame: function () {
    return structuredClone(cache);
  },
  deleteGame: function () {
    // cache.games.delete()
  },
  updateGames: function () {
    const updatedgames = new Map();
    cache.games.forEach((value, key) => {
      if (value.players[0].name && value.players[1].name) {
        // console.log(
        //   "updating state",
        //   value.players[0].name,
        //   value.players[1].name
        // );
        value.gameState = getNextState(
          value.gameState,
          value.players[0].orientation,
          value.players[1].orientation,
          "human"
        );
        updatedgames.set(key, value.gameState);
        // io.to(key).emit("test", "Hello " + p1 + p2);
      }
    });
    return updatedgames;
  },
  getId: function (name: string) {
    const foundId =
      cache.ids[
        cache.names.findIndex((value) => {
          console.log("valuename", value, name, value === name);
          return value === name;
        })
      ];
    console.log(cache.names, cache.ids);
    console.log(
      "nameids",
      name,
      cache.names.findIndex((value) => {
        console.log("valuename", value, name, value === name);
        return value === name;
      })
    );
    console.log(foundId);
    return foundId;
  },
  addName: function (name: string, id: string) {
    if (!cache.names.includes(name)) {
      cache.names.push(name);
      cache.ids.push(id);
      console.log(cache.names, cache.ids);
    } else {
      console.error("name already exists");
    }
  },

  blankGame: function (roomName: string) {
    cache.games.set(roomName, {
      gameState: getInitialState(),
      players: [
        { name: undefined, orientation: "none" },
        { name: undefined, orientation: "none" },
      ],
    });
    console.log(cache, "room added to cache");
  },
  addPlayerGame: function (roomName: string, playerId: string) {
    console.log("cachegames", cache.games);
    console.log("cachegamessomething", cache.games.get(roomName)!);
    // console.log("cachegamesplayer", cache.games.get(roomName)!.players);
    console.log("roomName", roomName);
    if (!cache.games.get(roomName)!.players[0].name) {
      cache.games.get(roomName)!.players[0].name = playerId;
    } else if (!cache.games.get(roomName)!.players[1].name) {
      cache.games.get(roomName)!.players[1].name = playerId;
    }
    console.log("added player", roomName, playerId, cache.games.get(roomName)!);
    // .set(roomName, {
    //   gameState: getInitialState(),
    //   players: [
    //     { name: undefined, orientation: "none" },
    //     { name: undefined, orientation: "none" },
    //   ],
    // });
    // console.log(cache, "room added to cache");
  },

  initializeGame: function (name1: string, name2: string, roomName: string) {
    cache.games.set(roomName, {
      gameState: getInitialState(),
      players: [
        { name: name1, orientation: "none" },
        { name: name2, orientation: "none" },
      ],
    });
  },

  updateStateMove: function (
    direction: "up" | "down" | "none",
    user: string,
    gameString: string
  ) {
    if (cache.games.has(gameString) && cache.games.get(gameString)) {
      console.log("cache.games.get(gameString)");
      console.log(cache.games.get(gameString));
      console.log(
        cache.games
          .get(gameString)!
          .players.find((player) => player.name == user)
      );
      cache.games
        .get(gameString)!
        .players.find((player) => player.name == user)!.orientation = direction;
      console.log("updating direction of a user", user, direction);
      // cache.games.get(gameString)!.players[userNum].orientation = direction;
    } else {
      console.error(gameString, "game not found");
    }
    // cache.games.
  },
  listUsers: function () {
    return cache.names;
  },
  listRooms: function () {
    console.log("cache.games", cache.games.keys());
    return Array.from(cache.games.keys());
  },
};

export default CacheService;
