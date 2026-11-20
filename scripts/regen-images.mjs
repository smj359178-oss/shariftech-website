// ===========================================================================
// بازتولید تصاویر محصول معیوب — بدون متن (جلوگیری از متن بی‌معنا/چینی)
// فقط ۳ تصویر: vision-safety، agent-suite، petro-dashboard
// ===========================================================================
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import sharp from "sharp";

const JOBS = [
  {
    file: "public/products/vision-safety.jpg",
    prompt:
      "Professional industrial photography inside a modern oil refinery control zone, two plant engineers wearing yellow safety helmets and navy work uniforms observed by a machine vision safety system, subtle translucent teal detection bounding boxes floating over people like an AI camera overlay, wide shot, cinematic realistic lighting, teal and emerald color accents, absolutely no text, no letters, no numbers, no labels, no watermark, photorealistic, high quality",
  },
  {
    file: "public/products/agent-suite.jpg",
    prompt:
      "Professional corporate photography of a modern industrial control room, three engineers in white shirts and light blue business attire standing in front of a large wall display showing abstract glowing charts and dashboards in emerald green and teal, clean bright high-tech atmosphere, shallow depth of field, photorealistic, absolutely no text, no letters, no numbers, no readable words on screens, no watermark, high quality",
  },
  {
    file: "public/products/petro-dashboard.jpg",
    prompt:
      "Professional product photography of a sleek monitor on a modern executive desk displaying an abstract dark analytics dashboard with glowing emerald green line charts, bar graphs and KPI tiles, only graphical charts and shapes, blurred blue office background, cinematic lighting, photorealistic, absolutely no text, no letters, no numbers, no labels on the screen, no watermark, high quality",
  },
];

async function main() {
  const zai = await ZAI.create();
  for (const job of JOBS) {
    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        console.log(`→ ${job.file} (تلاش ${attempt})`);
        const res = await zai.images.generations.create({
          prompt: job.prompt,
          size: "1344x768",
        });
        const b64 = res?.data?.[0]?.base64;
        if (!b64) throw new Error("پاسخ خالی");
        const png = Buffer.from(b64, "base64");
        await sharp(png)
          .jpeg({ quality: 88, mozjpeg: true })
          .toFile(job.file);
        const kb = Math.round(fs.statSync(job.file).size / 1024);
        console.log(`  ✓ ذخیره شد (${kb}KB)`);
        ok = true;
      } catch (e) {
        console.error(`  ✗ ${e.message}`);
        if (attempt < 3) await new Promise((r) => setTimeout(r, 2000 * attempt));
        else throw e;
      }
    }
  }
  console.log("همه تصاویر ساخته شدند.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
