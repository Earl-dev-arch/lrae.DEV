export default async function run(page) {
  const read = () =>
    page.evaluate(() => {
      const c = document.querySelector("#contact");
      const s = getComputedStyle(c);
      return {
        theme: document.body.classList.contains("light-theme")
          ? "light"
          : "dark",
        bg: s.backgroundColor,
        color: s.color,
      };
    });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:8767/index.html", { waitUntil: "load" });
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 20000 },
  );
  await page.waitForTimeout(600);

  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await page.locator(".theme-toggle").click();
  await page.waitForTimeout(700);
  const light = await read();
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const box = await page.locator("#contact").boundingBox();
  await page.screenshot({
    path: ".tmp-contact-light.png",
    clip: {
      x: 0,
      y: Math.max(0, box.y - 20),
      width: 1440,
      height: Math.min(box.height + 40, 820),
    },
  });

  return { light };
}
