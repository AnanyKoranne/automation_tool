import { DataTypes } from "sequelize";
import { sequelize } from "../config/db";

export const BabyName = sequelize.define(
  "BabyName",
  { 
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sex: {
        type: DataTypes.ENUM('M', 'F'),
        allowNull: false,
    },
});