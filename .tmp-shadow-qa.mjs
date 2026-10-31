export default async function run(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:8767/index.html", { waitUntil: "load" });
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 20000 },
  );
  await page.waitForTimeout(800);

  const scan = () =>
    page.evaluate(() => {
      const pick = (sel) =>
        [...document.querySelectorAll(sel)].map((el) => {
          const s = getComputedStyle(el);
          return {
            cls: el.className,
            shadow: s.boxShadow === "none" ? "none" : s.boxShadow,
          };
        });
      return {
        theme: document.body.classList.contains("light-theme")
          ? "light"
          : "dark",
        language: pick(".fan-deck .language"),
        logoBox: pick(".fan-deck .language b"),
        worksCards: [...document.querySelectorAll("#work .card")].length
          ? []
          : ["none in markup"],
        deckBack: pick(".fan-deck .deck-back"),
      };
    });

  const dark = await scan();
  await page.locator("#stack").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const box = await page.locator(".fan-deck").boundingBox();
  await page.screenshot({
    path: ".tmp-shadow-dark.png",
    clip: {
      x: Math.max(0, box.x - 40),
      y: Math.max(0, box.y - 30),
      width: box.width + 80,
      height: box.height + 60,
    },
  });

  await page.locator(".theme-toggle").click();
  await page.waitForTimeout(800);
  const light = await scan();
  await page.locator("#stack").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const box2 = await page.locator(".fan-deck").boundingBox();
  await page.screenshot({
    path: ".tmp-shadow-light.png",
    clip: {
      x: Math.max(0, box2.x - 40),
      y: Math.max(0, box2.y - 30),
      width: box2.width + 80,
      height: box2.height + 60,
    },
  });

  const anyShadow = (r) =>
    [...r.language, ...r.logoBox, ...r.deckBack].filter(
      (x) => x.shadow !== "none",
    );
  return {
    dark,
    light,
    darkShadows: anyShadow(dark),
    lightShadows: anyShadow(light),
  };
}
