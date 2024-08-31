import { z } from 'zod'; 

const QuipSchema = z.object({
  Quip: z.string()
    .describe("A witty or clever remark or comment, typically meant to entertain or provoke thought."),
}).describe("A schema for a witty remark, containing a single attribute 'Quip'.");

 export default QuipSchema;

export const config = {"path":"quip","public":false,"cache":"None","contentType":"text","name":"get_prompt","model":"gpt-4o-mini","provider":"openai"};