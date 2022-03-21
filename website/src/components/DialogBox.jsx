import React, { useState, useEffect } from "react";
import { X } from "react-feather";

const DialogBox = ({
  header,
  content,
  extra,
  type = "NOTIFICATION",
  duration = 1000,
  buttonOneLabel,
  buttonTwoLabel,
  buttonOneCallback = () => null,
  buttonTwoCallback = () => null,
  afterCallback = () => null,
  isVisible = false,
  setVisible,
}) => {
  const [display, setDisplay] = useState("none");
  const [opacity, setOpacity] = useState(1);
  const [yPos, setYPos] = useState("-10rem");
  const [fadeTimeout, setFadeTimeout] = useState(null);
  const [closeBtnVisible, setCloseBtnVisible] = useState(false);

  // type === "DIALOG" | "NOTIFICATION"
  // duration only needed for NOTIFICATION type
  // buttonLabels needed for DIALOG type

  useEffect(() => {
    isVisible && fadeInDom();
  }, [isVisible]);

  const fadeInDom = () => {
    setDisplay("flex");
    setTimeout(() => {
      setOpacity(1);
      setYPos("0");
      if (type === "NOTIFICATION") {
        setFadeTimeout(
          setTimeout(() => {
            fadeOutDom();
            afterCallback();
          }, duration)
        );
      }
    }, 10);
  };

  const fadeOutDom = () => {
    setOpacity(0);
    setYPos("-10rem");
    setTimeout(() => {
      setDisplay("none");
      setVisible(false);
    }, 260);
  };

  const _onClickOne = () => {
    buttonOneCallback();
    fadeOutDom();
  };

  const _onClickTwo = () => {
    buttonTwoCallback();
    fadeOutDom();
  };

  function _handleClose() {
    clearTimeout(fadeTimeout);
    fadeOutDom();
    afterCallback();
  }

  return (
    <div
      style={{ display: display, transform: `translateY(${yPos})` }}
      className="right-0 left-0 mx-auto transition-all duration-[250ms] fixed top-3 z-50"
    >
      <div
        className="mx-auto bg-white py-3 px-5 rounded-xl shadow-2xl group"
        onMouseEnter={() => setCloseBtnVisible(true)}
        onMouseLeave={() => setCloseBtnVisible(false)}
      >
        <div className="inline-flex justify-between w-full">
          <h1 className="font-semibold text-base text-text1">{header}</h1>
          {
            type === "NOTIFICATION" &&
            <X
              onClick={_handleClose}
              className="ml-auto cursor-pointer transition-all duration-300 text-text6 hover:text-text1 group-hover:opacity-100 opacity-0"
            />
          }
        </div>
        {content && (
          <p className="font-normal text-sm text-text2 mt-1 max-w-[18rem] md:max-w-sm lg:max-w-md xl:max-w-lg whitespace-normal">
            {content}
          </p>
        )}
        {extra && (
          <p className="font-normal text-sm text-text2 mt-1 max-w-[18rem] md:max-w-sm lg:max-w-md xl:max-w-lg whitespace-normal">
            Więcej informacji:
            <br />
            <code>{extra}</code>
          </p>
        )}
        {type === "DIALOG" && (
          <div className="inline-flex w-full flex-row-reverse">
            {buttonOneLabel && (
              <div
                onClick={_onClickOne}
                className="cursor-pointer text-white bg-primary hover:bg-primaryDark py-[.4rem] ml-2 mb-[.1rem] transition-all duration-150 px-4 font-normal mt-3 rounded-md text-sm"
              >
                {buttonOneLabel}
              </div>
            )}
            {buttonTwoLabel && (
              <div
                onClick={_onClickTwo}
                className="cursor-pointer py-[.4rem] px-4 rounded-md mb-[.1rem] text-red-600 transition-all duration-150 bg-gray-200/0 hover:bg-gray-200/50 font-normal  mt-3 text-sm"
              >
                {buttonTwoLabel}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DialogBox;
