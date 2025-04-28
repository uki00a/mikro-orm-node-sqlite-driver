// deno-fmt-ignore-file
// deno-lint-ignore-file
/**
 * Generated from https://github.com/mikro-orm/mikro-orm/blob/v6.4.13/packages/better-sqlite/src/BetterSqliteDriver.ts which is licensed as follows:
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
import type { Configuration } from '@mikro-orm/core';
import { AbstractSqlDriver } from '@mikro-orm/knex';
import { NodeSqliteConnection } from './NodeSqliteConnection.gen.ts';
import { NodeSqlitePlatform } from './NodeSqlitePlatform.gen.ts';
export class NodeSqliteDriver extends AbstractSqlDriver<NodeSqliteConnection> {
    constructor(config: Configuration) {
        super(config, new NodeSqlitePlatform(), NodeSqliteConnection, ['knex', 'node:sqlite']);
    }
}
