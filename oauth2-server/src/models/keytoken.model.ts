import { DataTypes, Model } from 'sequelize';
import sequelize from '../dbs/init_postgres';

interface IKeyToken {
  id: number;
  userId: string;
  privateKey: string;
}

class KeyToken extends Model<IKeyToken> implements IKeyToken {
  declare id: number;
  declare userId: string;
  declare privateKey: string;
}

KeyToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(24),
      allowNull: false,
    },
    privateKey: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'key_tokens',
    timestamps: true,
  }
);

export default KeyToken;
