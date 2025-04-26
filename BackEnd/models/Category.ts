import {
  Table,
  Column,
  DataType,
  Model,
  AllowNull,
} from "sequelize-typescript";
import { v4 } from "uuid";
@Table({
  tableName: "Category",
  timestamps: true,
  createdAt: "createdAt",
})
export class Category extends Model {
  //category_id
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: v4(),
  })
  declare category_id: string;

  //category_name
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare category_name: string;

  //createdAt
  @Column({
    type: DataType.DATE,
  })
  declare createdAt: Date;
}
