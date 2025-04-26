import {
  Table,
  Column,
  DataType,
  Model,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";

//  import { v4 } from "uuid";
import { User } from "./User";

@Table({
  tableName: "Session",
  timestamps: true,
  createdAt: "createdAt",
})
export class Session extends Model {
  //token
  @Column({
    primaryKey: true,
    type: DataType.UUID
  })
  declare token: string;

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
 
  //createdAt
  @Column({
    type: DataType.DATE,
  })
  declare createdAt: Date;

}
