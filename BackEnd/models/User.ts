import {
  Table,
  Column,
  DataType,
  Model,
  AllowNull,
} from "sequelize-typescript";
import { v4 } from "uuid";
@Table({
  tableName: "User",
  timestamps: true,
  createdAt: "createdAt",
  updatedAt: "updatedAt",
})
export class User extends Model {
  //id
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: v4(),
  })
  declare user_id: string;

  //username
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare username: string;

  //email
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare email: string;

  //password
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  //profilepic
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare profile_picture: string;

  //bio
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare bio: string;
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
