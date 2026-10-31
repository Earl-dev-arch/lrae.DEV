export default async function run(page) {
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:8766/index.html", { waitUntil: "load" });

  // --- 1. Splash: sample the visible greeting over time
  const samples = [];
  const t0 = Date.now();
  for (let i = 0; i < 16; i++) {
    const state = await page.evaluate(() => {
      const spans = [...document.querySelectorAll(".intro-kicker span")];
      const visible = spans.filter(
        (s) => parseFloat(getComputedStyle(s).opacity) > 0.5,
      );
      return {
        text: visible.map((s) => s.textContent.trim()).join("|"),
        hidden: document
          .querySelector(".intro-screen")
          .classList.contains("is-hidden"),
        loading: document.body.classList.contains("is-loading"),
      };
    });
    samples.push({ ms: Date.now() - t0, ...state });
    if (state.hidden && i > 3) break;
    await page.waitForTimeout(500);
  }

  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 40000 },
  );
  await page.waitForTimeout(700);

  // --- 2. Deck: reveal 4th card, use its next button, then close
  await page.locator("#stack").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const grid = page.locator(".fan-deck .language-grid");
  await grid.click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1500);

  const shown = () =>
    page.evaluate(() =>
      [...document.querySelectorAll(".fan-deck .language.is-shown")].map(
        (c) => c.querySelector("h3").textContent,
      ),
    );

  const set1 = await shown();

  // reveal the 4th card
  await page.locator(".fan-deck .language.is-shown").nth(3).click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(900);
  const revealed = await page.evaluate(() => {
    const c = document.querySelector(".fan-deck .language.is-revealed");
    const btn = c && c.querySelector(".card-next");
    return {
      card: c ? c.querySelector("h3").textContent : null,
      btnVisible: btn ? getComputedStyle(btn).display !== "none" : false,
      btnLabel: btn ? btn.textContent.trim() : null,
    };
  });

  const b = await page.locator(".fan-deck").boundingBox();
  await page.screenshot({
    path: ".qa-reveal4.png",
    clip: {
      x: Math.max(0, b.x - 40),
      y: Math.max(0, b.y - 20),
      width: Math.min(1440, b.width + 80),
      height: b.height + 40,
    },
  });

  // click the next control inside the 4th card
  await page.locator(".fan-deck .language.is-revealed .card-next").click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1600);
  const set2 = await shown();
  const afterNext = await page.evaluate(() => ({
    revealed: document.querySelectorAll(".fan-deck .language.is-revealed")
      .length,
    hasReveal: document
      .querySelector(".fan-deck")
      .classList.contains("has-reveal"),
    btnLabel: document
      .querySelector(".fan-deck .language.is-shown .card-next")
      .textContent.trim(),
  }));
  const b2 = await page.locator(".fan-deck").boundingBox();
  await page.screenshot({
    path: ".qa-set2.png",
    clip: {
      x: Math.max(0, b2.x - 40),
      y: Math.max(0, b2.y - 20),
      width: Math.min(1440, b2.width + 80),
      height: b2.height + 40,
    },
  });

  return { errors, splash: samples, set1, revealed, set2, afterNext };
}
