import type { BuildOptions } from "@deno/dnt";
import { build, emptyDir } from "@deno/dnt";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import denoJson from "../deno.json" with { type: "json" };

const kMikroORMCore = "@mikro-orm/core";
const kMikroORMKnex = "@mikro-orm/knex";
const kSqlstringSqlite = "sqlstring-sqlite";

function resolveVersionRequirement(
  specifier: keyof typeof denoJson["imports"],
): string {
  const mapped = denoJson.imports[specifier];
  const i = mapped.lastIndexOf("@");
  if (i === -1) {
    throw new Error(`'${mapped}' does not have a version constraint`);
  }
  const versionConstraint = mapped.slice(i + 1);
  if (versionConstraint.startsWith("^")) {
    return versionConstraint;
  } else if (versionConstraint.split(".").length === 0) {
    // Only a major version is specified.
    return `^${versionConstraint}.0.0`;
  } else {
    return `^${versionConstraint}`;
  }
}

/**
 * NOTE: Mapping to npm packages does not seem to be supported yet.
 * @see {@link https://github.com/denoland/dnt/issues/433}
 */
const mappings: BuildOptions["mappings"] = {
  [denoJson.imports[kMikroORMCore]]: {
    name: kMikroORMCore,
    version: resolveVersionRequirement(kMikroORMCore),
    peerDependency: true,
  },
  [denoJson.imports[kMikroORMKnex]]: {
    name: kMikroORMKnex,
    version: resolveVersionRequirement(kMikroORMKnex),
    peerDependency: false,
  },
  [denoJson.imports[kSqlstringSqlite]]: {
    name: kSqlstringSqlite,
    version: resolveVersionRequirement(kSqlstringSqlite),
    peerDependency: false,
  },
};

const rootDir = fileURLToPath(import.meta.resolve("../"));
const distDir = join(rootDir, "npm");
await emptyDir(distDir);
await build({
  entryPoints: [join(rootDir, "src/index.ts")],
  outDir: distDir,
  shims: {
    deno: {
      test: true,
    },
  },
  compilerOptions: denoJson.compilerOptions,
  package: {
    name: denoJson.name,
    version: denoJson.version,
    description: "A MikroORM driver for node:sqlite",
    license: "MIT",
    devDependencies: {
      // https://github.com/denoland/deno/commit/9d0a833e7b5574e664a3d4088dbe4e6436a71e04
      "@types/node": "^22.15.15",
    },
    repository: {
      type: "git",
      url: "git+https://github.com/uki00a/mikro-orm-node-sqlite-driver.git",
    },
    bugs: {
      url: "https://github.com/uki00a/mikro-orm-node-sqlite-driver/issues",
    },
  },
  mappings,
  rootTestDir: "./tests",
  postBuild: async () => {
    await Deno.copyFile(
      join(rootDir, ".gitignore"),
      join(distDir, ".gitignore"),
    );
  },
});
