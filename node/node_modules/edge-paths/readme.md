# Edge Paths

[![npm version](https://img.shields.io/npm/v/edge-paths.svg)](https://www.npmjs.com/package/edge-paths)
[![Downloads](https://img.shields.io/npm/dm/edge-paths.svg)](https://npmjs.com/edge-paths)
[![Install size](https://packagephobia.now.sh/badge?p=edge-paths)](https://packagephobia.now.sh/result?p=edge-paths)
![Test Edge Paths](https://github.com/shirshak55/edge-paths/workflows/Test%20Edge%20Paths/badge.svg)

Possible paths or binary names of [Edge](https://www.microsoft.com/en-us/edge) in the current platform

### Why?

- Well Documented
- Well Tested
- Used by popular players
- Written with Love <3
- Fully open sourced

### Usage

- At the moment linux support is only avail for dev channel. Once canary, beta and stable version are release
  we shall update the package.

###### Javascript

```javascript
let {
  getEdgeBetaPath,
  getEdgeCanaryPath,
  getEdgeDevPath,
  getEdgePath,
  getAnyEdgeStable,
  getAnyEdgeLatest,
} = require("edge-paths")

console.log(getEdgeBetaPath())
console.log(getEdgeCanaryPath())
console.log(getEdgeDevPath())
console.log(getEdgePath())
// console.log(getAnyEdgeStable())
// console.log(getAnyEdgeLatest())
```

The output shall look like this according to your installation

```javascript
// On OSX
// /Applications/Microsoft Edge Beta.app/Contents/MacOS/Microsoft Edge Beta
// /Applications/Microsoft Edge Canary.app/Contents/MacOS/Microsoft Edge Canary
// /Applications/Microsoft Edge Beta.app/Contents/MacOS/Microsoft Edge Dev
// /Applications/Microsoft Edge Beta.app/Contents/MacOS/Microsoft Edge

// On Windows
// C:\Program Files (x86)\Microsoft\Edge Beta\Application\msedge.exe
// C:\Program Files (x86)\Microsoft\Edge Canary\Application\msedge.exe
// C:\Program Files (x86)\Microsoft\Edge Dev\Application\msedge.exe
// C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe

// On Linux
// Beta edge not avail yet
// Canary not avail
// /usr/bin/microsoft-edge-dev
// Stable not avail
```

###### Typescript

```typescript
import { getEdgeBetaPath, getEdgeCanaryPath, getEdgeDevPath, getEdgePath } from "edge-paths"

console.log(getEdgeBetaPath())
console.log(getEdgeCanaryPath())
console.log(getEdgeDevPath())
console.log(getEdgePath())
```

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/about-npm/).

```bash
$ npm install edge-paths

// or

$ yarn add edge-paths
```

## API

```javascript
let {
  getEdgeBetaPath,
  getEdgeCanaryPath,
  getEdgeDevPath,
  getEdgePath,
  getAnyEdgeStable,
  getAnyEdgeLatest,
} = require("edge-paths")
```

- `getAnyEdgeStable` or `getAnyEdgeLatest` might be more useful if you don't want any specific version.

## Used By

- [devtools](https://www.npmjs.com/package/devtools)

- Please send PR if you are using edge paths. We will be accepting first 10 request.

## License

[MIT License](./LICENSE)

© 2020 Shirshak Bajgain
