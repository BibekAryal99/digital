"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Subscribe to the mock store. `reader` should read from `store` (see lib/store).
 * Re-reads whenever any collection changes via the `dn:store-change` event.
 */
export function useStore<T>(reader: () => T): [T, () => void] {
  const [value, setValue] = useState<T>(reader);

  const refresh = useCallback(() => setValue(reader()), [reader]);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("dn:store-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("dn:store-change", handler);
      window.removeEventListener("storage", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [value, refresh];
}
