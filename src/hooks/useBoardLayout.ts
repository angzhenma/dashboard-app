import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardColumns } from "../types";
import { supabase } from "../lib/supabaseClient";

const DEFAULT_COLUMNS: DashboardColumns = {
  "col-1": [],
  "col-2": [],
  "col-3": [],
};

const SAVE_DEBOUNCE_MS = 800;

export function useBoardLayout(userId: string | undefined) {
  const [columns, setColumns] = useState<DashboardColumns>(DEFAULT_COLUMNS);
  const [isLoadingLayout, setIsLoadingLayout] = useState(true);
  const hasLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    hasLoadedRef.current = false;

    supabase
      .from("board_layouts")
      .select("columns")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Failed to load board layout:", error.message);
        } else if (data?.columns) {
          setColumns(data.columns as DashboardColumns);
        }
        hasLoadedRef.current = true;
        setIsLoadingLayout(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !hasLoadedRef.current) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      supabase
        .from("board_layouts")
        .upsert({
          user_id: userId,
          columns,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error)
            console.error("Failed to save board layout:", error.message);
        });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [columns, userId]);

  const updateColumns = useCallback(
    (
      updater:
        | DashboardColumns
        | ((prev: DashboardColumns) => DashboardColumns),
    ) => {
      setColumns(updater);
    },
    [],
  );

  return { columns, setColumns: updateColumns, isLoadingLayout };
}
