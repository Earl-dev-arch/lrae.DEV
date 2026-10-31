export default async function run(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:8766/index.html", { waitUntil: "load" });
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 20000 },
  );
  await page.locator("#stack").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const grid = page.locator(".fan-deck .language-grid");
  await grid.click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1400);

  // advance to set 2
  await page.locator(".fan-deck .language.is-shown").nth(3).click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(700);
  await page.locator(".fan-deck .language.is-revealed .card-next").click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1500);

  // reveal 4th of set 2
  await page.locator(".fan-deck .language.is-shown").nth(3).click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(700);

  const before = await page.evaluate(() => {
    const btn = document.querySelector(
      ".fan-deck .language.is-revealed .card-next",
    );
    const r = btn.getBoundingClientRect();
    const top = document.elementFromPoint(
      r.left + r.width / 2,
      r.top + r.height / 2,
    );
    return {
      label: btn.textContent.trim(),
      rect: [
        Math.round(r.left),
        Math.round(r.top),
        Math.round(r.width),
        Math.round(r.height),
      ],
      hitTarget: top ? top.className || top.tagName : null,
      insideBtn: top ? !!top.closest(".card-next") : false,
    };
  });

  await page.locator(".fan-deck .language.is-revealed .card-next").click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1500);

  const after = await page.evaluate(() => ({
    open: document.querySelector(".fan-deck").classList.contains("is-open"),
    shown: [...document.querySelectorAll(".fan-deck .language.is-shown")].map(
      (c) => c.querySelector("h3").textContent,
    ),
    start: [...document.querySelectorAll(".fan-deck .language")].findIndex(
      (c) => c.classList.contains("is-shown"),
    ),
  }));
  return { before, after };
}
