import React, { useState } from "react";
import { GameStateType } from "../helpers/StateProvider";
import { socket } from "../routes/socket";

export const PickTopicScreen = ({
  gamestate,
}: {
  gamestate: GameStateType;
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState<string>("");

  const predefinedTopics = ["Medical", "Dating", "Something random"];

  const handleTopicSelection = (topic: string) => {
    setSelectedTopic(topic);
    setCustomTopic("");
  };

  const handleCustomTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTopic(e.target.value);
    setSelectedTopic(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTopic = selectedTopic || customTopic;
    if (finalTopic) {
      console.log("Selected topic:", finalTopic);
      // Here you would typically send the selected topic to your game state or backend
      socket.emit("settopic", {topic: finalTopic});
    }
  };

  return (
    <div className="flex items-center w-full h-full">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Pick a Topic
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            {predefinedTopics.map((topic, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleTopicSelection(topic)}
                className={`w-full py-2 px-4 rounded ${
                  selectedTopic === topic
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
          <div className="mb-6">
            <input
              type="text"
              value={customTopic}
              onChange={handleCustomTopicChange}
              placeholder="Or enter your own topic..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded transition duration-200 ${
              !selectedTopic && !customTopic
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer"
            }`}
            disabled={!selectedTopic && !customTopic}
          >
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
};
