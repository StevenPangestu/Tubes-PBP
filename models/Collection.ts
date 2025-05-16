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

@Table({
  tableName: "Collection",
  timestamps: true,
  createdAt: "createdAt",
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
  })
  declare createdAt: Date;
}
