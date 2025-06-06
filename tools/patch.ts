import { basename, join } from "node:path";
import type {
  ExportDeclaration,
  ImportDeclaration,
  SourceFile,
} from "@ts-morph/ts-morph";
import { Node, Project } from "@ts-morph/ts-morph";
import versions from "../versions.json" with { type: "json" };

const kRepository = "mikro-orm/mikro-orm";
const kVersion = `v${versions["mikro-orm"]}`;
const kPathToBasePackageSrcDir = "packages/better-sqlite/src";
const kPathToLICENSE = "LICENSE";
const kCacheDir = `tmp/${kVersion}`;
const kCacheSrcDir = `${kCacheDir}/src`;
const kOriginalClassNamePrefix = "BetterSqlite";
const kNewClassNamePrefix = "NodeSqlite";
const kOriginalDriverName = "better-sqlite3";
const kNewDriverName = "node:sqlite";
const kOriginalExtname = ".ts";
const kNewExtname = ".gen.ts";

async function main() {
  await ensureSources();
  await patchSources();
}

function log(message: string): void {
  // deno-lint-ignore no-console
  console.info(message);
}

interface PatchSourceOptions {
  filename: string;
  source: string;
  license: string;
}

async function ensureSources(): Promise<void> {
  try {
    await Deno.stat(kCacheDir);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      await cacheSources();
    } else {
      throw error;
    }
  }
}

async function cacheSources() {
  log("Downloading sources...");
  await Deno.mkdir(kCacheSrcDir, { recursive: true });
  const headers = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(Deno.env.has("GITHUB_TOKEN")
      ? { "Authorization": `Bearer ${Deno.env.get("GITHUB_TOKEN")}` }
      : undefined),
  };
  {
    // Fetch sources
    const res = await fetch(
      `https://api.github.com/repos/${kRepository}/contents/${kPathToBasePackageSrcDir}?ref=${kVersion}`,
      {
        headers,
      },
    );
    const sources = await res.json();
    if (sources.length === 0) {
      throw new Error(`No files found at '${kPathToBasePackageSrcDir}'`);
    }
    for (const source of sources) {
      const res = await fetch(source.download_url);
      const content = await res.text();
      await Deno.writeTextFile(`${kCacheSrcDir}/${source.name}`, content);
    }
  }

  {
    // Fetch LICENSE
    const res = await fetch(
      `https://api.github.com/repos/${kRepository}/contents/${kPathToLICENSE}?ref=${kVersion}`,
      {
        headers,
      },
    );
    const source = await res.json();
    const license = await fetch(source.download_url);
    const content = await license.text();
    await Deno.writeTextFile(`${kCacheDir}/${source.name}`, content);
  }
}

async function patchSources(): Promise<void> {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      allowImportingTsExtensions: true,
    },
  });

  // 1. Read cached sources
  const license = await Deno.readTextFile(join(kCacheDir, kPathToLICENSE));
  for await (const item of Deno.readDir(kCacheSrcDir)) {
    const filename = join(kCacheSrcDir, item.name);
    const source = await Deno.readTextFile(filename);
    project.createSourceFile(
      removePrefix(filename, kCacheDir),
      source,
    );
  }

  const originalNames = new Map<SourceFile, string>();
  // 2. Rename files
  for (const sourceFile of project.getSourceFiles()) {
    originalNames.set(sourceFile, sourceFile.getFilePath());
    renameSourceFile(sourceFile);
  }

  // 3. Patch files
  for (const sourceFile of project.getSourceFiles()) {
    patchSource(sourceFile, license, originalNames);
  }

  // 4. Write patched files
  for (const sourceFile of project.getSourceFiles()) {
    const path = join(".", sourceFile.getFilePath());
    const content = sourceFile.print();
    await Deno.writeTextFile(path, content);
  }
}

function patchSource(
  sourceFile: SourceFile,
  license: string,
  originalNames: Map<SourceFile, string>,
): void {
  insertHeader(sourceFile, license, originalNames);
  rewriteExportedDeclarations(sourceFile);
  rewriteStringLiterals(sourceFile);
  rewriteImportDeclarations(sourceFile);
  rewriteExportDeclarations(sourceFile);
  sourceFile.formatText();
}

function insertHeader(
  sourceFile: SourceFile,
  license: string,
  originalNames: Map<SourceFile, string>,
): void {
  const filePath = originalNames.get(sourceFile) ?? sourceFile.getFilePath();
  sourceFile.insertText(
    0,
    generateHeader({ filename: basename(filePath), license }),
  );
}

function rewriteExportedDeclarations(sourceFile: SourceFile): void {
  for (const [name, declarations] of sourceFile.getExportedDeclarations()) {
    if (!name.includes(kOriginalClassNamePrefix)) continue;
    for (const declaration of declarations) {
      if (
        Node.isClassDeclaration(declaration) ||
        Node.isInterfaceDeclaration(declaration) ||
        Node.isFunctionDeclaration(declaration) ||
        Node.isTypeAliasDeclaration(declaration)
      ) {
        const name = declaration.getName();
        if (name != null) {
          declaration.rename(
            name.replace(kOriginalClassNamePrefix, kNewClassNamePrefix),
          );
        }

        // Rewrite some APIs to conform to `no-slow-types` rule.
        if (
          Node.isFunctionDeclaration(declaration) &&
          declaration.getName() === "defineNodeSqliteConfig"
        ) {
          // Rewrite `defineNodeSqliteConfig()`
          declaration.setReturnType("NodeSqliteOptions");
        } else if (
          Node.isClassDeclaration(declaration)
        ) {
          for (const member of declaration.getMembers()) {
            if (!Node.isPropertyDeclaration(member)) continue;
            if (member.hasModifier("private")) continue;

            const initializer = member.getInitializer();
            if (initializer == null) continue;
            if (!Node.isNewExpression(initializer)) continue;
            const initializerExpression = initializer.getExpression();
            if (!Node.isIdentifier(initializerExpression)) continue;

            // Explicitly specifiy a type
            member.setType(initializerExpression.getText());
          }
        }
      }
    }
  }
}

