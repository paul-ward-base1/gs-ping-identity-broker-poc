export interface DynamicModuleLoader<T> {
  load: () => Promise<T>;
}

const loadModule = async <T>(pathProvider: PathProvider) => {
  const path = pathProvider();
  try {
    const module = await import(`@/lib/${path}`);
    return module.default as T;
  } catch (error) {
    console.error(`Failed to load module: @/lib/${path}`, error);
    throw error;
  }
};

/**
 * PathProvider is a function that returns the path to the module to be loaded.
 */
export type PathProvider = () => string;

/**
 * createDynamicModuleLoader creates a dynamic module loader that can be used to load modules at runtime.
 *
 * @param {PathProvider} pathProvider - provides the path to the module to be loaded ({@link PathProvider}).
 * @throws {Error} if the module cannot be loaded
 */
export const createDynamicModuleLoader = <T>(pathProvider: PathProvider): DynamicModuleLoader<T> => {
  return {
    load: async () => await loadModule(pathProvider),
  };
};
