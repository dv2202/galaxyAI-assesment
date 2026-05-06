import {
  task
} from "./chunk-RL6IIOUT.mjs";
import {
  __commonJS,
  __name,
  __require,
  __toESM,
  init_esm
} from "./chunk-FUV6SSYK.mjs";

// node_modules/.pnpm/ffmpeg-static@5.3.0/node_modules/ffmpeg-static/package.json
var require_package = __commonJS({
  "node_modules/.pnpm/ffmpeg-static@5.3.0/node_modules/ffmpeg-static/package.json"(exports, module) {
    module.exports = {
      name: "ffmpeg-static",
      version: "5.3.0",
      description: "ffmpeg binaries for macOS, Linux and Windows",
      scripts: {
        install: "node install.js",
        prepublishOnly: "npm run install"
      },
      "ffmpeg-static": {
        "binary-path-env-var": "FFMPEG_BIN",
        "binary-release-tag-env-var": "FFMPEG_BINARY_RELEASE",
        "binary-release-tag": "b6.1.1",
        "binaries-url-env-var": "FFMPEG_BINARIES_URL",
        "executable-base-name": "ffmpeg"
      },
      repository: {
        type: "git",
        url: "https://github.com/eugeneware/ffmpeg-static"
      },
      keywords: [
        "ffmpeg",
        "static",
        "binary",
        "binaries",
        "mac",
        "linux",
        "windows"
      ],
      authors: [
        "Eugene Ware <eugene@noblesamurai.com>",
        "Jannis R <mail@jannisr.de>"
      ],
      contributors: [
        "Thefrank (https://github.com/Thefrank)",
        "Emil Sivervik <emil@sivervik.com>"
      ],
      license: "GPL-3.0-or-later",
      bugs: {
        url: "https://github.com/eugeneware/ffmpeg-static/issues"
      },
      engines: {
        node: ">=16"
      },
      dependencies: {
        "@derhuerst/http-basic": "^8.2.0",
        "env-paths": "^2.2.0",
        "https-proxy-agent": "^5.0.0",
        progress: "^2.0.3"
      },
      devDependencies: {
        "any-shell-escape": "^0.1.1"
      },
      main: "index.js",
      files: [
        "index.js",
        "install.js",
        "example.js",
        "types"
      ],
      types: "types/index.d.ts"
    };
  }
});

// node_modules/.pnpm/ffmpeg-static@5.3.0/node_modules/ffmpeg-static/index.js
var require_ffmpeg_static = __commonJS({
  "node_modules/.pnpm/ffmpeg-static@5.3.0/node_modules/ffmpeg-static/index.js"(exports, module) {
    "use strict";
    init_esm();
    var pkg = require_package();
    var {
      "binary-path-env-var": BINARY_PATH_ENV_VAR,
      "executable-base-name": executableBaseName
    } = pkg[pkg.name];
    if ("string" !== typeof BINARY_PATH_ENV_VAR) {
      throw new Error(`package.json: invalid/missing ${pkg.name}.binary-path-env-var entry`);
    }
    if ("string" !== typeof executableBaseName) {
      throw new Error(`package.json: invalid/missing ${pkg.name}.executable-base-name entry`);
    }
    if (process.env[BINARY_PATH_ENV_VAR]) {
      module.exports = process.env[BINARY_PATH_ENV_VAR];
    } else {
      os = __require("os");
      path = __require("path");
      binaries = Object.assign(/* @__PURE__ */ Object.create(null), {
        darwin: ["x64", "arm64"],
        freebsd: ["x64"],
        linux: ["x64", "ia32", "arm64", "arm"],
        win32: ["x64", "ia32"]
      });
      platform = process.env.npm_config_platform || os.platform();
      arch = process.env.npm_config_arch || os.arch();
      let binaryPath = path.join(
        __dirname,
        executableBaseName + (platform === "win32" ? ".exe" : "")
      );
      if (!binaries[platform] || binaries[platform].indexOf(arch) === -1) {
        binaryPath = null;
      }
      module.exports = binaryPath;
    }
    var os;
    var path;
    var binaries;
    var platform;
    var arch;
  }
});

// src/trigger/crop-image.ts
init_esm();
var import_ffmpeg_static = __toESM(require_ffmpeg_static());
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
var execFileAsync = promisify(execFile);
var cropImageTask = task({
  id: "crop-image",
  maxDuration: 120,
  run: /* @__PURE__ */ __name(async (payload) => {
    const { imageUrl, xPosition, yPosition, width, height } = payload;
    if (!imageUrl) {
      throw new Error("imageUrl is empty — the image field has no value. Make sure an image is uploaded before executing.");
    }
    const tempDir = await mkdtemp(join(tmpdir(), "crop-"));
    const inputPath = join(tempDir, "input.png");
    const outputPath = join(tempDir, "output.png");
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(inputPath, buffer);
      const cropFilter = `crop=iw*${width / 100}:ih*${height / 100}:iw*${xPosition / 100}:ih*${yPosition / 100}`;
      await execFileAsync(import_ffmpeg_static.default, [
        "-i",
        inputPath,
        "-vf",
        cropFilter,
        "-y",
        outputPath
      ]);
      await new Promise((resolve) => setTimeout(resolve, 3e4));
      const outputBuffer = await readFile(outputPath);
      return `data:image/png;base64,${outputBuffer.toString("base64")}`;
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, "run")
});

export {
  cropImageTask
};
//# sourceMappingURL=chunk-MG463VAI.mjs.map
