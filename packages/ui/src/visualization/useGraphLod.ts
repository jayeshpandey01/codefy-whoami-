import { useCallback, useRef } from "react";
import { useStore, type ReactFlowState } from "@xyflow/react";
import {
  LOD_COMPACT_ZOOM_THRESHOLD,
  LOD_LOW_ENTER_THRESHOLD,
  LOD_LOW_EXIT_THRESHOLD,
} from "./zoom-config.js";

/**
 * High-performance Level of Detail (LOD) hook with hysteresis.
 *
 * Prevents re-render oscillation/flapping when zoom hovers near the boundary:
 *  - Enters low-LOD when zoom drops below LOD_LOW_ENTER_THRESHOLD (0.38).
 *  - Returns to high-LOD only when zoom exceeds LOD_LOW_EXIT_THRESHOLD (0.46).
 *
 * Evaluates boolean equality via Zustand, so re-renders trigger ONLY upon state transition,
 * maintaining 60fps during smooth zoom/pan motions.
 */
export function useGraphLod(): { isLowLod: boolean } {
  const isLowLodRef = useRef<boolean | null>(null);

  const isLowLod = useStore(
    useCallback((state: ReactFlowState) => {
      const zoom = state.transform ? state.transform[2] : 1.0;
      if (isLowLodRef.current === null) {
        isLowLodRef.current = zoom < LOD_COMPACT_ZOOM_THRESHOLD;
        return isLowLodRef.current;
      }
      if (isLowLodRef.current) {
        if (zoom > LOD_LOW_EXIT_THRESHOLD) {
          isLowLodRef.current = false;
        }
      } else {
        if (zoom < LOD_LOW_ENTER_THRESHOLD) {
          isLowLodRef.current = true;
        }
      }
      return isLowLodRef.current;
    }, []),
  );

  return { isLowLod };
}
