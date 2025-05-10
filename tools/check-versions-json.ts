import versions from "../versions.json" with { type: "json" };
const decoder = new TextDecoder();
const packagesToCheck = [
  "@mikro-orm/core",
  "@mikro-orm/knex",
];

async function main(): Promise<void> {
  if (versions["mikro-orm"].startsWith("v")) {
    throw new Error("Don't prefix the version in `versions.json` with `v`.");
  }

  for (const pkg of packagesToCheck) {
    const { success, stdout, stderr } = await new Deno.Command("deno", {
      args: ["info", "--json", pkg],
    }).output();
    if (!success) {
      throw new Error(decoder.decode(stderr));
    }
    const depsInfo = JSON.parse(decoder.decode(stdout));
    const {
      modules: [{ npmPackage }],
    } = depsInfo;
    const indexOfVersionSeparator = npmPackage.lastIndexOf("@");
    if (indexOfVersionSeparator === -1) {
      throw new Error(`Unexpected output: '${npmPackage}'`);
    }
    const version = npmPackage.slice(indexOfVersionSeparator + 1);
    if (versions["mikro-orm"] !== version) {
      throw new Error(
        `Version mismatch detected for \`${pkg}\` (expected: "${
          versions["mikro-orm"]
        }", actual: "${version}").
  Align the versions of \`versions.json\` and \`${pkg}\`.`,
      );
    }
  }
}

if (import.meta.main) {
  main().catch((error) => {
    // deno-lint-ignore no-console
    console.error(error);
    Deno.exit(1);
  });
}
