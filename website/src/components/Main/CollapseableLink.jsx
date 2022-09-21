import { useEffect } from "react";
import { useState } from "react";

export const CollapseableLink = ({ children, page }) => {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (
      page === "other" ||
      page === "voting" ||
      page === "edit" ||
      page === "archive" ||
      page === "marketplace"
    ) {
      setActive(true);
    } else {
      setActive(false);
    }
  }, [page]);

  return (
    <div className="relative inline-block">
      <span
        onMouseEnter={() => setHover(true)}
        onFocus={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onBlur={() => setHover(false)}
        className={`mx-4 p-2 relative transition duration-200 font-medium text-sm cursor-pointer pointer-events-all
        ${active || hover ? "text-text1" : "text-text4"}`}
      >
        Inne
      </span>
      <div
        onMouseEnter={() => setHover(true)}
        onFocus={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onBlur={() => setHover(false)}
        className="h-2"
      />

      <div
        onMouseEnter={() => setHover(true)}
        onFocus={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onBlur={() => setHover(false)}
        className={`
            transition-all duration-[250ms] ease-in-out 
            flex flex-col align-middle justify-center w-min px-4 py-2 pb-3 absolute -translate-x-[31%] bg-white rounded-2lg shadow-lg -z-1
            ${
              hover
                ? "opacity-100"
                : "opacity-0 pointer-events-none -translate-y-[20%]"
            }
        `}
      >
        {children}
      </div>
    </div>
  );
};
