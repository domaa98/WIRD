import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const GIT_DIR = "C:\\Users\\hp\\AppData\\Local\\Programs\\Git";
const ZIP_PATH = path.join(GIT_DIR, "mingit.zip");
const URL = "https://github.com/git-for-windows/git/releases/download/v2.56.0.windows.3/MinGit-2.56.0.3-64-bit.zip";

async function main() {
  if (fs.existsSync(path.join(GIT_DIR, "cmd", "git.exe"))) {
    console.log("Git is already installed at:", path.join(GIT_DIR, "cmd", "git.exe"));
    return;
  }

  fs.mkdirSync(GIT_DIR, { recursive: true });
  console.log("Downloading MinGit from:", URL);
  
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(ZIP_PATH, Buffer.from(arrayBuffer));
  console.log("Downloaded successfully. Extracting...");

  execSync(`powershell -Command "Expand-Archive -Path '${ZIP_PATH}' -DestinationPath '${GIT_DIR}' -Force"`);
  fs.unlinkSync(ZIP_PATH);
  console.log("Git extracted successfully to:", GIT_DIR);

  const gitExe = path.join(GIT_DIR, "cmd", "git.exe");
  const ver = execSync(`"${gitExe}" --version`).toString().trim();
  console.log("Verified:", ver);
}

main().catch(err => {
  console.error("Error setting up git:", err);
  process.exit(1);
});
