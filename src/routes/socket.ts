import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
// // const URL =
//   process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

console.log(import.meta.env.VITE_BACKEND_ADDRESS)
export const socket = io(import.meta.env.VITE_BACKEND_ADDRESS as string);
