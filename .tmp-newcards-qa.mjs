export default async function run(page) {
  const failed = [];
  page.on("requestfailed", (r) => failed.push(r.url()));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:8767/index.html", { waitUntil: "load" });
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 25000 },
  );
  await page.waitForTimeout(800);
  await page.locator("#stack").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const grid = page.locator(".fan-deck .language-grid");
  const shown = () =>
    page.evaluate(() =>
      [...document.querySelectorAll(".fan-deck .language.is-shown")].map(
        (c) => c.querySelector("h3").textContent,
      ),
    );
  const btnLabel = () =>
    page.evaluate(() =>
      document
        .querySelector(".fan-deck .language.is-shown .card-next")
        .textContent.trim(),
    );

  const sets = [];
  await grid.click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1500);
  sets.push({ set: await shown(), btn: await btnLabel() });

  for (let i = 0; i < 2; i++) {
    await page.locator(".fan-deck .language.is-shown").nth(3).click();
    await page.mouse.move(3, 3);
    await page.waitForTimeout(600);
    await page.locator(".fan-deck .language.is-revealed .card-next").click();
    await page.mouse.move(3, 3);
    await page.waitForTimeout(1500);
    sets.push({ set: await shown(), btn: await btnLabel() });
  }

  // logo health for the new cards
  const logos = await page.evaluate(() => {
    const out = [];
    for (const cls of ["tailwind", "bootstrap", "linux"]) {
      const img = document.querySelector(".fan-deck .language." + cls + " img");
      out.push({
        cls,
        src: img ? img.src.split("/icons/")[1] : "MISSING",
        loaded: img ? img.complete && img.naturalWidth > 0 : false,
        w: img ? img.naturalWidth : 0,
      });
    }
    return out;
  });

  const b = await page.locator(".fan-deck").boundingBox();
  await page.screenshot({
    path: ".tmp-newcards.png",
    clip: {
      x: Math.max(0, b.x - 40),
      y: Math.max(0, b.y - 120),
      width: b.width + 80,
      height: b.height + 160,
    },
  });

  return {
    total: await page.evaluate(
      () => document.querySelectorAll(".fan-deck .language").length,
    ),
    sets,
    logos,
    failed,
  };
}
