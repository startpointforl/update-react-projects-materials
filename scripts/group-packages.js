const fs = require("node:fs");

/**
 * Скрипт для группировки связанных пакетов, которые требуют major-обновлений.
 *
 * Что делает:
 * 1. Читает результат `npm-check-updates --format group` (разбивка по Patch/Minor/Major).
 * 2. Читает `npm ls --depth=1 --json` и строит карту вложенных зависимостей.
 * 3. Строит граф связанных major-пакетов.
 * 4. Возвращает изолированные группы — то есть пакеты, которые лучше обновлять вместе.
 * 5. Дополняет вывод версиями: текущими и целевыми.
 *
 * Для корректной работы требуется подготовить следующие файлы:
 * - `npm-check-updates`            → `npx npm-check-updates --format group > npm-check-updates`
 * - `npmlist.json`                 → `npm ls --depth=1 --json > npmlist.json`
 * - `package-updates.json`        → `npx npm-check-updates --jsonAll > package-updates.json`
 * А также файл `package.json` с текущими версиями пакетов.
 *
 * Результат: файл `result.json` с массивом массивов:
 * [
 *   ["eslint: 8.4.0 → 9.0.0", "@typescript-eslint/parser: 5.6.0 → 6.0.0"],
 *   ...
 * ]
 */

const npmCheckUpdatesFile = "npm-check-updates";
const npmlistJsonFile = "npmlist.json";
const packageUpdatesJsonFile = "package-updates.json";
const packageJsonFile = "package.json";
const resultJsonFile = "result.json";

const blockNames = ["Patch", "Minor", "Major"];

function readUpdatesPackages() {
  try {
    const data = fs.readFileSync(npmCheckUpdatesFile, {
      encoding: "utf8",
      flag: "r",
    });
    const lines = data.split("\n");
    let isInsideSection = false;
    let blockName = "";
    const blocks = {};

    for (let line of lines) {
      if (isInsideSection) {
        if (!line) {
          isInsideSection = false;
        } else {
          const packageNameMatch = line.match(/[a-z@\/-]+/);
          if (!packageNameMatch) {
            console.warn("Not found package name in line: ", line);
          } else {
            blocks[blockName]?.push(packageNameMatch[0]);
          }
        }
      } else {
        const newBlockName = blockNames.find((name) => line.includes(name));
        if (newBlockName) {
          isInsideSection = true;
          blockName = newBlockName;
          if (!blocks[blockName]) {
            blocks[blockName] = [];
          }
        } else {
          console.warn("Not found block name in line: ", line);
        }
      }
    }

    return blocks;
  } catch {
    console.error(
      "Ошибка чтения файла npm-check-updates. Чтобы создать файл выполните команду: npx npm-check-updates --format group > npm-check-updates"
    );
  }
}

function getAllDeps() {
  try {
    const data = fs.readFileSync(npmlistJsonFile, {
      encoding: "utf8",
      flag: "r",
    });
    const dataJson = JSON.parse(data);
    const dependencies = dataJson?.dependencies || {};

    return dependencies;
  } catch {
    console.error(
      "Ошибка чтения файла npmlist.json. Чтобы создать файл выполните команду: npm ls --depth=1 --json > npmlist.json"
    );
  }
}

function filterDeps(allDeps, filterNames) {
  const result = {};

  for (let rootPackage in allDeps) {
    if (filterNames.includes(rootPackage)) {
      result[rootPackage] = {
        rootUpdate: true,
      };
    }

    for (let innerPackage in allDeps[rootPackage].dependencies) {
      if (filterNames.includes(innerPackage)) {
        if (!result[rootPackage]) {
          result[rootPackage] = {};
        }

        if (!result[rootPackage].dependencies) {
          result[rootPackage].dependencies = [];
        }

        result[rootPackage].dependencies.push(innerPackage);
      }
    }
  }

  return result;
}

function buildDependencyGraph(packages) {
  const graph = {};

  // Initialize the graph
  for (const pkg in packages) {
    if (!graph[pkg]) {
      graph[pkg] = new Set();
    }

    const dependencies = packages[pkg] || [];
    for (const dep of dependencies) {
      if (!graph[dep]) {
        graph[dep] = new Set();
      }
      // Add a dependency link
      graph[pkg].add(dep);
    }
  }
  return graph;
}

function findConnectedComponents(graph) {
  const visited = new Set();
  const components = [];

  function dfs(node, component) {
    visited.add(node);
    component.push(node);

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, component);
      }
    }
  }

  for (const node in graph) {
    if (!visited.has(node)) {
      const component = [];
      dfs(node, component);
      components.push(component);
    }
  }

  return components;
}

function reverseDependencies(packages) {
  const reversedGraph = {};

  // Initialize the reversed graph with all packages
  for (const pkg in packages) {
    if (!reversedGraph[pkg]) {
      reversedGraph[pkg] = [];
    }

    const dependencies = packages[pkg].dependencies || [];
    for (const dep of dependencies) {
      if (!reversedGraph[dep]) {
        reversedGraph[dep] = [];
      }
      reversedGraph[dep].push(pkg);
    }
  }
  return reversedGraph;
}

function addVersions(components) {
  let currentDependenciesVersions = {};
  try {
    const currentVersions = fs.readFileSync(packageJsonFile, {
      encoding: "utf8",
      flag: "r",
    });
    const currentVersionsJson = JSON.parse(currentVersions);
    currentDependenciesVersions = {
      ...(currentVersionsJson?.dependencies || {}),
      ...(currentVersionsJson?.devDependencies || {}),
    };
  } catch {
    console.error(
      "Ошибка чтения файла package.json. Пожалуйста, убедитесь, что файл существует и содержит версии пакетов."
    );
  }

  try {
    const newVersions = fs.readFileSync(packageUpdatesJsonFile, {
      encoding: "utf8",
      flag: "r",
    });
    const newVersionsJson = JSON.parse(newVersions);
    const newDependenciesVersions = {
      ...(newVersionsJson?.dependencies || {}),
      ...(newVersionsJson?.devDependencies || {}),
    };

    return components.map((component) => {
      return component.map(
        (packageName) =>
          `${packageName}: ${currentDependenciesVersions[packageName]} -> ${newDependenciesVersions[packageName]}`
      );
    });
  } catch {
    console.error(
      "Ошибка чтения файла package-updates.json.  Чтобы создать файл выполните команду: npx npm-check-updates --jsonAll > package-updates.json"
    );
  }
}

const blocks = readUpdatesPackages();
const dependencies = getAllDeps();
const packages = filterDeps(dependencies, blocks["Major"]);

const graph = buildDependencyGraph(reverseDependencies(packages));
const components = addVersions(findConnectedComponents(graph));
console.log("Изолированные группы пакетов:", components);

fs.writeFileSync(resultJsonFile, JSON.stringify(components));
