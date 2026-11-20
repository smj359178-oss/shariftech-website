import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";

async function main() {
  const zai = await ZAI.create();
  const response = await zai.images.generations.create({
    prompt:
      "Futuristic industrial technology concept art for a corporate website banner: a glowing dark teal and emerald green digital neural network sphere hovering above an oil refinery and petrochemical plant at dusk, data visualization holograms, dark green-black background, cinematic lighting, professional corporate style, ultra detailed, no text",
    size: "1344x768",
  });
  const base64 = response.data[0].base64;
  fs.writeFileSync("./public/og-image.jpg", Buffer.from(base64, "base64"));
  console.log("saved ./public/og-image.jpg");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
