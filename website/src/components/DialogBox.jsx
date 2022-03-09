import React, { useState, useEffect } from 'react';

const DialogBox = ({
    header,
    content,
    type = "NOTIFICATION",
    duration = 1000,
    buttonOneLabel,
    buttonTwoLabel,
    buttonOneCallback = () => null,
    buttonTwoCallback = () => null,
    afterCallback = () => null,
    isVisible = false,
    setVisible
}) => {
    const [display, setDisplay] = useState("none")
    const [opacity, setOpacity] = useState(1)
    const [yPos, setYPos] = useState("-10rem")
    // type === "DIALOG" | "NOTIFICATION"
    // duration only needed for NOTIFICATION type
    // buttonLabels needed for DIALOG type

    useEffect(() => {
        if (isVisible) {
            fadeInDom();
        }
    }, [isVisible]);

    const fadeInDom = () => {
        setDisplay("flex");
        setTimeout(() => {
            setOpacity(1);
            setYPos("0");
            if (type === "NOTIFICATION") {
                setTimeout(() => {
                    fadeOutDom();
                    afterCallback()
                }, duration);
            }
        }, 10);
    }

    const fadeOutDom = () => {
        setOpacity(0);
        setYPos("-10rem");
        setTimeout(() => {
            setDisplay("none");
            setVisible(false)
        }, 260);
    }

    const _onClickOne = () => {
        buttonOneCallback();
        fadeOutDom();
    }

    const _onCLickTwo = () => {
        buttonTwoCallback();
        fadeOutDom();
    }

    return (
        <div style={{ display: display, transform: `translateY(${yPos})` }} className="right-0 left-0 mx-auto transition-all duration-[250ms] fixed top-3 z-50 ">
            <div className="mx-auto bg-white  py-3 px-5 rounded-xl shadow-2xl">
                {header && <h1 className="font-semibold text-base text-text1">{header}</h1>}
                {content && <p className="font-normal text-sm text-text2 mt-1 max-w-[18rem] md:max-w-sm lg:max-w-md xl:max-w-lg whitespace-normal">{content}</p>}
                {
                    type === "DIALOG" ?
                        <div className="inline-flex w-full flex-row-reverse">
                            {buttonOneLabel && <div onClick={() => _onClickOne()} className="cursor-pointer text-white bg-primary hover:bg-primaryDark py-[.4rem] ml-2 mb-[.1rem] transition-all duration-150 px-4 font-normal mt-3 rounded-md text-sm" >{buttonOneLabel}</div>}
                            {buttonTwoLabel && <div onClick={() => _onCLickTwo()} className="cursor-pointer py-[.4rem] px-4 rounded-md mb-[.1rem] text-red-600 transition-all duration-150 bg-gray-200/0 hover:bg-gray-200/50 font-normal  mt-3 text-sm" >{buttonTwoLabel}</div>}
                        </div> :
                        null
                }
            </div>

        </div >
    );
}

export default DialogBox