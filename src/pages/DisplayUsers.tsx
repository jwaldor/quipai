import { useState, useEffect, useRef } from "react";

import "../index.css";

interface Sprite {
  image: HTMLImageElement;
  id: number;
}

export interface User {
  name: string;
  sprite_id: number;
  score: number;
}

export const FunnySprites = ({
  sprite_id,
  name,
  score,
  empty,
}: {
  sprite_id: number;
  name: string;
  score?: number;
  empty?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sprites, setSprites] = useState<Sprite[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const spriteSize = 32;
    const tempSprites: Sprite[] = [];

    // Define a list of predefined colors
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#FFA07A",
      "#7FDBFF",
      "#FFD700",
      "#9B59B6",
      "#2ECC71",
      "#FF69B4",
    ];

    const drawSprite = (x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, spriteSize, spriteSize);

      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(x + 8, y + 8, 4, 0, Math.PI * 2); // Left eye
      ctx.arc(x + 24, y + 8, 4, 0, Math.PI * 2); // Right eye
      ctx.fill();

      ctx.strokeStyle = "#000";
      ctx.beginPath();
      ctx.arc(x + 16, y + 20, 8, 0, Math.PI, false); // Smile
      ctx.stroke();
    };

    for (let i = 0; i < 5; i++) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before each sprite is drawn
      const x = 10;
      const y = 10;

      // Use a predefined color from the colors array based on the sprite's ID
      const color = colors[i % colors.length];
      drawSprite(x, y, empty ? "#808080" : color);

      // Create an Image element for each sprite
      const img = new Image();
      img.src = canvas.toDataURL();

      tempSprites.push({ image: img, id: i });
    }

    setSprites(tempSprites);
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={50}
        height={50}
        style={{ display: "none" }}
      />
      <div
        className="flex flex-col items-center"
        style={{
          marginTop: 20,
        }}
      >
        {sprites
          .filter((sprite) => sprite.id === sprite_id)
          .map((sprite) => (
            <img
              key={sprite.id}
              src={sprite.image.src}
              alt={`Funny Sprite ${sprite.id}`}
            />
          ))}
        <div className="text-xs">{name}</div>
        {score && <div className="text-xs">{score}</div>}
      </div>
    </div>
  );
};

export function DisplayUsers() {
  const [users, setUsers] = useState<User[]>([]);

  return (
    <>
      <div className="bg-gradient-to-br from-blue-600 to-cyan-400 h-screen flex ">
        <div className="mt-10 ml-10 text-lg" style={{ color: "#fff" }}></div>
        <br></br>
        <div className="flex flex-row ml-36 mt-96 scale-[2]">
          {users.map((user, idx) => (
            <FunnySprites
              sprite_id={idx % 5}
              name={user.name}
              score={user.score}
            />
          ))}
        </div>

        <div></div>
      </div>
    </>
  );
}
