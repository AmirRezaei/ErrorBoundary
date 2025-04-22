// File: ./src/components/utils/TypeScriptUtils.ts

export const nameof = new Proxy(
   {},
   {
      get: (_target, prop) => prop.toString(),
   },
);
