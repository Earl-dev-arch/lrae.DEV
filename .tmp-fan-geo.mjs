export default async function run(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:8767/index.html", { waitUntil: "load" });
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 25000 },
  );
  await page.waitForTimeout(500);
  await page.locator("#stack").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const grid = page.locator(".fan-deck .language-grid");
  await grid.click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1500);

  const geo = () =>
    page.evaluate(() => {
      const sec = document.querySelector("#stack");
      const cards = [
        ...document.querySelectorAll(".fan-deck .language.is-shown"),
      ];
      const rs = cards.map((c) => c.getBoundingClientRect());
      const sr = sec.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(sec).paddingLeft);
      const title = sec.querySelector(".section-title").getBoundingClientRect();
      return {
        n: cards.length,
        slots: cards.map((c) => c.style.getPropertyValue("--slot")),
        left: Math.round(Math.min(...rs.map((r) => r.left))),
        right: Math.round(Math.max(...rs.map((r) => r.right))),
        center: Math.round(
          (Math.min(...rs.map((r) => r.left)) +
            Math.max(...rs.map((r) => r.right))) /
            2,
        ),
        sectionCenter: Math.round((sr.left + pad + sr.right - pad) / 2),
        titleCenter: Math.round((title.left + title.right) / 2),
      };
    });

  const full = await geo();

  // advance to the tail set
  for (let i = 0; i < 2; i++) {
    await page.locator(".fan-deck .language.is-shown").nth(3).click();
    await page.mouse.move(3, 3);
    await page.waitForTimeout(600);
    await page.locator(".fan-deck .language.is-revealed .card-next").click();
    await page.mouse.move(3, 3);
    await page.waitForTimeout(1400);
  }
  const tail = await geo();

  const b = await page.locator(".fan-deck").boundingBox();
  await page.screenshot({
    path: ".tmp-tail.png",
    clip: {
      x: 0,
      y: Math.max(0, b.y - 20),
      width: 1440,
      height: b.height + 50,
    },
  });

  return { full, tail };
}
