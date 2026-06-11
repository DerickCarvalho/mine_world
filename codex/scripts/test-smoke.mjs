import process from "node:process";

const base = process.env.MINEWORLD_BASE_URL || "http://mine_world.test";
const cases = [
  { path: "/login.php", expected: 200 },
  { path: "/index.php?page=menu", expected: 200 },
  { path: "/api/login/validar.php", expected: 401 }
];

let failures = 0;
for (const item of cases) {
  try {
    const response = await fetch(`${base}${item.path}`, { redirect: "manual" });
    if (response.status !== item.expected) {
      failures++;
      console.error(`FAIL ${item.path}: esperado ${item.expected}, recebido ${response.status}.`);
    } else {
      console.log(`PASS ${item.path}: ${response.status}`);
    }
  } catch (error) {
    failures++;
    console.error(`FAIL ${item.path}: ${error.message}`);
  }
}
if (failures) process.exitCode = 1;
