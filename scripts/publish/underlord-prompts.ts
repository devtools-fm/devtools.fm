/**
 * Write the Underlord prompts for the Andrew Pass into .generated/publish/<N>/prompts/.
 *
 *   pnpm episode:prompts 179 --guest "Bobby Grayson|deciduous" [--guest "…|…"]
 *
 * Then run each one, in order, with:
 *   pnpm episode:descript 179 agent --composition <kind> --prompt-file .generated/publish/179/prompts/<file>
 *
 * The file name prefix gives the order and the composition each prompt targets. Edit a prompt
 * here rather than ad hoc so improvements carry over to the next episode.
 */
import fs from "fs";
import path from "path";

import { nameFor } from "./descript";
import { config, episodeFile, fail, parseArgs, requireEpisode } from "./lib";

/** `card` is the media name inside the Descript project. */
type Person = { name: string; speaker: string; card: string; host: boolean; render?: string };

const { compositionNames, assets, adAfterMinutes, nameCard, hosts } = config.descript;

const prompts: Record<string, (people: Person[], episode: string) => string> = {
  "01-main-stinger.md": (people) => `Create a stinger (cold open) at the very start of this composition.

1. Find the single most compelling 15–30 second moment where ${people
    .filter((p) => !p.host)
    .map((p) => p.speaker)
    .join(" or ")} is talking: a surprising claim, a strong opinion, or a quotable line that makes someone want to keep watching. It should make sense without any context and must not come from the first two minutes or from the ad.
2. Copy that moment (audio and video together) to the very beginning of the composition, before anything else. Leave the original in place.
3. Don't change anything else.

Reply with the start and end timestamps of the original moment and the exact quote.`,

  "02-main-intro.md": () => `Build the intro exactly like earlier devtools.fm episodes. There are four steps:

1. Put "${assets.intro.music}" on its own audio track starting at 0:00, the start of the stinger. Under the stinger it plays quietly as a background bed, at about ${assets.bedVolumeDb} dB.
2. Right after the stinger ends, insert a ${assets.intro.seconds}-second gap in the script with no speech. During the gap:
   - show the image "${assets.intro.frame}" full screen
   - raise the music to full volume with a quick ramp at the very start of the gap
3. When the gap ends and the hosts' welcome begins ("Hello, welcome to devtools.fm…"), ramp the music back down to the background level over about 1 second.
4. Let the music keep playing quietly under the welcome for about ${assets.intro.tailSeconds} seconds, easing down slightly. End the music clip there and trim off the rest of the track.

Don't change anything else. Reply with the timestamps where the music starts, where the gap starts and ends, and where the music ends.`,

  "03-main-outro.md": () => `Build the outro exactly like earlier devtools.fm episodes. There are three steps:

1. Find the hosts' closing line near the end (e.g. "That wraps it up for our questions…"). Start "${assets.outro.music}" on its own audio track at the beginning of that line. Keep it quiet under the speech as a background bed, at about ${assets.bedVolumeDb} dB.
2. After the last words, insert a ${assets.outro.seconds}-second gap in the script with no speech. During the gap:
   - show the image "${assets.outro.frame}" full screen
   - ramp the music up to full volume quickly (about 0.3 seconds) at the start of the gap
3. End the music and the end frame together at the end of the gap, and trim off the rest of the track.

Don't change anything else. Reply with the timestamps where the music starts, where the gap starts, and the new total duration.`,

  "04-main-name-cards.md": (people) => {
    const lines = people.map((p) =>
      p.host
        ? `- "${p.card}" for ${p.name} (host, speaker label "${p.speaker}"): during the welcome right after the intro frame, show it while ${p.speaker} is talking, from their first word until the next person starts. If another speaker only interjects briefly, split the card around the interjection rather than ending it.`
        : `- "${p.card}" for ${p.name} (guest, speaker label "${p.speaker}"): show it (a) for the whole time ${p.speaker} is on screen during the stinger at the start, and (b) from ${p.speaker}'s first words in the main conversation, after the intro, for ${nameCard.mainConversationSeconds} seconds.`
    );
    return `Add the name card images as overlay layers on top of the video in this composition. If two cards would overlap in time, show the later one only after the earlier one has faded out.

${lines.join("\n")}

For every card:
- Position: ${nameCard.position} of the frame, inset ${nameCard.insetPercentOfFrame}% of the frame from both edges.
- Size: ${nameCard.heightPercentOfFrame}% of the frame height, keeping the image's aspect ratio. Don't crop or stretch it. Some images have transparent space on the right; that's expected.
- Fade in and fade out over ${nameCard.fadeSeconds} seconds.
- Keep it above the video on its own layer. Don't change the video, audio or transcript.

Reply with the start and end time of each card.`;
  },

  "05-main-split.md": (_guests, episode) => `Split this composition into the paid and free versions.

1. Rename this composition to "${nameFor(compositionNames.full, episode)}". Then duplicate it and name the copy "${nameFor(compositionNames.free, episode)}". The two should be identical.
2. In "${nameFor(compositionNames.free, episode)}" only, add a marker named "Ad" at the first natural topic transition after the ${adAfterMinutes}-minute mark (between two answers, never mid-sentence). That's where the sponsor read goes.

Don't change anything else. Reply with the composition names and the Ad marker's timestamp.`,

  "06-free-insert-ad.md": () => `Insert the media "Ads/ad-read" at the "Ad" marker in this composition, as its own segment between the surrounding speech. Leave the marker where the ad starts. Don't change anything else. Reply with the ad's start and end timestamps.`,

  "07-full-chapters.md": () => chaptersPrompt(false),
  "08-free-chapters.md": () => chaptersPrompt(true),
};

