import {
  Table,
  Column,
  DataType,
  Model,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";

import { v4 } from "uuid";
import { Collection } from "./Collection";
import { Post } from "./Post";  

@Table({
  tableName: "CollectionPost",
  timestamps: true,
  createdAt: "createdAt",
})
export class ColletionPost extends Model {
  //collection_post_id
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: v4(),
  })
  declare collection_post_id: string;

  //collection_id (FK)
  @ForeignKey(() => Collection)
  @Column({
    type: DataType.UUID,
    field: "collection_id",
    allowNull: false,
  })
  declare collection_id: string;

  @BelongsTo(() => Collection)
  declare collection: Collection;

  //post_id (FK)
  @ForeignKey(() => Post)
  @Column({
    type: DataType.UUID,
    field: "post_id",
    allowNull: false,
  })
  declare post_id: string;

  @BelongsTo(() => Post)
  declare post: Post;

  //createdAt
  @Column({
    type: DataType.DATE,
  })
  declare createdAt: Date;
}
