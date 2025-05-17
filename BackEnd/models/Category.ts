import {
  Column,
  CreatedAt,
  DataType,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { v4 } from "uuid";

@Table({
  tableName: "Category",
  timestamps: true,
})
export class Category extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: () => v4(),
  })
  declare category_id: string;
  

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare category_name: string;

  @CreatedAt
  @Column({ type: DataType.DATE })
  declare createdAt: Date;
  
  @UpdatedAt
  @Column({ type: DataType.DATE })
  declare updatedAt: Date;  
}
