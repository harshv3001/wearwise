"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../lib/auth";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setChecked(true);
  }, [router]);

  if (!checked) return null; // prevents flashing dashboard before redirect

  return children;
}