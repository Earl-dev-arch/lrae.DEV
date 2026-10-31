export default async function run(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:8767/index.html", { waitUntil: "load" });
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 20000 },
  );
  await page.waitForTimeout(800);

  const nav = () =>
    page.evaluate(() => {
      const n = document.querySelector("nav");
      const a = n.querySelector("a");
      const ns = getComputedStyle(n);
      const as = getComputedStyle(a);
      return {
        theme: document.body.classList.contains("light-theme")
          ? "light"
          : "dark",
        nav: {
          pos: ns.position,
          radius: ns.borderRadius,
          border: ns.borderTopWidth,
          bg: ns.backgroundColor,
          pad: ns.padding,
          shadow: ns.boxShadow !== "none",
        },
        link: {
          radius: as.borderRadius,
          border: as.borderTopWidth,
          bg: as.backgroundColor,
          h: Math.round(a.getBoundingClientRect().height),
          w: Math.round(a.getBoundingClientRect().width),
        },
        contactBg: getComputedStyle(document.querySelector("#contact"))
          .backgroundColor,
      };
    });

  const dark = await nav();
  await page.screenshot({
    path: ".tmp-nav-dark.png",
    clip: { x: 0, y: 0, width: 1440, height: 90 },
  });

  await page.locator(".theme-toggle").click();
  await page.waitForTimeout(700);
  const light = await nav();
  await page.screenshot({
    path: ".tmp-nav-light.png",
    clip: { x: 0, y: 0, width: 1440, height: 90 },
  });

  // hover a nav link
  await page.locator(".theme-toggle").click();
  await page.waitForTimeout(500);
  await page.locator("nav a").first().hover();
  await page.waitForTimeout(400);
  const hover = await page.evaluate(() => {
    const a = document.querySelector("nav a");
    const s = getComputedStyle(a);
    return {
      bg: s.backgroundColor,
      border: s.borderTopWidth,
      radius: s.borderRadius,
      color: s.color,
      deco: s.textDecorationLine,
    };
  });

  return { dark, light, hover };
}
