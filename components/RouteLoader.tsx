"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Spinner from "./Spinner";

export default function RouteLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 400); // adjust duration if you want longer/shorter effect

    return () => clearTimeout(timeout);
  }, [pathname]);

  return loading ? <Spinner /> : null;
}
