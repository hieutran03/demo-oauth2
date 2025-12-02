import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuid } from 'uuid';
import sequelize from '../dbs/init_postgres';
import { IOAuthRefreshToken } from '../types';

interface OAuthRefreshTokenCreationAttributes extends Optional<IOAuthRefreshToken, 'id'> {}

class OAuthRefreshToken extends Model<IOAuthRefreshToken, OAuthRefreshTokenCreationAttributes> implements IOAuthRefreshToken {
  declare id: string;
  declare refreshToken: string;
  declare refreshTokenExpiresAt: Date;
  declare scope?: string;
  declare clientId: string;
  declare userId: string;
}

OAuthRefreshToken.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    refreshTokenExpiresAt: {
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
    tableName: 'oauth_refresh_tokens',
    timestamps: true,
    hooks: {
      beforeCreate: (token: OAuthRefreshToken) => {
        if (!token.id) {
          token.id = uuid();
        }
      },
    },
  }
);

export default OAuthRefreshToken;
