const fs = require("fs");
const file = "index.html";
const src = fs.readFileSync(file, "utf8");

const startMarker = "<!-- STACK_START_MARKER -->";
const start = src.indexOf(startMarker);
if (start < 0) {
  console.error("start marker not found");
  process.exit(1);
}

// The section ends at the closing </section> that follows the marker
const endTag = "</section>";
const end = src.indexOf(endTag, start);
if (end < 0) {
  console.error("end tag not found");
  process.exit(1);
}

const removed = src.slice(start, end + endTag.length);
const next = src.slice(0, start) + src.slice(end + endTag.length);

fs.writeFileSync(file, next, "utf8");
console.log("removed", removed.length, "chars");
console.log("stack section still present:", next.includes('id="stack"'));
