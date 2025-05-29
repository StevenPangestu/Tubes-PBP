import {
  Table,
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

import { v4 } from "uuid";
import { User } from "./User";
import { Post } from "./Post";

@Table({
  tableName: "Like",
  timestamps: true,
  createdAt: "createdAt",
  updatedAt: "updatedAt",
})
export class Like extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: () => v4(),
  })
  declare like_id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    field: "user_id",
    allowNull: false,
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => Post)
  @Column({
    type: DataType.UUID,
    field: "post_id",
    allowNull: false,
  })
  declare post_id: string;

  @BelongsTo(() => Post)
  declare post: Post;

  @CreatedAt
  @Column({ type: DataType.DATE })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE })
  declare updatedAt: Date;
}
