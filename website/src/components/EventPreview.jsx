import React, { useEffect, useState, useRef } from 'react'
import { Calendar, Clock, MapPin, Users, Bell, UserCheck, ExternalLink, User } from 'react-feather'

const EventPreview = ({ eventType }) => {
    const [notification, setNotification] = useState(false)
    const [parcitipance, setParcitipance] = useState(false)

    return (
        <article className="w-full grid mb-6 grid-cols-1 gap-3 lg:gap-8 lg:w-11/12 md:w-10/12 mx-auto lg:grid-cols-2 lg:my-12 mt-8">
            <div className="relative lg:pr-10 h-fit">
                <img className="max-h-96 aspect-[3/2] w-full object-cover rounded-xl sm:rounded-2xl drop-shadow-4xl" alt="" src="https://images.unsplash.com/photo-1637603170052-245ccc8eede1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80" />
                <div className="absolute top-0 sm:px-6 sm:py-[.35rem] left-0 px-5 rounded-br-4xl sm:rounded-tl-[.95rem] rounded-tl-[.7rem] py-1 bg-gradient-to-br  from-primary to-secondary">
                    <p className="font-medium text-sm text-white tracking-tigh pr-1 sm:text-base">
                        {eventType === "NEXT" ? "Najbliższe wydarzenie" : "Wybrane wydarzenie"}
                    </p>
                </div>
                <div className="absolute -bottom-1 -right-1 sm:-right-3 lg:right-4 lg:-bottom-4 sm:-bottom-3 h-[4.5rem] lg:h-[6rem] lg:w-[5.2rem] sm:h-[5.4rem] sm:w-[4.7rem] w-16 rounded-lg bg-white flex drop-shadow-3xl flex-col justify-start align-middle">
                    <div className="bg-gradient-to-br from-primary to-secondary w-full h-4 lg:h-5 rounded-t-lg" />
                    <p className="text-text-1 font-semibold text-2xl sm:text-3xl mx-auto -mb-2 mt-1 sm:mt-2 lg:text-[2rem]">
                        10
                    </p>
                    <p className="mx-auto text-text-1 font-semibold text-sm sm:text-base lg:text-lg">
                        gru
                    </p>
                </div>
            </div>
            <div className="w-full lg:w-11/12">
                <h1 className="text-text1 mb-1 max-w-full lg:mb-2 line-clamp-3 tracking-[.015rem] font-semibold lg:line-clamp-2 text-xl sm:text-2xl md:text-xl lg:text-[1.7rem] leading-6 md:leading-6 lg:leading-8">
                    Szkolny koncert z okazji dnia kobiet - edycja 2022
                </h1>
                <p className="line-clamp-4 md:line-clamp-3 xl:line-clamp-5 tracking-[0.012rem] max-w-full font-normal text-sm lg:text-[.95rem] text-text6 leading-5 lg:leading-[1.65rem]">
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                    nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
                    erat, sed diam voluptua. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                    nonumy.
                </p>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:mt-4 mt-2 lg:gap-5">
                    <div className="inline-flex flex-row align-middle">
                        <Calendar size={26} className="aspect-square h-[1.3rem] sm:h-[1.45rem] lg:h-[1.7rem] my-auto stroke-2 stroke-text7" />
                        <p className="my-auto  sm:text-[.9rem] text-sm lg:text-base lg:pl-3  font-medium pt-1 pl-1 sm:pl-2 text-text7">
                            {"8 marca 2022"}
                        </p>
                    </div>
                    <div className="inline-flex flex-row align-middle">
                        <Users size={26} className="aspect-square h-[1.3rem] my-auto sm:h-[1.45rem] lg:h-[1.7rem] stroke-2 stroke-text7" />
                        <p className="my-auto text-sm sm:text-[.9rem] lg:text-base lg:pl-3 font-medium pt-1 pl-1 sm:pl-2 text-text7">
                            {"<20 uczestników"}
                            {/* IF IS LESS THAN 20 DONT SHOW EXACT NUMBER */}
                        </p>
                    </div>
                    <div className="inline-flex flex-row align-middle">
                        <Clock size={26} className="aspect-square  pt-px h-[1.3rem] sm:h-[1.45rem] lg:h-[1.7rem] my-auto stroke-2 stroke-text7" />
                        <p className="my-auto text-sm sm:text-[.9rem] lg:text-base lg:pl-3  font-medium pt-1 pl-1 sm:pl-2 text-text7">
                            {"9:00 - 11:00"}
                        </p>
                    </div>
                    <div className="inline-flex flex-row align-middle">
                        <MapPin size={26} className="aspect-square pt-px h-[1.3rem] sm:h-[1.45rem] lg:h-[1.7rem] my-auto stroke-2 stroke-text7" />
                        <p className="my-auto text-sm sm:text-[.9rem] lg:text-base lg:pl-3  font-medium pt-1 pl-1 sm:pl-2 text-text7">
                            {"Sala 204"}
                        </p>
                    </div>
                </div>
                <div className="inline-flex justify-end w-full mt-4 lg:mt-8   ">
                    <a className="transition-all bg-white aspect-square p-[.5rem] hover:ring-2 hover:ring-primary/30 drop-shadow-3xl pt-[.55rem] pl-[.55rem] rounded-xl" href="" target="_blank">
                        <ExternalLink size={28} className="aspect-square pt-px h-[1.5rem] m-auto stroke-2 stroke-primary" />
                    </a>
                    <div
                        onClick={() => setNotification(!notification)}
                        className="transition-all bg-white aspect-square cursor-pointer hover:ring-2 hover:ring-primary/30  p-[.5rem] pt-[.6rem] ml-2 drop-shadow-3xl rounded-xl"
                    >
                        <Bell size={28} className={`aspect-square pt-px h-[1.5rem] m-auto stroke-2 stroke-primary transition-all duration-150 ${notification ? "fill-primary" : "fill-transparent"}`} />
                    </div>
                    <div
                        onClick={() => setParcitipance(!parcitipance)}
                        className={`transition-all inline-flex bg-primary py-[.5rem]  hover:ring-2 hover:ring-primary/30 active:drop-shadow-5xl cursor-pointer ml-2 drop-shadow-3xl rounded-xl px-[1.1rem] `}
                    >
                        {
                            parcitipance ?
                                <UserCheck size={28} className={`aspect-square  h-[1.5rem]  my-auto stroke-2 stroke-white `} /> :
                                <User size={28} className={`aspect-square  h-[1.5rem]  my-auto stroke-2 stroke-white `} />
                        }

                        <p className="text-white pl-1 my-auto font-medium text-base -tracking-[.015rem]">
                            {
                                parcitipance ?
                                    "Bierzesz udział" :
                                    "Wezmę udział"
                            }
                        </p>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default EventPreview;