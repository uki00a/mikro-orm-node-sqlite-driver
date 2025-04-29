// deno-fmt-ignore-file
// deno-lint-ignore-file
/**
 * Generated from https://github.com/mikro-orm/mikro-orm/blob/v6.4.13/packages/better-sqlite/src/BetterSqlitePlatform.ts which is licensed as follows:
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
 *
 */
// @ts-ignore
import sqlstringSqlite from 'sqlstring-sqlite';
import { BaseSqlitePlatform } from '@mikro-orm/knex';
import { NodeSqliteSchemaHelper } from './NodeSqliteSchemaHelper.gen.ts';
import { NodeSqliteExceptionConverter } from './NodeSqliteExceptionConverter.gen.ts';
export class NodeSqlitePlatform extends BaseSqlitePlatform {
    protected override readonly schemaHelper: NodeSqliteSchemaHelper = new NodeSqliteSchemaHelper(this);
    protected override readonly exceptionConverter = new NodeSqliteExceptionConverter();
    override escape(value: any): string {
        return sqlstringSqlite.escape(value, true, this.timezone);
    }
}
