import User from '../user.model';

interface FindUserOptions {
  username: string;
  raw?: boolean;
}

export const findUserByUsername = async ({ username, raw = true }: FindUserOptions): Promise<User | null> => {
  const scope = raw ? 'defaultScope' : 'withPassword';
  return User.scope(scope).findOne({ where: { username } });
};

export const findUserById = async (id: string): Promise<User | null> => {
  return User.findByPk(id);
};

export const findUserDetaiById = async (id: string): Promise<User | null> => {
  return User.findByPk(id, {
    attributes: ['id', 'username', 'fullName', 'status', 'createdAt', 'updatedAt'],
  });
};

export const createUser = async (data: Partial<User>): Promise<User> => {
  return User.create(data as any);
};

export const updateUser = async (id: string, data: Partial<User>): Promise<[number]> => {
  return User.update(data, { where: { id } });
};

export const deleteUser = async (id: string): Promise<number> => {
  return User.destroy({ where: { id } });
};
