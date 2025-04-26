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
import { User } from "./User";
import { Category } from "./Category";

@Table({
  tableName: "Post",
  timestamps: true,
  createdAt: "createdAt",
  updatedAt: "updatedAt",
})
export class Post extends Model {
  //post_id
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: v4(),
  })
  declare post_id: string;

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

  //image_url
  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  declare image_url: string;

  //caption
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare caption: string;

  //category_id (FK)
  @ForeignKey(() => Category)
  @Column({
    type: DataType.UUID,
    field: "category_id",
    allowNull: false,
  })
  declare category_id: string;
  
  @BelongsTo(() => Category)
  declare category: Category;

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
}
