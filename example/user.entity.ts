import { Entity, PrimaryKey, Property, t } from "@mikro-orm/core";

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ type: t.text })
  bio = "";
}
