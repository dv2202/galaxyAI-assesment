"use client";

import { useCallback, useEffect, useState } from "react";

const SIDEBAR_COLLAPSED_KEY = "galaxy-sidebar-collapsed";
const SIDEBAR_EVENT = "galaxy-sidebar-collapse-change";

function readCollapsedState() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
}

export function useSidebarCollapse() {
  const [collapsed, setCollapsed] = useState(readCollapsedState);

  useEffect(() => {
    function syncCollapsed() {
      setCollapsed(readCollapsedState());
    }

    window.addEventListener("storage", syncCollapsed);
    window.addEventListener(SIDEBAR_EVENT, syncCollapsed);

    return () => {
      window.removeEventListener("storage", syncCollapsed);
      window.removeEventListener(SIDEBAR_EVENT, syncCollapsed);
    };
  }, []);

  const toggleCollapsed = useCallback(() => {
    const nextValue = !readCollapsedState();
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(nextValue));
    window.dispatchEvent(new Event(SIDEBAR_EVENT));
    setCollapsed(nextValue);
  }, []);

  return { collapsed, toggleCollapsed };
}