function rewriteStringLiterals(sourceFile: SourceFile): void {
  sourceFile.forEachDescendant((node) => {
    if (
      Node.isStringLiteral(node) &&
      node.getLiteralValue() === kOriginalDriverName
    ) {
      node.setLiteralValue(kNewDriverName);
    }
  });
}

function renameSourceFile(sourceFile: SourceFile): void {
  const filePath = sourceFile.getFilePath();
  sourceFile.move(
    filePath.replace(kOriginalClassNamePrefix, kNewClassNamePrefix).replace(
      kOriginalExtname,
      kNewExtname,
    ),
  );
}

function ensureTsExtname(
  declaration: ImportDeclaration | ExportDeclaration,
): void {
  const specifier = declaration.getModuleSpecifierValue();
  // Append `.ts` if needed
  if (specifier?.startsWith("./") || specifier?.startsWith("../")) {
    declaration.setModuleSpecifier(`${specifier}.ts`);
  }
}

function rewriteImportDeclarations(sourceFile: SourceFile): void {
  for (const importDeclaration of sourceFile.getImportDeclarations()) {
    rewriteImportDeclaration(sourceFile, importDeclaration);
  }
}

function rewriteImportDeclaration(
  sourceFile: SourceFile,
  importDeclaration: ImportDeclaration,
): void {
  ensureTsExtname(importDeclaration);
  const specifier = importDeclaration.getModuleSpecifierValue();
  if (specifier === "sqlstring-sqlite") {
    rewriteImportDeclarationForSqlstringSqlite(importDeclaration);
  } else {
    for (const namedImport of importDeclaration.getNamedImports()) {
      if (namedImport.getName() === "BetterSqliteKnexDialect") {
        // Replace references to `BetterSqliteKnexDialect` with `NodeSqliteKnexDialect`
        const nameNode = namedImport.getNameNode();
        if (!Node.isIdentifier(nameNode)) continue;
        const newName = "NodeSqliteKnexDialect";
        for (
          const reference of nameNode.findReferencesAsNodes()
        ) {
          if (Node.isRenameable(reference)) {
            reference.rename(newName);
          }
        }
        namedImport.remove();
        sourceFile.addImportDeclaration({
          moduleSpecifier: "./NodeSqliteKnexDialect.ts",
          namedImports: [newName],
        });
      }
    }
  }
}

function rewriteImportDeclarationForSqlstringSqlite(
  importDeclaration: ImportDeclaration,
): void {
  const mod = "sqlstringSqlite";
  for (const namedImport of importDeclaration.getNamedImports()) {
    const nameNode = namedImport.getNameNode();
    if (!Node.isIdentifier(nameNode)) continue;

    // Rewrite call expressions
    for (
      const reference of nameNode.findReferencesAsNodes()
    ) {
      if (!Node.isRenameable(reference)) continue;

      const parent = reference.getParentOrThrow();
      if (!Node.isCallExpression(parent)) continue;
      const expression = parent.getExpression();
      if (!Node.isIdentifier(expression)) continue;
      const text = expression.getText();
      expression.replaceWithText(`${mod}.${text}`);
    }
  }
  importDeclaration.setDefaultImport(mod);
  importDeclaration.removeNamedImports();
}

function rewriteExportDeclarations(sourceFile: SourceFile): void {
  for (const exportDeclaration of sourceFile.getExportDeclarations()) {
    ensureTsExtname(exportDeclaration);

    // Enforce type-only exports for interfaces and type aliases.
    for (const namedExport of exportDeclaration.getNamedExports()) {
      const nameNode = namedExport.getNameNode();
      if (!Node.isIdentifier(nameNode)) continue;
      const definitions = nameNode.getDefinitionNodes();
      if (definitions.length === 0) continue;
      const [definition] = definitions;
      if (
        Node.isTypeAliasDeclaration(definition) ||
        Node.isInterfaceDeclaration(definition)
      ) {
        namedExport.setIsTypeOnly(true);
      }
    }
  }
}

interface GenerateHeaderOptions {
  filename: string;
  license: string;
}

function generateHeader({ license, filename }: GenerateHeaderOptions): string {
  const header = `// deno-fmt-ignore-file
// deno-lint-ignore-file
/**
 * Generated from https://github.com/${kRepository}/blob/${kVersion}/${kPathToBasePackageSrcDir}/${filename} which is licensed as follows:
 *
${license.split("\n").map((line) => ` * ${line}`).join("\n")}
 */
`;
  return header;
}

function removePrefix(s: string, prefix: string): string {
  if (s.startsWith(prefix)) {
    return s.slice(prefix.length);
  } else {
    return s;
  }
}

if (import.meta.main) {
  main().catch((error) => {
    // deno-lint-ignore no-console
    console.error(error);
    Deno.exit(1);
  });
}
