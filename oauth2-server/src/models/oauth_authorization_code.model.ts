import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuid } from 'uuid';
import sequelize from '../dbs/init_postgres';
import { IOAuthAuthorizationCode } from '../types';

interface OAuthAuthorizationCodeCreationAttributes extends Optional<IOAuthAuthorizationCode, 'id'> {}

class OAuthAuthorizationCode extends Model<IOAuthAuthorizationCode, OAuthAuthorizationCodeCreationAttributes> implements IOAuthAuthorizationCode {
  declare id: string;
  declare authorizationCode: string;
  declare expiresAt: Date;
  declare redirectUri: string;
  declare scope?: string;
  declare clientId: string;
  declare userId: string;
}

OAuthAuthorizationCode.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    authorizationCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    redirectUri: {
      type: DataTypes.STRING,
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
    tableName: 'oauth_authorization_codes',
    timestamps: true,
    hooks: {
      beforeCreate: (code: OAuthAuthorizationCode) => {
        if (!code.id) {
          code.id = uuid();
        }
      },
    },
  }
);

export default OAuthAuthorizationCode;
