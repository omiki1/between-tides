/**
 * Download the Denia voice lines referenced by data/denia-voices.json into public/.
 * External game audio is fetched from the mirror recorded in the JSON; nothing is invented.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const voices = JSON.parse(fs.readFileSync(path.join(root, "data/denia-voices.json"), "utf8"));
let done = 0;
let failed = 0;

for (const voice of voices) {
  const target = path.join(root, "public", voice.src.replace(/^\//, ""));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (fs.existsSync(target) && fs.statSync(target).size > 2000) {
    console.log(`skip  ${voice.src}  (already ${(fs.statSync(target).size / 1024).toFixed(0)}KB)`);
    done += 1;
    continue;
  }
  try {
    const response = await fetch(voice.source, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
        "referer": "https://api.encore.moe/",
        "accept": "audio/webm,audio/ogg,audio/wav,audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
      },
    });
    if (!response.ok) {
      console.log(`FAIL  ${voice.src}  HTTP ${response.status}`);
      failed += 1;
      continue;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const type = response.headers.get("content-type") ?? "";
    fs.writeFileSync(target, buffer);
    const head = buffer.subarray(0, 4).toString("hex");
    console.log(`ok    ${voice.src}  ${(buffer.length / 1024).toFixed(0)}KB  type=${type}  magic=${head}`);
    done += 1;
  } catch (error) {
    console.log(`FAIL  ${voice.src}  ${error.message}`);
    failed += 1;
  }
}

console.log(`\n${done} ready, ${failed} failed`);
process.exit(failed ? 1 : 0);
