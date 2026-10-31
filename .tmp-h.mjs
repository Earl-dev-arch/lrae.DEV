export default async function run(page) {
  await page.goto("http://localhost:8768/index.html", { waitUntil: "load" });
  await page.waitForFunction(
    () => !document.body.classList.contains("is-loading"),
    null,
    { timeout: 30000 },
  );

  const out = [];
  for (const w of [320, 360, 390, 430, 650, 768, 1440]) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.waitForTimeout(350);
    out.push(
      await page.evaluate(() => {
        const h = document.querySelector("#stack .section-title");
        const s = getComputedStyle(h);
        const r = h.getBoundingClientRect();
        const sec = document.querySelector("#stack");
        const sr = sec.getBoundingClientRect();
        const pad = parseFloat(getComputedStyle(sec).paddingLeft);
        // widest child line
        const spans = [...h.childNodes].filter(
          (n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()),
        );
        return {
          vw: innerWidth,
          fs: s.fontSize,
          headingW: Math.round(r.width),
          contentW: Math.round(sr.width - pad * 2),
          scrollW: h.scrollWidth,
          overflows: h.scrollWidth > Math.ceil(h.clientWidth),
          docOverflow:
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        };
      }),
    );
  }
  return out;
}
