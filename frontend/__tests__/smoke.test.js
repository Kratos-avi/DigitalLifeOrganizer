const fs = require("fs");
const path = require("path");

describe("frontend project smoke checks", () => {
  const root = path.resolve(__dirname, "..");

  test("core html pages exist", () => {
    const pages = [
      "index.html",
      "register.html",
      "newcomer.html",
      "admin.html",
      "deadlines.html",
      "announcements.html",
      "profile.html",
      "study-schedule.html",
      "work-schedule.html",
    ];

    for (const page of pages) {
      expect(fs.existsSync(path.join(root, page))).toBe(true);
    }
  });

  test("core javascript files exist", () => {
    const scripts = ["api.js", "auth.js", "navbar.js", "tasks.js", "ui.js"];

    for (const script of scripts) {
      expect(fs.existsSync(path.join(root, "js", script))).toBe(true);
    }
  });
});
