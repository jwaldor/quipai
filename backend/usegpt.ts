import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

export async function prompt_quip(topic: string) {
  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Generate a random funny Quiplash prompt for this topic: ${topic} \n Examples of other Quiplash prompts:\n The worst theme for a pinball machine.\nWhat should be dumped on the losing coach at the end of a football game.`,
      },
    ],
    model: "gpt-4o-mini",
  });
  console.log("gpt prompt return", chatCompletion.choices[0].message.content);
  return chatCompletion.choices[0].message.content;
}

export async function get_winner(answers: Map<string, string>, prompt: string) {
  console.log(
    "initial_prompt",
    `When users were given the prompt "${prompt}", they gave the answers below. Output the key associated with the best answer in triple backticks (\`\`\`) so that it can be parsed by regex. \n ${JSON.stringify(
      answers
    )}`
  );
  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `When users were given the prompt "${prompt}", they gave the answers below. Output the key associated with the best answer in triple backticks (\`\`\`) so that it can be parsed by regex. \n ${answers}`,
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
