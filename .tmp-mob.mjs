export default async function run(page) {
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 40000 },
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#stack").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.locator(".fan-deck .language-grid").click();
  await page.mouse.move(2, 2);
  await page.waitForTimeout(1600);

  const data = await page.evaluate(() => {
    const cards = [
      ...document.querySelectorAll(".fan-deck .language.is-shown"),
    ];
    const rects = cards.map((c) => {
      const r = c.getBoundingClientRect();
      return {
        n: c.querySelector("h3").textContent,
        l: Math.round(r.left),
        r: Math.round(r.right),
      };
    });
    const clipped = cards.map((c) => {
      const h3 = c.querySelector("h3");
      const p = c.querySelector("p");
      return {
        n: h3.textContent,
        titleCut: h3.scrollWidth > h3.clientWidth,
        descCut: p.scrollHeight > p.clientHeight + 1,
        w: h3.clientWidth,
      };
    });
    return {
      vw: innerWidth,
      rects,
      clipped,
      leftMost: Math.min(...rects.map((x) => x.l)),
      rightMost: Math.max(...rects.map((x) => x.r)),
    };
  });

  await page.screenshot({ path: ".tmp-mob-full.png", fullPage: false });
  const sec = await page.locator("#stack").boundingBox();
  await page.screenshot({
    path: ".tmp-mob-deck.png",
    clip: {
      x: 0,
      y: Math.max(0, sec.y),
      width: 390,
      height: Math.min(sec.height, 500),
    },
  });
  return data;
}
