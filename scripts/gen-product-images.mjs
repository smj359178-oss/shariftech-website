// توليد تصاوير محلي محصولات — دارايي کاملاً داخلي (بدون وابستگي خارجي)
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";

const OUT_DIR = "/home/z/my-project/public/products";

const IMAGES = [
  {
    file: "agent-suite.jpg",
    prompt:
      "Futuristic industrial control room with large holographic AI assistant screens, glowing emerald green data streams, dark charcoal background, technicians silhouettes, cinematic lighting, professional corporate photography style, high quality, detailed",
  },
  {
    file: "energy-agent.jpg",
    prompt:
      "Oil refinery at dusk with glowing amber energy efficiency visualization overlays, floating holographic charts showing power savings, warm golden lighting mixed with teal accents, cinematic industrial photography, high quality, detailed",
  },
  {
    file: "petro-dashboard.jpg",
    prompt:
      "Modern executive dashboard on large monitor displaying oil and gas production KPIs with teal and emerald charts, dark elegant office, minimal design, data visualization screens, professional tech photography, high quality, detailed",
  },
  {
    file: "refinery-ops.jpg",
    prompt:
      "Industrial pipeline control system with glowing cyan heat map visualization, refinery units in background, holographic warning indicators, dark blue-teal atmosphere, cinematic photography, high quality, detailed",
  },
  {
    file: "predictive-maintenance.jpg",
    prompt:
      "Industrial rotating pump equipment with glowing emerald health monitoring hologram overlay, vibration wave analysis visualization, futuristic predictive maintenance concept, dark background, high quality, detailed",
  },
  {
    file: "vision-safety.jpg",
    prompt:
      "Computer vision AI detecting safety helmets on industrial workers, bounding box overlays in amber color, factory site camera view, HSE monitoring system, futuristic detection grid, high quality, detailed",
  },
  {
    file: "digital-twin.jpg",
    prompt:
      "Holographic digital twin of petrochemical plant, glowing violet purple wireframe 3D model floating above control desk, data particles, futuristic simulation laboratory, dark background, cinematic, high quality, detailed",
  },
  {
    file: "flare-monitoring.jpg",
    prompt:
      "Gas flare stack at industrial plant monitored by thermal imaging hologram with rose red detection zones, night scene, environmental monitoring visualization, cinematic industrial photography, high quality, detailed",
  },
  {
    file: "custom-solutions.jpg",
    prompt:
      "Elegant software development workspace with multiple screens showing violet and emerald code architecture diagrams, modern minimal office, enterprise software engineering concept, professional photography, high quality, detailed",
  },
];

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const zai = await ZAI.create();
  const results = [];
  for (const img of IMAGES) {
    const outPath = path.join(OUT_DIR, img.file);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
      console.log(`skip (exists): ${img.file}`);
      results.push({ file: img.file, ok: true });
      continue;
    }
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await zai.images.generations.create({
          prompt: img.prompt,
          size: "1152x864",
        });
        const b64 = res?.data?.[0]?.base64;
        if (!b64) throw new Error("no base64 in response");
        fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
        console.log(`ok: ${img.file}`);
        results.push({ file: img.file, ok: true });
        break;
      } catch (e) {
        console.error(`fail(${attempt}) ${img.file}: ${e?.message || e}`);
        if (attempt === 3) results.push({ file: img.file, ok: false });
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`DONE. success=${results.length - failed.length} failed=${failed.length}`);
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
