// File: ./src/components/utils/ErrorBoundaryComp/components/LocalStorageWrapper.tsx

// Initialize localStorage proxy only once
if (!(window as any)._localStorageWrapped) {
   const originalLocalStorage = window.localStorage;

   const localStorageProxy = new Proxy(originalLocalStorage, {
      get(target, prop, receiver) {
         if (prop === 'setItem') {
            return function (key: string, value: string) {
               const result = target.setItem(key, value);
               window.dispatchEvent(
                  new CustomEvent('localStorage-change', {
                     detail: {key, newValue: value, action: 'set'},
                  }),
               );
               return result;
            };
         }
         if (prop === 'getItem') {
            return function (key: string) {
               return target.getItem(key);
            };
         }
         if (prop === 'removeItem') {
            return function (key: string) {
               const oldValue = target.getItem(key);
               const result = target.removeItem(key);
               window.dispatchEvent(
                  new CustomEvent('localStorage-change', {
                     detail: {key, oldValue, newValue: null, action: 'remove'},
                  }),
               );
               return result;
            };
         }
         if (prop === 'clear') {
            return function () {
               const result = target.clear();
               window.dispatchEvent(
                  new CustomEvent('localStorage-change', {
                     detail: {key: null, oldValue: null, newValue: null, action: 'clear'},
                  }),
               );
               return result;
            };
         }
         if (prop === 'key') {
            return function (index: number) {
               return target.key(index);
            };
         }
         if (prop === 'length') {
            return target.length;
         }
         return Reflect.get(target, prop, receiver);
      },
   });

   try {
      Object.defineProperty(window, 'localStorage', {
         configurable: true,
         writable: true,
         value: localStorageProxy,
      });

      (window as any)._localStorageWrapped = true;
   } catch (error) {
      console.error('Failed to apply localStorage proxy:', error);
   }
}
