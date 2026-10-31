export default async function run(page) {
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 40000 },
  );

  const measure = async (label) => {
    const grid = page.locator(".fan-deck .language-grid");
    await page.locator("#stack").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const isOpen = await page.evaluate(() =>
      document.querySelector(".fan-deck").classList.contains("is-open"),
    );
    if (!isOpen) {
      await grid.click();
      await page.mouse.move(3, 3);
      await page.waitForTimeout(1400);
    }
    await page.mouse.move(3, 3);
    await page.waitForTimeout(400);
    const data = await page.evaluate(() => {
      const sec = document.querySelector("#stack");
      const deck = document.querySelector(".fan-deck");
      const cards = [
        ...document.querySelectorAll(".fan-deck .language.is-shown"),
      ].map((c) => c.getBoundingClientRect());
      const union = cards.reduce(
        (a, r) => ({
          left: Math.min(a.left, r.left),
          right: Math.max(a.right, r.right),
          top: Math.min(a.top, r.top),
          bottom: Math.max(a.bottom, r.bottom),
        }),
        { left: 1e9, right: -1e9, top: 1e9, bottom: -1e9 },
      );
      const sr = sec.getBoundingClientRect();
      const pr = sec.querySelector(".section-title").getBoundingClientRect();
      const cs = getComputedStyle(sec);
      const contentPad = parseFloat(cs.paddingLeft);
      return {
        vw: innerWidth,
        sectionContentCenter: Math.round(
          (sr.left + contentPad + sr.right - contentPad) / 2,
        ),
        deckCenter: Math.round((union.left + union.right) / 2),
        titleCenter: Math.round((pr.left + pr.right) / 2),
        cardW: Math.round(cards[0].width),
        cardH: Math.round(cards[0].height),
        fanWidth: Math.round(union.right - union.left),
        overflowX:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      };
    });
    const b = await page.locator(".fan-deck").boundingBox();
    await page.screenshot({
      path: `.tmp-center-${label}.png`,
      clip: {
        x: 0,
        y: Math.max(0, b.y - 130),
        width: data.vw,
        height: Math.min(b.height + 200, 700),
      },
    });
    return data;
  };

  await page.setViewportSize({ width: 1440, height: 900 });
  const desktop = await measure("desktop");
  await page.setViewportSize({ width: 900, height: 900 });
  await page.waitForTimeout(400);
  const tablet = await measure("tablet");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  const mobile = await measure("mobile");
  return { desktop, tablet, mobile };
}
