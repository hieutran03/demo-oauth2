import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuid } from 'uuid';
import sequelize from '../dbs/init_postgres';
import { IOAuthClient } from '../types';

interface OAuthClientCreationAttributes extends Optional<IOAuthClient, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {}

class OAuthClient extends Model<IOAuthClient, OAuthClientCreationAttributes> implements IOAuthClient {
  declare id: string;
  declare userId?: string;
  declare clientId: string;
  declare clientSecret: string;
  declare callbackUrl: string;
  declare grants: string[];
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

OAuthClient.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING(24),
      allowNull: true,
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    clientSecret: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    callbackUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    grants: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'oauth_clients',
    timestamps: true,
    hooks: {
      beforeCreate: (client: OAuthClient) => {
        if (!client.id) {
          client.id = uuid();
        }
      },
    },
  }
);

export default OAuthClient;
