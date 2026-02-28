import { useState, useEffect } from "react";

export function useKeyboardOpen(threshold = 100): boolean {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      // window.innerHeight is stable on iOS (unaffected by keyboard)
      setKeyboardOpen(window.innerHeight - vv.height > threshold);
    };

    vv.addEventListener("resize", handleResize);
    return () => vv.removeEventListener("resize", handleResize);
  }, [threshold]);

  return keyboardOpen;
}
