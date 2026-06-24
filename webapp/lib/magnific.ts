// Server-only bridge to the Magnific (Freepik) image API.
// Docs: https://docs.magnific.com — host api.magnific.com, header
// x-magnific-api-key. Two operations are used by the Location Bible:
//   1. mysticGenerate  — text-to-image establishing render of a room (Mystic).
//   2. reframe         — a new camera angle of an existing render. NOTE: the
//      public REST API has NO literal "change camera" endpoint, so this is
//      implemented as Flux Kontext Pro image-to-image guided by a camera
//      instruction prompt. It is prompt-guided regeneration, not a true
//      reframe, but it is the documented path and keeps the room consistent.
//
// Both endpoints are async: POST returns a task id, then you poll the GET
// endpoint until status is COMPLETED and read the hosted url from data.generated.

const BASE = "https://api.magnific.com";

export class MagnificError extends Error {}

function apiKey(): string {
  const k = process.env.MAGNIFIC_API_KEY || process.env.FREEPIK_API_KEY;
  if (!k) {
    throw new MagnificError(
      "No API key. Set MAGNIFIC_API_KEY in webapp/.env.local (get one from the Magnific API dashboard)."
    );
  }
  return k;
}

function headers() {
  return { "Content-Type": "application/json", "x-magnific-api-key": apiKey() };
}

interface TaskData {
  task_id?: string;
  status?: string;
  generated?: string[];
}

async function readData(res: Response): Promise<TaskData> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (json && (json.message || json.error || JSON.stringify(json))) || res.statusText;
    throw new MagnificError(`Magnific API ${res.status}: ${msg}`);
  }
  return (json.data || json) as TaskData;
}

// Submit a task, then poll its GET endpoint until the image is ready.
async function runTask(submitPath: string, body: unknown): Promise<string> {
  const submit = await fetch(`${BASE}${submitPath}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  const created = await readData(submit);
  const taskId = created.task_id;
  if (!taskId) throw new MagnificError("Magnific did not return a task id");

  const deadline = Date.now() + 180_000; // 3 min ceiling
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(`${BASE}${submitPath}/${taskId}`, { headers: headers() });
    const t = await readData(res);
    if (t.status === "COMPLETED") {
      const url = t.generated?.[0];
      if (!url) throw new MagnificError("Task completed but returned no image");
      return url;
    }
    if (t.status === "FAILED") throw new MagnificError("Magnific task failed");
  }
  throw new MagnificError("Magnific task timed out");
}

// Establishing render of a room from its base prompt.
export function mysticGenerate(prompt: string, aspectRatio = "widescreen_16_9") {
  return runTask("/v1/ai/mystic", {
    prompt,
    model: "realism",
    resolution: "2k",
    aspect_ratio: aspectRatio,
  });
}

export interface Cam {
  rotate: number; // 0-360, orbit around the room
  vertical: number; // -30..90, camera height
  closeup: number; // 0-10, wide -> tight
}

// Turn the camera sliders into a natural-language reframe instruction.
export function camInstruction(cam: Cam): string {
  const parts: string[] = [];

  const r = ((cam.rotate % 360) + 360) % 360;
  if (r < 15 || r > 345) parts.push("from roughly the same direction");
  else if (r <= 75) parts.push(`orbited about ${Math.round(r)}° to the right`);
  else if (r <= 105) parts.push("turned 90° to look along the right-hand wall");
  else if (r <= 165) parts.push(`swung around ${Math.round(r)}° toward the rear`);
  else if (r <= 195) parts.push("reversed 180° to the opposite side of the room");
  else if (r <= 255) parts.push(`swung around ${Math.round(360 - r)}° toward the rear from the left`);
  else if (r <= 285) parts.push("turned 90° to look along the left-hand wall");
  else parts.push(`orbited about ${Math.round(360 - r)}° to the left`);

  if (cam.vertical <= -10) parts.push("a low angle looking slightly up");
  else if (cam.vertical >= 60) parts.push("a high overhead angle looking down");
  else if (cam.vertical >= 25) parts.push("an elevated angle looking down");
  else parts.push("eye level");

  if (cam.closeup >= 8) parts.push("a tight close framing of the nearest detail");
  else if (cam.closeup >= 6) parts.push("a closer framing");
  else if (cam.closeup <= 2) parts.push("a wide establishing framing of the whole room");
  else parts.push("a medium framing");

  return parts.join(", ");
}

// A new camera angle of an existing render. inputImageUrl must be publicly
// reachable (Magnific's servers fetch it) — a local /locations path will not do.
export function reframe(
  inputImageUrl: string,
  basePrompt: string,
  cam: Cam,
  aspectRatio = "widescreen_16_9"
) {
  const prompt = `Same location, identical contents, lighting and materials — do not change the set. Reframe the shot: ${camInstruction(
    cam
  )}. Photorealistic, consistent with the reference. ${basePrompt}`;
  return runTask("/v1/ai/text-to-image/flux-kontext-pro", {
    prompt,
    input_image: inputImageUrl,
    aspect_ratio: aspectRatio,
  });
}
