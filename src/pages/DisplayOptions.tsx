// import { useState, useEffect, useRef } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import "../index.css";

// interface Sprite {
//   image: HTMLImageElement;
//   id: number;
// }

// const FunnySprites = ({ sprite_id }: { sprite_id: number }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [sprites, setSprites] = useState<Sprite[]>([]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     const spriteSize = 32;
//     const tempSprites: Sprite[] = [];

//     // Define a list of predefined colors
//     const colors = ["#FF5733", "#33FF57", "#3357FF", "#F333FF", "#FF3333"];

//     const drawSprite = (x: number, y: number, color: string) => {
//       ctx.fillStyle = color;
//       ctx.fillRect(x, y, spriteSize, spriteSize);

//       ctx.fillStyle = "#000";
//       ctx.beginPath();
//       ctx.arc(x + 8, y + 8, 4, 0, Math.PI * 2); // Left eye
//       ctx.arc(x + 24, y + 8, 4, 0, Math.PI * 2); // Right eye
//       ctx.fill();

//       ctx.strokeStyle = "#000";
//       ctx.beginPath();
//       ctx.arc(x + 16, y + 20, 8, 0, Math.PI, false); // Smile
//       ctx.stroke();
//     };

//     for (let i = 0; i < 5; i++) {
//       ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before each sprite is drawn
//       const x = 10;
//       const y = 10;

//       // Use a predefined color from the colors array based on the sprite's ID
//       const color = colors[i % colors.length];
//       drawSprite(x, y, color);

//       // Create an Image element for each sprite
//       const img = new Image();
//       img.src = canvas.toDataURL();

//       tempSprites.push({ image: img, id: i });
//     }

//     setSprites(tempSprites);
//   }, []);

//   return (
//     <div>
//       <canvas
//         ref={canvasRef}
//         width={50}
//         height={50}
//         style={{ display: "none" }}
//       />
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-around",
//         }}
//       >
//         {sprites
//           .filter((sprite) => sprite.id === sprite_id)
//           .map((sprite) => (
//             <img
//               key={sprite.id}
//               src={sprite.image.src}
//               alt={`Funny Sprite ${sprite.id}`}
//             />
//           ))}
//       </div>
//     </div>
//   );
// };

// function DisplayPrompt() {
//   const [count, setCount] = useState(0);

//   return (
//     <>
//       <div className="bg-gradient-to-br from-blue-600 to-cyan-400 h-screen flex  ">
//         <div className="mt-10 text-lg" style={{ color: "#fff" }}></div>
//         <br></br>
//         <div className="flex flex-row mt-36">
//           <FunnySprites sprite_id={1} /> <FunnySprites sprite_id={2} />
//         </div>

//         <div></div>
//       </div>
//     </>
//   );
// }

// export default DisplayPrompt;
