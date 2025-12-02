import KeyToken from '../models/keytoken.model';

class KeyTokenService {
  static async createKeyToken({
    userId,
    privateKey,
  }: {
    userId: string;
    privateKey: string;
  }): Promise<KeyToken> {
    // Delete existing keys for user
    await KeyToken.destroy({ where: { userId } });
    
    // Create new key
    return KeyToken.create({ userId, privateKey } as any);
  }

  static async findKeyByUserId(userId: string): Promise<KeyToken | null> {
    return KeyToken.findOne({ where: { userId } });
  }

  static async deleteKeyByUserId(userId: string): Promise<number> {
    return KeyToken.destroy({ where: { userId } });
  }
}

export default KeyTokenService;
