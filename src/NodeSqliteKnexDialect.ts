/**
 * Forked from https://github.com/mikro-orm/mikro-orm/blob/580e7ece20fae12562bbc6a66dcc4b1ff9bb8e25/packages/knex/src/dialects/sqlite/BetterSqliteKnexDialect.ts which is licensed as follows:
 *
 * MIT License
 *
 * Copyright (c) 2018 Martin Adámek
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { MonkeyPatchable } from "@mikro-orm/knex";
import { DatabaseSync } from "node:sqlite";

/**
 * @see {@link https://github.com/knex/knex/blob/9bd12999907436c2ef51f786df09a9a7e8931cca/lib/dialects/better-sqlite3/index.js#L14-L17}
 */
interface DriverOptions {
  nativeBinding: string;
  readonly: boolean;
}
function createDatabaseSync(
  database: string,
  options: DriverOptions,
): DatabaseSync {
  return new DatabaseSync(database, {
    readOnly: options.readonly,
  });
}

export class NodeSqliteKnexDialect
  extends MonkeyPatchable.BetterSqlite3Dialect {
  get driverName() {
    return "node:sqlite";
  }

  _driver() {
    return createDatabaseSync;
  }

  /**
   * Implemented based on the following sources:
   *
   * * {@link https://github.com/knex/knex/blob/9bd12999907436c2ef51f786df09a9a7e8931cca/lib/dialects/better-sqlite3/index.js#L28 | Client_BetterSQLite3#_query}
   * * {@link https://github.com/knex/knex/blob/9bd12999907436c2ef51f786df09a9a7e8931cca/lib/dialects/sqlite3/index.js#L121 | Client_SQLite3#_query}
   *
   * They are licensed as follows:
   *
   * Copyright (c) 2013-present Tim Griesser
   *
   * Permission is hereby granted, free of charge, to any person
   * obtaining a copy of this software and associated documentation
   * files (the "Software"), to deal in the Software without
   * restriction, including without limitation the rights to use,
   * copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the
   * Software is furnished to do so, subject to the following
   * conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
   * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
   * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
   * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
   * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
   * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
   * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
   * OTHER DEALINGS IN THE SOFTWARE.
   */
  _query(
    connection: DatabaseSync,
    // deno-lint-ignore no-explicit-any
    obj: any,
  ) {
    let callMethod: "all" | "run";
    switch (obj.method) {
      case "insert":
      case "update":
        callMethod = obj.returning ? "all" : "run";
        break;
      case "counter":
      case "del":
        callMethod = "run";
        break;
      default:
        callMethod = "all";
    }
    const statement = connection.prepare(obj.sql);
    if (callMethod === "all") {
      const response = statement.all(...(obj.bindings ?? []));
      obj.response = response;
    } else {
      const response = statement.run(...(obj.bindings ?? []));
      obj.response = response;
      obj.context = {
        lastID: response.lastInsertRowid,
        changes: response.changes,
      };
    }
    return Promise.resolve(obj);
  }
}
