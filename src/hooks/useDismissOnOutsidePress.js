import { useEffect, useRef } from "react";

/** Сдвиг больше порога = жест скролла/драга, не «клик снаружи». */
const MOVE_THRESHOLD_PX = 14;

/**
 * Закрывает выпадашку по Escape и по отпусканию указателя снаружи rootRefs.
 * На тач-устройствах скролл (заметное движение между down/up) не считается кликом снаружи.
 *
 * @param {{ active: boolean; rootRefs: import('react').RefObject<HTMLElement | null>[]; onDismiss: () => void }} opts
 */
export function useDismissOnOutsidePress({ active, rootRefs, onDismiss }) {
  const onDismissRef = useRef(onDismiss);
  const rootsRef = useRef(rootRefs);
  onDismissRef.current = onDismiss;
  rootsRef.current = rootRefs;

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onDismissRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const contains = (node) => {
      if (!(node instanceof Node)) return false;
      return rootsRef.current.some((r) => r.current?.contains(node));
    };

    /** @type {Map<number, { armed: boolean; x: number; y: number }>} */
    const arms = new Map();

    const onPointerDown = (e) => {
      const node = e.target;
      if (!(node instanceof Node)) return;
      if (contains(node)) {
        arms.set(e.pointerId, { armed: false, x: e.clientX, y: e.clientY });
        return;
      }
      arms.set(e.pointerId, { armed: true, x: e.clientX, y: e.clientY });
    };

    const onPointerMove = (e) => {
      const s = arms.get(e.pointerId);
      if (!s?.armed) return;
      if (
        Math.abs(e.clientX - s.x) > MOVE_THRESHOLD_PX ||
        Math.abs(e.clientY - s.y) > MOVE_THRESHOLD_PX
      ) {
        s.armed = false;
      }
    };

    const onPointerUp = (e) => {
      const s = arms.get(e.pointerId);
      arms.delete(e.pointerId);
      if (!s?.armed) return;
      const node = e.target;
      if (!(node instanceof Node)) return;
      if (contains(node)) return;
      onDismissRef.current();
    };

    const onPointerCancel = (e) => {
      arms.delete(e.pointerId);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", onPointerCancel, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", onPointerCancel, true);
    };
  }, [active]);
}
