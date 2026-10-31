default async function run(page) {
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'), null, { timeout: 40000 });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('#stack').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.locator('.fan-deck .language-grid').click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1500);

  const css = '.fan-deck .language.css';
  const snap = () => page.evaluate(() => ({
    revealed: [...document.querySelectorAll('.fan-deck .language.is-revealed')].map((c) => c.querySelector('h3').textContent),
    hasReveal: document.querySelector('.fan-deck').classList.contains('has-reveal'),
    opacities: [...document.querySelectorAll('.fan-deck .language.is-shown')].map((c) => getComputedStyle(c).opacity),
  }));

  await page.locator(css).click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(900);
  const opened = await snap();

  await page.locator(css).click({ force: true });
  await page.mouse.move(3, 3);
  await page.waitForTimeout(900);
  const closed = await snap();

  // click a different card -> switches
  await page.locator(css).click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(700);
  await page.locator('.fan-deck .language.react').click({ force: true });
  await page.mouse.move(3, 3);
  await page.waitForTimeout(900);
  const switched = await snap();

  return { opened, closed, switched };
}
