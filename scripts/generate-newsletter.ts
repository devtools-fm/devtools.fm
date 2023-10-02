import OpenAI from "openai";
import fs from "fs";
import path from "path";
import endent from "endent";
import openaiTokenCounter from "openai-gpt-token-counter";

require("dotenv").config();

const openai = new OpenAI({});
const model = "gpt-4-32k";
const template = fs.readFileSync("pages/newsletters/63.md", "utf8");

async function main(episode: number) {
  const episodePath = path.join("pages", "episode", `${episode}.mdx`);
  const mdxContent = fs.readFileSync(episodePath, "utf8");
  const tokenCount = openaiTokenCounter.text(mdxContent, model);
  console.log(`Token count: ${tokenCount}`);

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: endent`
          I will provide you with the show notes and transcript for a podcast episode.

          You will then need to create a newsletter for that episode using the show notes and transcript. 
          
          - The newsletter should be 2000 words long
          - include links to the youtube video, and the podcast episode
          - It should have an intro that introduces the weeks guest, mentions the tool they build summarized the themes of the podcast
          - Detail 5 key takeaways from the episode each in their own section with their own heading. Don't include timestamps
          - Included an additional section that summarizes each of the "tooltips" from the episode with links to the relevant resources
          - At the end of the newsletter, there should be a call to action to listen to the episode
          - Output the newsletter as a markdown file
          - Include a footer that advertises that subscribing to the podcast on various platforms gets you the full episode without ads
        `,
      },
      {
        role: "user",
        content: `The following an example of how I would like the newsletter formatted: ${template}`,
      },
      {
        role: "user",
        content: `The following is the show notes and transcript for episode ${episode} of the podcast: ${mdxContent}`,
      },
    ],
    model,
  });

  console.log(completion.choices);

  const newsletter = completion.choices[0].message.content;
  const newsletterPath = path.join("pages", "newsletters", `${episode}.md`);
  fs.writeFileSync(newsletterPath, newsletter);
}

const args = process.argv.slice(2);
const firstArg = args[0];

main(parseInt(firstArg, 10));