function chaptersPrompt(free: boolean) {
  return `Add chapter markers to this composition. Remove any existing markers except "Ad" first.

- The first marker is "Introduction" at 0:00. It covers the stinger, intro and welcome.
- Then add one marker at each major topic change, usually every 4–12 minutes. Don't create chapters shorter than 1 minute.
- Titles are short Title Case phrases of 2–6 words about the topic, e.g. "Typed BEAM and Language Experiments" or "Five Year Coding Predictions". Avoid generic titles like "Discussion".${
    free ? `\n- Keep the "Ad" marker exactly where it is, titled "Ad".` : ""
  }
- The last topic should be the closing question or wrap-up, not the outro.

Reply with only the chapter list, one per line, formatted exactly like: [00:03:45] Typed BEAM and Language Experiments`;
}

export function cardFile(episode: string, name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return episodeFile(episode, `name-card-${slug}.png`);
}

function main() {
  const { positionals } = parseArgs();
  const episode = requireEpisode(positionals);

  // parseArgs keeps the last value of a repeated flag, so read --guest values directly.
  const guestArgs = process.argv.flatMap((arg, i, all) => (all[i - 1] === "--guest" ? [arg] : []));
  if (!guestArgs.length) fail('Pass --guest "Full Name|subtitle" for each guest.');

  const people: Person[] = [
    ...guestArgs.map((value) => {
      const [name, subtitle = ""] = value.split("|").map((part) => part.trim());
      // Transcripts label guests by first name, like the hosts.
      const file = cardFile(episode, name);
      return {
        name,
        speaker: name.split(" ")[0],
        card: `${nameCard.folder}/${path.basename(file)}`,
        host: false,
        render: `pnpm episode:art ${episode} name-card --name "${name}" --subtitle "${subtitle}"`,
        file,
      };
    }),
    ...hosts.map((host) => ({ ...host, host: true })),
  ];

  const dir = episodeFile(episode, "prompts");
  fs.mkdirSync(dir, { recursive: true });
  for (const [file, build] of Object.entries(prompts)) {
    fs.writeFileSync(path.join(dir, file), `${build(people, episode)}\n`);
    console.log(path.join(dir, file));
  }

  for (const person of people) {
    if (person.render && !fs.existsSync((person as any).file)) {
      console.warn(`! Render ${person.name}'s card first: ${person.render}`);
    }
  }
}

if (require.main === module) {
  main();
}
