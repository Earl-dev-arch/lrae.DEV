export default async function run(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:8767/index.html", { waitUntil: "load" });
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 30000 },
  );
  await page.waitForTimeout(700);
  await page.locator("#stack").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const shot = async (name) => {
    const b = await page.locator(".fan-deck").boundingBox();
    await page.screenshot({
      path: name,
      clip: {
        x: 240,
        y: Math.max(0, b.y - 20),
        width: 960,
        height: b.height + 50,
      },
    });
  };

  const grid = page.locator(".fan-deck .language-grid");
  await grid.click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1600);
  const s1 = await page.evaluate(() =>
    [...document.querySelectorAll(".fan-deck .language.is-shown")].map(
      (c) => c.querySelector("h3").textContent,
    ),
  );
  await shot(".tmp-f1.png");

  for (let i = 2; i <= 3; i++) {
    await page.locator(".fan-deck .language.is-shown").nth(3).click();
    await page.mouse.move(3, 3);
    await page.waitForTimeout(600);
    await page.locator(".fan-deck .language.is-revealed .card-next").click();
    await page.mouse.move(3, 3);
    await page.waitForTimeout(1600);
    await shot(`.tmp-f${i}.png`);
  }

  const s3 = await page.evaluate(() => ({
    shown: [...document.querySelectorAll(".fan-deck .language.is-shown")].map(
      (c) => c.querySelector("h3").textContent,
    ),
    btn: document
      .querySelector(".fan-deck .language.is-shown .card-next")
      .textContent.trim(),
  }));

  // wrap back to start
  await page.locator(".fan-deck .language.is-shown").nth(2).click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(600);
  await page.locator(".fan-deck .language.is-revealed .card-next").click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1600);
  const wrapped = await page.evaluate(() =>
    [...document.querySelectorAll(".fan-deck .language.is-shown")].map(
      (c) => c.querySelector("h3").textContent,
    ),
  );

  return { s1, s3, wrapped };
}
