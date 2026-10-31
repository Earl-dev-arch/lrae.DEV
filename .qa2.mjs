export default async function run(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
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
  const shown = () =>
    page.evaluate(() =>
      [...document.querySelectorAll(".fan-deck .language.is-shown")].map(
        (c) => c.querySelector("h3").textContent,
      ),
    );
  const open = () =>
    page.evaluate(() =>
      document.querySelector(".fan-deck").classList.contains("is-open"),
    );

  await grid.click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1400);
  const s1 = await shown();

  // reveal card 4 -> next
  await page.locator(".fan-deck .language.is-shown").nth(3).click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(700);
  await page.locator(".fan-deck .language.is-revealed .card-next").click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1500);
  const s2 = await shown();

  // reveal card 4 of set 2 -> should say Stack the deck -> click -> closes
  await page.locator(".fan-deck .language.is-shown").nth(3).click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(700);
  const label = await page
    .locator(".fan-deck .language.is-revealed .card-next")
    .textContent();
  await page.locator(".fan-deck .language.is-revealed .card-next").click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1500);
  const closed = await open();
  const shownAfter = await shown();

  // mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.locator("#stack").scrollIntoViewIfNeeded();
  await grid.click();
  await page.mouse.move(2, 2);
  await page.waitForTimeout(1400);
  const mob = await page.evaluate(() => {
    const cards = [
      ...document.querySelectorAll(".fan-deck .language.is-shown"),
    ];
    const rs = cards.map((c) => c.getBoundingClientRect());
    return {
      count: cards.length,
      left: Math.round(Math.min(...rs.map((r) => r.left))),
      right: Math.round(Math.max(...rs.map((r) => r.right))),
      overflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
      titlesCut: cards
        .filter((c) => {
          const h = c.querySelector("h3");
          return h.scrollWidth > h.clientWidth;
        })
        .map((c) => c.querySelector("h3").textContent),
    };
  });
  const mb = await page.locator(".fan-deck").boundingBox();
  await page.screenshot({
    path: ".qa-mobile.png",
    clip: {
      x: 0,
      y: Math.max(0, mb.y - 20),
      width: 390,
      height: mb.height + 40,
    },
  });

  return { errors, s1, s2, label: label.trim(), closed, shownAfter, mob };
}
