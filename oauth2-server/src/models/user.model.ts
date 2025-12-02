import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcrypt';
import { ObjectId } from 'bson';
import sequelize from '../dbs/init_postgres';
import { AppStatus } from '../enum/app.enum';
import { IUser } from '../types';

interface UserCreationAttributes extends Optional<IUser, 'id' | 'user_salt' | 'status' | 'time' | 'requried_change_pass' | 'verify' | 'createdAt' | 'updatedAt'> {}

class User extends Model<IUser, UserCreationAttributes> implements IUser {
  declare id: string;
  declare username: string;
  declare fullName?: string;
  declare password: string;
  declare user_salt?: string;
  declare status: 'active' | 'inactive';
  declare user_address?: string;
  declare time?: number;
  declare requried_change_pass?: boolean;
  declare verify?: boolean;
  declare updatedBy?: string;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  async isCheckPassword(inputPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(inputPassword, this.password);
    } catch (err) {
      return false;
    }
  }
}

User.init(
  {
    id: {
      type: DataTypes.STRING(24),
      primaryKey: true,
      allowNull: false,
      defaultValue: () => new ObjectId().toHexString(),
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fullName: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_salt: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM(AppStatus.active, AppStatus.inactive),
      defaultValue: AppStatus.active,
    },
    user_address: {
      type: DataTypes.STRING,
    },
    time: {
      type: DataTypes.BIGINT,
      defaultValue: () => Date.now(),
    },
    requried_change_pass: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    verify: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    updatedBy: {
      type: DataTypes.STRING(24),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user: User) => {
        if (!user.id) {
          user.id = new ObjectId().toHexString();
        }
        if (user.password) {
          const salt = await bcrypt.genSalt(11);
          user.user_salt = salt;
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(11);
          user.user_salt = salt;
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
    defaultScope: {
      attributes: { exclude: ['password', 'user_salt'] },
    },
    scopes: {
      withPassword: {
        attributes: { exclude: [] as string[] },
      },
    },
  }
);

export default User;
