import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuid } from 'uuid';
import sequelize from '../dbs/init_postgres';
import { IOAuthAccessToken } from '../types';

interface OAuthAccessTokenCreationAttributes extends Optional<IOAuthAccessToken, 'id'> {}

class OAuthAccessToken extends Model<IOAuthAccessToken, OAuthAccessTokenCreationAttributes> implements IOAuthAccessToken {
  declare id: string;
  declare accessToken: string;
  declare accessTokenExpiresAt: Date;
  declare scope?: string;
  declare clientId: string;
  declare userId: string;
}

OAuthAccessToken.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    accessTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    scope: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING(24),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'oauth_access_tokens',
    timestamps: true,
    hooks: {
      beforeCreate: (token: OAuthAccessToken) => {
        if (!token.id) {
          token.id = uuid();
        }
      },
    },
  }
);

export default OAuthAccessToken;
