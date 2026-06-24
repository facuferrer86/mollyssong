# Image Pipeline Guide — where Magnific fits

A short, practical workflow for turning the prompt bible into consistent, film-quality character images.

## The honest take on Magnific
Magnific is a **finisher**, not a character generator. Its strengths are upscaling, detail enhancement ("Mystic"), and relighting. It will make a good image look like a film frame. It will **not**, on its own, give you the same Molly in 40 different shots — that's a *generation/consistency* problem you solve upstream. So think of your pipeline in two stages: **generate consistent** → **finish in Magnific**.

## Recommended pipeline

1. **Lock each hero face (generate stage).** Use the Master Prompts in the bible to create one canonical portrait per character. Best tools for *character consistency*:
   - **Midjourney** — use `--cref [image URL] --cw 100` to carry a face across new shots. Easiest path for a beginner.
   - **Flux** (e.g. via Freepik, Replicate) — strong photorealism; pair with an IP-Adapter or a small trained LoRA for the same face every time.
   - A **trained LoRA** (one per main character) is the gold standard if this becomes a real production — ~15–20 images of the locked face, trained once, then perfectly consistent forever.

2. **Generate all variants from the locked face**, not from scratch. Feed the hero portrait back as a reference (`--cref` / IP-Adapter / face-swap) and only change the variant description (age, wardrobe, location). Text-only re-rolls will drift.

3. **Finish in Magnific.** Take your chosen generations and run **Upscale + Enhance (Mystic)** to add film-grade detail, then **Relight** to match the scene's lighting (warm amber lab, ochre Wastelands, cold blue Accord). This is where the bible's lighting notes pay off.

4. **Grade for continuity.** Apply the same color grade across a sequence so the palette stays consistent (desaturated earthy tones, warm amber highlights, cool teal shadows).

## Practical notes
- **Age consistency is the #1 trap.** Lock Molly's 16-year-old face first; derive toddler/child/14/digital from it. Never let the auburn hair + hazel-green eyes + freckles drift.
- **Protect the contrasts:** pale-indoor Molly vs. weathered-outdoor Kael; grimy warm Wastelands vs. sterile cold Accord. If a render loses these, regenerate.
- **The locket and Elias's scarred hands** are cheap, powerful continuity props — include them whenever the framing allows.
- **Cost reality:** Magnific is a paid subscription priced for upscaling volume. If your bottleneck is *generating* consistent characters, your money is better spent first on Midjourney or a LoRA workflow, with Magnific added once you have keepers worth finishing.

## Suggested order of operations for *Molly's Song*
1. Molly (16) hero → the whole film hinges on her consistency.
2. Elias hero → most screen time alongside her.
3. Kael hero.
4. Accord City + Accord hub establishing plates (these don't need face consistency, so they're quick wins).
5. Then derive all age/state variants from the three locked faces.
