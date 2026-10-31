export default async function run(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:8767/index.html", { waitUntil: "load" });
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 30000 },
  );
  await page.waitForTimeout(900);

  const state = await page.evaluate(() => {
    const btn = document.querySelector(".theme-toggle");
    const svg = btn.querySelector("svg");
    const g = document.querySelector(".fan-deck .language-grid");
    return {
      hasSvg: !!svg,
      svgVisible: svg ? svg.getBoundingClientRect().width > 0 : false,
      svgSize: svg ? Math.round(svg.getBoundingClientRect().width) : 0,
      text: btn.textContent.trim(),
      label: btn.getAttribute("aria-label"),
      pressed: btn.getAttribute("aria-pressed"),
      groundShadow: getComputedStyle(g, "::after").content,
      cardShadows: [...document.querySelectorAll(".fan-deck .language")].map(
        (c) => getComputedStyle(c).boxShadow,
      ),
    };
  });

  const tb = await page.locator(".theme-toggle").boundingBox();
  await page.screenshot({
    path: ".tmp-troll-dark.png",
    clip: { x: tb.x - 26, y: tb.y - 26, width: 86, height: 86 },
  });

  const hb = await page.locator("header").boundingBox();
  await page.screenshot({
    path: ".tmp-header-full.png",
    clip: { x: 0, y: 0, width: 1440, height: 90 },
  });

  // closed deck shot for the ground shadow
  await page.locator("#stack").scrollIntoViewIfNeeded();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(700);
  const d = await page.locator(".fan-deck").boundingBox();
  await page.screenshot({
    path: ".tmp-stack-noshadow.png",
    clip: {
      x: d.x - 60,
      y: d.y - 30,
      width: d.width + 120,
      height: d.height + 60,
    },
  });

  // toggle to light
  await page.locator(".theme-toggle").click();
  await page.waitForTimeout(700);
  const light = await page.evaluate(() => {
    const btn = document.querySelector(".theme-toggle");
    return {
      light: document.body.classList.contains("light-theme"),
      label: btn.getAttribute("aria-label"),
      hasSvg: !!btn.querySelector("svg"),
    };
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const tb2 = await page.locator(".theme-toggle").boundingBox();
  await page.screenshot({
    path: ".tmp-troll-light.png",
    clip: { x: tb2.x - 26, y: tb2.y - 26, width: 86, height: 86 },
  });

  return { errors, state, light };
}
