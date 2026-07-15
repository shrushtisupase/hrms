import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

try {
  console.log("extending dayjs...");
  dayjs.extend(utc);
  console.log("extended. checking dayjs.utc function...");
  console.log("dayjs.utc is type:", typeof dayjs.utc);
  const d = dayjs.utc("2026-07-14");
  console.log("parsed utc date:", d.format());
  process.exit(0);
} catch (err) {
  console.error("error testing dayjs:", err);
  process.exit(1);
}
