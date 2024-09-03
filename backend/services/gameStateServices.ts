import { gamestates } from "server"

const gameStateServices = () => {
  return {
    createGame: (name:string) => {gamestates.push({name:name,gamestate:{
      mode: "start",
      ask_state: undefined,
      answers: [],
      topic_state: undefined,
      users: [],
      count_time: undefined,
      elapsed_rounds: 0,
      last_winner: undefined,
    }})}
  }
}