export default async function run(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:8768/index.html", { waitUntil: "load" });
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 40000 },
  );
  await page.waitForTimeout(600);

  const info = await page.evaluate(() => ({
    stackGone: !document.getElementById("stack"),
    sections: [...document.querySelectorAll("main section")].map(
      (s) => s.id || s.className,
    ),
    navLinks: [...document.querySelectorAll("nav a")].map((a) =>
      a.getAttribute("href"),
    ),
    lanyard: !!document.querySelector("[data-lanyard]"),
    badgeVisible: (() => {
      const b = document.querySelector("[data-badge]");
      return b ? b.getBoundingClientRect().width > 0 : false;
    })(),
    overflow:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
    height: document.body.scrollHeight,
  }));

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({
    path: ".tmp-top.png",
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  });

  await page.locator("#work").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: ".tmp-mid.png",
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  });

  return { errors, info };
}
