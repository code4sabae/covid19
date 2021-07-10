import fs from "fs"
import path from "path"
import which from "which"

let platform = process.platform

function getEdgeLinux(binaryNames: Array<string> | string): string | null {
  if (process.platform !== "linux") {
    return null
  }

  if (!Array.isArray(binaryNames)) {
    binaryNames = [binaryNames]
  }

  let paths = []

  for (let name of binaryNames) {
    try {
      let path = which.sync(name)
      return path
    } catch (e) {
      // This means path doesn't exists
      paths.push(name)
    }
  }

  throw {
    package: "edge-paths",
    message:
      "Edge browser not found. Please recheck your installation. \
      Here are list of executable we tried to search",
    paths,
  }
}

function getEdgeExe(edgeDirName: "Edge" | "Edge Dev" | "Edge Beta" | "Edge SxS"): string | null {
  if (process.platform !== "win32") {
    return null
  }

  let paths = []
  let suffix = `\\Microsoft\\${edgeDirName}\\Application\\msedge.exe`
  let prefixes = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"]].filter(
    (v) => !!v,
  )

  for (let prefix of prefixes) {
    let edgePath = path.join(prefix!, suffix)
    paths.push(edgePath)
    if (fs.existsSync(edgePath)) {
      return edgePath
    }
  }

  throw {
    package: "edge-paths",
    message: "Edge browser not found. Please recheck your installation.",
    paths,
  }
}

function getEdgeDarwin(defaultPath: string): string | null {
  if (process.platform !== "darwin") {
    return null
  }

  if (fs.existsSync(defaultPath)) {
    return defaultPath
  }

  throw {
    package: "edge-paths",
    message: `Edge browser not found. Please recheck your installation. Path ${defaultPath}`,
    path: defaultPath,
  }
}

export function getEdgePath() {
  let edge = {
    linux: getEdgeLinux(["edge"]),
    darwin: getEdgeDarwin("/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"),
    win32: getEdgeExe("Edge"),
  }

  if (platform && platform in edge) {
    //@ts-ignore
    return edge[platform]
  }
  throwInvalidPlatformError()
}

export function getEdgeDevPath() {
  let edgeDev = {
    linux: getEdgeLinux("microsoft-edge-dev"),
    darwin: getEdgeDarwin("/Applications/Microsoft Edge Dev.app/Contents/MacOS/Microsoft Edge Dev"),
    win32: getEdgeExe("Edge Dev"),
  }

  if (platform && platform in edgeDev) {
    //@ts-ignore
    return edgeDev[platform]
  }
  throwInvalidPlatformError()
}

export function getEdgeBetaPath() {
  let edgeBeta = {
    // linux: getBin(["edge", "edge-stable"]),
    darwin: getEdgeDarwin("/Applications/Microsoft Edge Beta.app/Contents/MacOS/Microsoft Edge Beta"),
    win32: getEdgeExe("Edge Beta"),
  }

  if (platform && platform in edgeBeta) {
    //@ts-ignore
    return edgeBeta[platform]
  }
  throwInvalidPlatformError()
}

export function getEdgeCanaryPath() {
  let edgeCanary = {
    // linux: getBin(["edge-canary", "edge-unstable"]),
    darwin: getEdgeDarwin("/Applications/Microsoft Edge Canary.app/Contents/MacOS/Microsoft Edge Canary"),
    win32: getEdgeExe("Edge SxS"),
  }

  if (platform && platform in edgeCanary) {
    //@ts-ignore
    return edgeCanary[platform]
  }
  throwInvalidPlatformError()
}

// This will try to get any edge from bleeding edge to most stable version
export function getAnyEdgeLatest(): string {
  try {
    return getEdgeCanaryPath()
  } catch (e) {}

  try {
    return getEdgeDevPath()
  } catch (e) {}

  try {
    return getEdgeBetaPath()
  } catch (e) {}

  try {
    return getEdgeDevPath()
  } catch (e) {}

  throw {
    package: "edge-paths",
    message: `Unable to find any path`,
  }
}

// This will try to get edge from stable version to bleeding version
// Useful for playwright, puppeteer related stuff
export function getAnyEdgeStable(): string {
  try {
  } catch (e) {
    return getEdgePath()
  }

  try {
    return getEdgeBetaPath()
  } catch (e) {}

  try {
    return getEdgeDevPath()
  } catch (e) {}

  try {
    return getEdgeCanaryPath()
  } catch (e) {}

  throw {
    package: "edge-paths",
    message: `Unable to find any path`,
  }
}

// Helpers
function throwInvalidPlatformError() {
  throw {
    package: "edge-paths",
    message: "Your platform is not supported. Only mac and windows are supported currently",
  }
}

// With this you can directly do node dist/main.js
// (dist/main.js) instead of src/main.ts because
// typescript compiler ultimately returns javascript not typescript
// However you can try ts node if you want to execute
// typescript directly
if (require.main === module) {
  function findEdge(func: () => undefined) {
    try {
      let path = func()
      console.log("Found path", path)
    } catch (e) {
      console.log("Error on finding path", e)
    }
  }
  findEdge(() => getEdgeBetaPath())
  findEdge(() => getEdgeCanaryPath())
  findEdge(() => getEdgeDevPath())
  findEdge(() => getEdgePath())
}
