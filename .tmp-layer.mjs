export default async function run(page) {
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 40000 },
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator("#stack").scrollIntoViewIfNeeded();
  await page.locator(".fan-deck .language-grid").click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1600);
  const info = await page.evaluate(() => {
    const cards = [
      ...document.querySelectorAll(".fan-deck .language.is-shown"),
    ];
    return cards.map((c, i) => {
      const s = getComputedStyle(c);
      const r = c.getBoundingClientRect();
      return {
        i,
        name: c.querySelector("h3").textContent,
        z: s.zIndex,
        op: s.opacity,
        bg: s.backgroundColor,
        left: Math.round(r.left),
        right: Math.round(r.right),
        transform: s.transform.slice(0, 60),
      };
    });
  });
  const b = await page.locator(".fan-deck").boundingBox();
  await page.screenshot({
    path: ".tmp-layer.png",
    clip: {
      x: b.x - 60,
      y: b.y - 40,
      width: b.width + 120,
      height: b.height + 60,
    },
  });
  return info;
}
