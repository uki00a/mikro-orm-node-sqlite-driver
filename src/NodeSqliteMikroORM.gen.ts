// deno-fmt-ignore-file
// deno-lint-ignore-file
/**
 * Generated from https://github.com/mikro-orm/mikro-orm/blob/v6.4.15/packages/better-sqlite/src/BetterSqliteMikroORM.ts which is licensed as follows:
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
import { defineConfig, MikroORM, type Options, type IDatabaseDriver, type EntityManager, type EntityManagerType, } from '@mikro-orm/core';
import { NodeSqliteDriver } from './NodeSqliteDriver.gen.ts';
import type { SqlEntityManager } from '@mikro-orm/knex';
/**
 * @inheritDoc
 */
export class NodeSqliteMikroORM<EM extends EntityManager = SqlEntityManager> extends MikroORM<NodeSqliteDriver, EM> {
    private static DRIVER = NodeSqliteDriver;
    /**
     * @inheritDoc
     */
    static override async init<D extends IDatabaseDriver = NodeSqliteDriver, EM extends EntityManager = D[typeof EntityManagerType] & EntityManager>(options?: Options<D, EM>): Promise<MikroORM<D, EM>> {
        return super.init(options);
    }
    /**
     * @inheritDoc
     */
    static override initSync<D extends IDatabaseDriver = NodeSqliteDriver, EM extends EntityManager = D[typeof EntityManagerType] & EntityManager>(options: Options<D, EM>): MikroORM<D, EM> {
        return super.initSync(options);
    }
}
export type NodeSqliteOptions = Options<NodeSqliteDriver>;
/* istanbul ignore next */
export function defineNodeSqliteConfig(options: NodeSqliteOptions): NodeSqliteOptions {
    return defineConfig({ driver: NodeSqliteDriver, ...options });
}
