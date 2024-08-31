// type Game = { cells: Cells; going: "x" | "o" };
// type Move = "" | "x" | "o";
// type Cells = [Move, Move, Move, Move, Move, Move, Move, Move, Move]; //9
// type EndState = {over: boolean, winner: "x" | "o" | "draw"}

// const initialGame: Game = { cells: Array(9).fill("") as Cells };

// const makeMove = (cellnumber: number, state: Game): Game | undefined => {
//   const newState = structuredClone(state);
//   if (newState.cells[cellnumber] !== "") {
//     console.error("can't do that");
//     return;
//   } else {
//     newState.cells[cellnumber] = newState.going;
//     return newState;
//   }
// };

// const calculateGameStatus = (state:Game): EndState => {

// }

export type BallCoords = {
  ycoord: number;
  xcoord: number;
  xvelocity: number;
  yvelocity: number;
};

export type Coords = {
  player1: number;
  player2: number;
  ball: BallCoords;
};
export type Score = { player1: number; player2: number };

export type Game = {
  coords: Coords;
  score: Score;
  started: boolean;
  AI: boolean;
};

export type BoxCoords = {
  xlcoord: number;
  ybcoord: number;
};

const STEP_SIZE = 5;
export const SPEED = 50;

export const PADDLE_WIDTH = 8;
export const PADDLE_HEIGHT = 45;
export const PADDLE_LEFT = 10;
export const PADDLE_RIGHT = 10;
export const BALL_SIZE = 10;

export const BALL_START_X = 300;
export const BALL_START_Y = 300;

const page_width = 448;
const page_height = 581;

export function testFunction() {}

export function getInitialState() {
  return {
    coords: {
      player1: 200,
      player2: 200,
      ball: {
        ycoord: 200,
        xcoord: 150,
        xvelocity: 4,
        yvelocity: 4,
      },
    },
    score: { player1: 0, player2: 0 },
    started: false,
    AI: false,
  };
}

type Orientation = "up" | "down" | "none";

let callCount = 0;

export function getNextState(
  state: Game,
  orientationLeft: Orientation,
  orientationRight: Orientation,
  mode: "AI" | "human"
): Game {
  // console.log(state, orientationLeft, orientationRight);
  // move right paddle
  // move the left paddle
  // move the ball
  // check if win
  callCount += 1;
  // console.log("callCounts", callCount, paddlecallCount, ballCallCount);
  const newState = structuredClone(state);
  const state1 =
    mode === "AI"
      ? movePaddle(newState, "l", aiMove(newState))
      : movePaddle(newState, "l", orientationLeft);
  const state2 = movePaddle(state1, "r", orientationRight);
  // console.log(orientationRight);
  const state3 = moveBall(state2);
  const state4 = updateBallVelocity(state3);
  const state5 = checkWin(state4);
  return state5;
}

function computeHitPosition(gameState: Game) {
  if (page_height && gameState.coords.ball.xvelocity < 0) {
    console.log("computeHitPosition");
    const bottomDist = gameState.coords.ball.ycoord - 40;
    const topDist = page_height - gameState.coords.ball.ycoord - 40;
    let xdist = gameState.coords.ball.xcoord;
    let ydist = gameState.coords.ball.ycoord;
    const MAX_ITER = 20;
    let iter = 0;
    while (xdist > 10 && iter < MAX_ITER) {
      const relDist =
        gameState.coords.ball.yvelocity > 0 ? topDist : bottomDist;
      const possNext =
        xdist -
        Math.abs(
          (relDist / gameState.coords.ball.yvelocity) *
            gameState.coords.ball.xvelocity
        );
      if (possNext > 0) {
        xdist -= possNext;
        ydist = gameState.coords.ball.yvelocity > 0 ? page_height - 40 : 40;
      } else {
        const timeremaining = Math.abs(
          (xdist - 10) / gameState.coords.ball.xvelocity
        );
        ydist += timeremaining * gameState.coords.ball.yvelocity;
        return ydist - 40;
      }
      iter += 1;
    }
    console.error("ended while loop");
  } else {
    console.log("ball moving other direction");
    return;
  }
}

function aiMove(gameState: Game) {
  console.log("AI move");
  const targetPos = computeHitPosition(gameState);

  console.log("targetPos", targetPos);
  if (targetPos) {
    const moveDirection = gameState.coords.player1 < targetPos ? "up" : "down";
    console.log(
      targetPos,
      gameState.coords.player1,
      targetPos < gameState.coords.player1
    );
    return moveDirection;
  } else {
    console.error("difficulty calculating AI Position");
  }
  return "none";
}

export function movePaddle(
  state: Game,
  paddle: "l" | "r",
  direction: Orientation
) {
  const newState = structuredClone(state);
  if (direction !== "none") {
    if (paddle === "l") {
      newState.coords.player1 += direction === "up" ? STEP_SIZE : -STEP_SIZE;
    }
    if (paddle === "r") {
      newState.coords.player2 += direction === "up" ? STEP_SIZE : -STEP_SIZE;
    }
  }
  return newState;
}

export function moveBall(state: Game) {
  const newState = structuredClone(state);
  newState.coords.ball.xcoord += newState.coords.ball.xvelocity;
  newState.coords.ball.ycoord += newState.coords.ball.yvelocity;
  return newState;
}

export type CollisionPosition = Set<
  "t" | "r" | "b" | "l" | "tl" | "tr" | "br" | "bl"
>;
export type CollisionConditions = {
  position: CollisionPosition;
}; //possibly include velocity

