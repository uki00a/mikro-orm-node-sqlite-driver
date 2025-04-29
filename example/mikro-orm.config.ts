import type { Options } from "@uki00a/mikro-orm-node-sqlite-driver";
import { NodeSqliteDriver } from "@uki00a/mikro-orm-node-sqlite-driver";

import { User } from "./user.entity.ts";

const config: Options = {
  driver: NodeSqliteDriver,
  driverOptions: {
    debug: true,
  },
  dbName: "sqlite.db",
  entities: [User],
  schemaGenerator: {
    createForeignKeyConstraints: true,
  },
  debug: true,
};

export default config;
