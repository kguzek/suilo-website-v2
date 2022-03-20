import React, { useState, useEffect } from "react";
import { ChevronsUp } from "react-feather";

/**Scrolls the window to the top. */
export function scrollToTop() {
  document
    .getElementById("root")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ScrollToTop() {
  const [isActive, setActive] = useState(false);
  const [isSafe, setSafety] = useState(true);
  const [yPos, setY] = useState("translate-y-[120%]");
  const [display, setDisplay] = useState("hidden");
  const [opacity, setOpacity] = useState("opacity-0");
  const [scrollPosition, setScrollPosition] = useState(0);

  // Detect and set yOffset //
  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Change component activity depends on yOffset //
  useEffect(() => {
    if (scrollPosition >= 350 && !isActive) {
      setActive(true);
    } else if (scrollPosition < 350 && isActive) {
      setActive(false);
    }
  }, [scrollPosition]);

  // animation on enter
  const _fadeIn = () => {
    setDisplay("flex");
    setTimeout(() => {
      setY("translate-y-0");
      setOpacity("opacity-100")
      setSafety(true);
    }, 100);
  };

  // animation on exit
  const _fadeOut = () => {
    setY("translate-y-[120%]");
    setOpacity("opacity-0")
    setTimeout(() => {
      setDisplay("hidden");
      setSafety(true);
    }, 500);
  };

  // Animate button on fade in and out //
  useEffect(() => {
    if (isActive && isSafe) {
      _fadeIn();
    } else if (isSafe) {
      _fadeOut();
    }
    setSafety(false);
  }, [isActive]);

  return (
    <button
      title="scroll to top"
      className={`${display} ${yPos} ${opacity} bg-white z-50 p-2 border-none justify-center align-middle fixed bottom-3 right-3 rounded-lg cursor-pointer drop-shadow-xl transition-all duration-300`}
      onClick={() => scrollToTop()}
    >
      <ChevronsUp size="38" strokeWidth="1.5px" color="#FFA900" />
    </button>
  );
}

export default ScrollToTop;
