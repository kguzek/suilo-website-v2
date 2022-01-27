import React, { useState, useEffect } from "react";
import { ChevronsUp } from "react-feather";

const ScrollToTop = () => {
  const [isActive, setActive] = useState(false);
  const [isSafe, setSafety] = useState(true);
  const [yPos, setY] = useState("-70px");
  const [display, setDisplay] = useState("none");
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
      setY("15px");
      setSafety(true);
    }, 100);
  };

  // animation on exit
  const _fadeOut = () => {
    setY("-70px");
    setTimeout(() => {
      setDisplay("none");
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

  // Smooth scroll to top //
  const _scrollAction = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      title="scroll to top"
      className="scroll-top"
      onClick={() => _scrollAction()}
      style={{ display: display, bottom: yPos }}
    >
      <ChevronsUp size="38" strokeWidth="1.5px" color="#FFA900" />
    </button>
  );
};

export default ScrollToTop;
