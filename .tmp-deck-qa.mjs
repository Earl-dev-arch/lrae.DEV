export default async function run(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:8767/index.html", { waitUntil: "load" });
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 25000 },
  );
  await page.waitForTimeout(700);
  await page.locator("#stack").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const grab = async (name) => {
    const b = await page.locator(".fan-deck").boundingBox();
    await page.screenshot({
      path: name,
      clip: {
        x: Math.max(0, b.x - 40),
        y: Math.max(0, b.y - 130),
        width: Math.min(1440, b.width + 80),
        height: Math.min(b.height + 170, 820),
      },
    });
  };

  await grab(".tmp-deck-closed.png");

  await page.locator(".fan-deck .language-grid").click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1600);

  const data = await page.evaluate(() => {
    const cards = [
      ...document.querySelectorAll(".fan-deck .language.is-shown"),
    ];
    return {
      open: document.querySelector(".fan-deck").classList.contains("is-open"),
      shadows: cards.map((c) => getComputedStyle(c).boxShadow),
      opacities: cards.map((c) => getComputedStyle(c).opacity),
      clippedTitles: cards
        .filter((c) => {
          const h = c.querySelector("h3");
          return h.scrollWidth > h.clientWidth;
        })
        .map((c) => c.querySelector("h3").textContent),
      titles: cards.map((c) => c.querySelector("h3").textContent),
    };
  });

  await grab(".tmp-deck-open.png");

  // light theme
  await page.locator(".theme-toggle").click();
  await page.waitForTimeout(900);
  await page.locator("#stack").scrollIntoViewIfNeeded();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(600);
  const lightShadows = await page.evaluate(() =>
    [...document.querySelectorAll(".fan-deck .language.is-shown")].map(
      (c) => getComputedStyle(c).boxShadow,
    ),
  );
  await grab(".tmp-deck-light.png");

  return { data, lightShadows };
}
