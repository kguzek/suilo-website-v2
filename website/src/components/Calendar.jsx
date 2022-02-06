import React, { useState, useEffect } from 'react'

/*

       TYPES OF EVENTS - STRUCTURE

       typesOfEvents<Object>{
           primaryEvents<Array[Object]>:[
               { 
                   eventName<string>: "",
                   eventColor<Object>: {
                       topCorner<string>: "HEXvalue",
                       bottomCorner<string>: "HEXvalue",
                   }
               },
               ...
           ],
           secondaryEvents<Array[Object]>:[
               { 
                   eventName<string>: "",
                   eventColor<string>: "HEXvalue"
               },
               ...
           ]
       } 

   */

/*

    DATA FROM FETCH PER MONTH - STRUCTURE

    <Array[Object]>[
        {
            type<string>: "_PRIMARY_",
            subtype<string>: ""
            name<string>: "",
            date<Object>:{
                start<number>: 0,
                end<number>: 0,
            },
        },
        {
            type<string>: "_SECONDARY_",
            subtype<string>: "",
            name<string>: "",
            date<Object>:{
                start<number>: 0,
                end<number>: 0,
                startInPrev<boolean>: false,
                endInNext<boolean>: false,
            },
        },
        ...
    ]

*/

const Calendar = ({ fetchURL, startingMonth, typesOfEvents }) => {

    return (
        <div>
            Calendar in progres...
        </div>
    )
}

export default Calendar;