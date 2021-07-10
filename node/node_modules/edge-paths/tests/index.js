let { getEdgeBetaPath, getEdgeCanaryPath, getEdgeDevPath, getEdgePath } = require("..")

let { execFile } = require("child_process")
const { promisify } = require("util")

// Todo when canary beta are released remove ignoredOnLinux
// variable.  And don't forget to update src/main.ts

async function check(binaryPath, shouldBe) {
  shouldBe = shouldBe.toLowerCase()

  let ignoreOnLinux = ["canary", "beta", "edge"]
  if (process.platform === "linux" && ignoreOnLinux.includes(shouldBe)) {
    return
  }

  let pth = binaryPath()
  const { stdout } = await promisify(execFile)(pth, ["--version"])

  if (stdout.trim().toLowerCase().includes(shouldBe)) {
    console.log(`Passed: ${pth}`)
  } else {
    throw `Couldn't get ${pth} working`
  }
}

async function main() {
  await check(() => getEdgeBetaPath(), "Beta")
  await check(() => getEdgeCanaryPath(), "Canary")
  await check(() => getEdgeDevPath(), "Dev")
  await check(() => getEdgePath(), "Edge")
}

main().catch((e) => {
  console.log("Error from main", e)
  // Exit so ci can notice?
  process.exit(1)
})
