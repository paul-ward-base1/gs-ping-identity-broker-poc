type NestedRecord = { [key: string]: unknown };

export const unflatten = (flatObj: Record<string, unknown>): NestedRecord => {
  const result: NestedRecord = {};

  for (const flatKey in flatObj) {
    const keys = flatKey.split('.');
    let current: NestedRecord = result;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = flatObj[flatKey];
      } else {
        current[key] ||= {};
        current = current[key] as NestedRecord;
      }
    });
  }

  return result;
};
