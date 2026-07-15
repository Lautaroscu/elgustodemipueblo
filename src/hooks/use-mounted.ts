"use client";

import { useEffect, useState } from "react";

/** true después de la primera hidratación en cliente. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
