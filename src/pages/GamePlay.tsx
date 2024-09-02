import React, { useState, useContext } from "react";
import { socket } from "../routes/socket";
import { AccessContext } from "../helpers/StateProvider";

const GamePlay = () => {
  const { gamestate } = useContext(AccessContext);
  const [answer, setAnswer] = useState<string>("");
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (socket && answer.trim()) {
      console.log("sending answer");
      socket.emit("answerquestion", answer.trim());
      setAnswer("");
      setAnswerSubmitted(true);
    }
  };

  return (
    <>
      {!answerSubmitted && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-2xl font-bold text-center mb-6">
            {gamestate.ask_state?.prompt}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl flex flex-col gap-5"
          >
            <textarea
              value={answer}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setAnswer(e.target.value)
              }
              placeholder="Type your answer here..."
              className="w-full h-48 p-2 mb-4 border border-gray-300 rounded resize-y"
            />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-500 text-white font-semibold rounded hover:bg-blue-600 transition duration-200"
            >
              Submit Answer
            </button>
          </form>
        </div>
      )}
      {answerSubmitted && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-2xl font-bold text-center mb-6">
            Waiting for other players...
          </h2>
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-6 text-lg text-gray-600">
            Your answer has been submitted. Please wait while others finish.
          </p>
        </div>
      )}
    </>
  );
};

export default GamePlay;
