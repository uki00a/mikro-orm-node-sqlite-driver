import assert from "node:assert/strict";

import { MikroORM } from "@uki00a/mikro-orm-node-sqlite-driver";

import config from "../example/mikro-orm.config.ts";
import { User } from "../example/user.entity.ts";

Deno.test("integration", async (t) => {
  const orm = await MikroORM.init(config);
  await orm.schema.refreshDatabase();
  await t.step("CRUD", async () => {
    const user = new User();
    user.name = "foo";
    user.bio = "Hello";

    {
      const em = orm.em.fork();
      em.persist(user);
      await em.flush();
      assert.ok(user.id);
    }

    {
      const em = orm.em.fork();
      const found = await em.findOne(User, user.id);
      assert.ok(found);
      found.name = "bar";
      em.persist(found);
      await em.flush();
    }

    {
      const em = orm.em.fork();
      const found = await em.findOne(User, user.id);
      assert.ok(found);
      assert.equal(found.name, "bar");
      em.remove(found);
      await em.flush();
    }

    {
      const em = orm.em.fork();
      const found = await em.findOne(User, user.id);
      assert(found == null);
    }
  });
  await orm.close();
  if (config.dbName) {
    await Deno.remove(config.dbName);
  }
});
