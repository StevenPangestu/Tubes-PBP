import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table
} from "sequelize-typescript";

import { v4 } from "uuid";
import { Post } from "./Post";
import { User } from "./User";

@Table({
  tableName: "Comment",
  timestamps: true,
  createdAt: "createdAt",
  updatedAt: "updatedAt"
})
export class Comment extends Model {
  //comment_id
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: () => v4(),
  })
  declare comment_id: string;

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

  //content
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare content: string;

  //createdAt
  @Column({
    type: DataType.DATE,
  })
  declare createdAt: Date;

  //updatedAt
  @Column({
    type: DataType.DATE,
  })
  declare updatedAt: Date;

  @ForeignKey(() => Comment)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare parent_id: string;

  @BelongsTo(() => Comment, 'parent_id')
  declare parent: Comment;

  @HasMany(() => Comment, 'parent_id')
  declare replies: Comment[];
}
