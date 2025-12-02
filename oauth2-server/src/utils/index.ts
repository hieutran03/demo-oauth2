export const getInfoData = <T extends object>({
  object,
  fields,
}: {
  object: T;
  fields: string[];
}): Partial<T> => {
  const result: Partial<T> = {};
  fields.forEach((field) => {
    if (field in object) {
      (result as any)[field] = (object as any)[field];
    }
  });
  return result;
};

export const pickData = <T extends object>(object: T, keys: (keyof T)[]): Partial<T> => {
  return keys.reduce((result, key) => {
    if (key in object) {
      result[key] = object[key];
    }
    return result;
  }, {} as Partial<T>);
};

export const omitData = <T extends object>(object: T, keys: (keyof T)[]): Partial<T> => {
  const result = { ...object };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};
