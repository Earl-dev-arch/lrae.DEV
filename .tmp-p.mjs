export default async function run(page) {
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 40000 },
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator("#stack").scrollIntoViewIfNeeded();
  await page.locator(".fan-deck .language-grid").click();
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1500);
  return page.evaluate(() => {
    const card = document.querySelector(".fan-deck .language.is-shown");
    const p = card.querySelector("p");
    const h3 = card.querySelector("h3");
    const cr = card.getBoundingClientRect();
    const pr = p.getBoundingClientRect();
    const hr = h3.getBoundingClientRect();
    const rules = [];
    for (const s of document.styleSheets) {
      let rr;
      try {
        rr = s.cssRules;
      } catch {
        continue;
      }
      for (const r of rr) {
        if (!r.selectorText) continue;
        if (!/\.language\s+p|\.language p\b/.test(r.selectorText)) continue;
        try {
          if (p.matches(r.selectorText))
            rules.push([r.selectorText, r.style.cssText.slice(0, 160)]);
        } catch {}
      }
    }
    return {
      card: [Math.round(cr.left), Math.round(cr.width), Math.round(cr.height)],
      h3: [
        Math.round(hr.left),
        Math.round(hr.top),
        Math.round(hr.width),
        Math.round(hr.height),
      ],
      p: [
        Math.round(pr.left),
        Math.round(pr.top),
        Math.round(pr.width),
        Math.round(pr.height),
      ],
      pScrollW: p.scrollWidth,
      cardOverflow: getComputedStyle(card).overflow,
      rules,
    };
  });
}
