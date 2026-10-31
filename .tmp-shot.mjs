export default async function run(page) {
  await page.goto("http://localhost:8768/index.html", { waitUntil: "load" });
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 30000 },
  );
  await page.waitForTimeout(800);

  const info = [];
  for (const w of [360, 390, 430]) {
    await page.setViewportSize({ width: w, height: 844 });
    await page.locator("#stack").scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    const d = await page.evaluate(() => {
      const h = document.querySelector("#stack .section-title");
      const letters = [...h.querySelectorAll(".scroll-letter")];
      const rects = letters.map((l) => l.getBoundingClientRect());
      return {
        vw: innerWidth,
        text: h.textContent.replace(/\s+/g, " ").trim(),
        letters: letters.length,
        textLeft: Math.round(Math.min(...rects.map((r) => r.left))),
        textRight: Math.round(Math.max(...rects.map((r) => r.right))),
        headingLeft: Math.round(h.getBoundingClientRect().left),
        headingWidth: Math.round(h.getBoundingClientRect().width),
        fs: getComputedStyle(h).fontSize,
        secPad: getComputedStyle(document.querySelector("#stack")).paddingLeft,
      };
    });
    info.push(d);
    const b = await page.locator("#stack .section-title").boundingBox();
    await page.screenshot({
      path: `.tmp-head-${w}.png`,
      clip: {
        x: 0,
        y: Math.max(0, b.y - 30),
        width: w,
        height: b.height + 130,
      },
    });
  }
  return info;
}