// function checkCollisions(
//   ball: BoxCoords,
//   other: BoxCoords,
//   conditions: CollisionConditions
// ) {
//   conditions.position.forEach(() => {
//     if checkCollision()
//   });
// }

type FullCoords = {
  lx: number;
  rx: number;
  ty: number;
  by: number;
};

function checkCollision(ballcoords: FullCoords, paddleCoords: FullCoords) {
  return (
    ballcoords.rx < paddleCoords.rx + 10 &&
    ballcoords.rx > paddleCoords.lx - 10 &&
    ballcoords.by < paddleCoords.ty &&
    ballcoords.by > paddleCoords.by
  );
  // return (
  //   ((ballcoords.rx < paddleCoords.rx && ballcoords.rx > paddleCoords.lx) ||
  //     true) &&
  //   ballcoords.by < paddleCoords.ty &&
  //   ballcoords.by > paddleCoords.by
  // );

  // return (
  //   ballcoords.lx < paddleCoords.rx &&
  //   ballcoords.rx > paddleCoords.lx &&
  //   ballcoords.by < paddleCoords.ty &&
  //   ballcoords.ty > paddleCoords.by
  // );
}

function paddleCollision(
  ballcoords: FullCoords,
  paddleCoords: FullCoords,
  gameState: Game,
  whichpaddle: "left" | "right"
) {
  const ballx = gameState.coords.ball.xvelocity;
  const bally = gameState.coords.ball.yvelocity;
  const paddleheight = paddleCoords.ty - paddleCoords.by;
  const ballcenter =
    ((ballcoords.ty - ballcoords.by) / 2 +
      ballcoords.by -
      (paddleCoords.ty + paddleCoords.by) / 2) /
    paddleheight;
  console.log("paddleheight", ballcenter);
  //set y-velocity depending on the ballcenter
  const velocity_mag = Math.sqrt(ballx * ballx + bally * bally);
  const ycomponentmag = Math.abs(gameState.coords.ball.yvelocity);
  const newysign = ycomponentmag / gameState.coords.ball.yvelocity;
  gameState.coords.ball.yvelocity =
    (ycomponentmag + (velocity_mag - ycomponentmag) * Math.abs(ballcenter)) *
    newysign;
  gameState.coords.ball.xvelocity =
    (-1 *
      (Math.sqrt(velocity_mag ** 2 - gameState.coords.ball.yvelocity ** 2) *
        Math.abs(gameState.coords.ball.xvelocity))) /
    gameState.coords.ball.xvelocity;
  //then set x-velocity so that magnitude stays the same

  //factor in x-velocity?
  // const newAngle = Math.atan(-bally / ballx + ballcenter);
  // gameState.coords.ball.xvelocity = -Math.cos(newAngle) * ballx;
  // gameState.coords.ball.yvelocity = Math.sin(newAngle) * bally;
  console.log("xcoord", gameState.coords.ball.xcoord, paddleCoords.lx);
  if (whichpaddle === "left") {
    gameState.coords.ball.xcoord = paddleCoords.rx + BALL_SIZE;
  } else if (whichpaddle === "right") {
    gameState.coords.ball.xcoord = paddleCoords.lx - 2 * BALL_SIZE;
  }
  console.log(gameState.coords.ball.xvelocity, gameState.coords.ball.yvelocity);
  return gameState;
}

function updateBallVelocity(state: Game) {
  if (page_width && page_height) {
    const leftpad = {
      lx: PADDLE_LEFT,
      rx: PADDLE_LEFT + PADDLE_WIDTH,
      ty: state.coords.player1 + PADDLE_HEIGHT,
      by: state.coords.player1,
    };

    const rightpad = {
      lx: page_width - PADDLE_RIGHT,
      rx: page_width - PADDLE_RIGHT - PADDLE_WIDTH,
      ty: state.coords.player2 + PADDLE_HEIGHT,
      by: state.coords.player2,
    };

    const ball = {
      lx: state.coords.ball.xcoord,
      rx: state.coords.ball.xcoord + BALL_SIZE,
      ty: state.coords.ball.ycoord + BALL_SIZE,
      by: state.coords.ball.ycoord,
    };
    // console.log("walls", bottomwall, topwall, page_height - 40);
    // console.log(leftpad, rightpad, ball);
    if (checkCollision(ball, rightpad)) {
      console.log("collision detected");
      return paddleCollision(ball, rightpad, state, "right");
    } else if (checkCollision(ball, leftpad)) {
      console.log("collision detected");
      return paddleCollision(ball, leftpad, state, "left");
    }
    if (ball.ty > page_height - 40) {
      state.coords.ball.yvelocity = -state.coords.ball.yvelocity;
      return state;
    } else if (ball.by < 40) {
      console.log("hitting top");
      state.coords.ball.yvelocity = -state.coords.ball.yvelocity;
      return state;
    } else {
      return state;
    }
  } else {
    console.log("error with document");
    return state;
  }
}

// const newVelocity =

function checkWin(gameState: Game) {
  if (page_width) {
    if (gameState.coords.ball.xcoord > page_width) {
      gameState.coords.ball.xcoord = BALL_START_X;
      gameState.coords.ball.ycoord = BALL_START_Y;
      gameState.score.player1 += 1;
      return gameState;
    } else if (gameState.coords.ball.xcoord < 0) {
      gameState.coords.ball.xcoord = BALL_START_X;
      gameState.coords.ball.ycoord = BALL_START_Y;
      gameState.score.player2 += 1;
      return gameState;
    } else {
      return gameState;
    }
  } else {
    return gameState;
    console.log("page width null");
  }
}

// export default Game;
