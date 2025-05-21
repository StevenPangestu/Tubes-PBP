import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";

import { v4 } from "uuid";
import { CollectionPost } from "./CollectionPost";
import { Post } from "./Post";
import { User } from "./User";

@Table({
  tableName: "Collection",
  timestamps: false
})
export class Collection extends Model {
  //collection_id
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: () => v4(),
  })
  declare collection_id: string;

  //user_id (FK)
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    field: "user_id",
    allowNull: false,
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  //collection_name
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare collection_name: string;

  //createdAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @BelongsToMany(() => Post, () => CollectionPost)
  declare posts?: Post[];
}
