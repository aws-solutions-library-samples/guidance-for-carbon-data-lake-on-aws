import React from 'react';

// const DateFetch = () => {

//   const d = new Date()
//   const weekDay = [
//     'Sunday',
//     'Monday',
//     'Tuesday',
//     'Wednesday',
//     'Thursday',
//     'Friday',
//     'Saturday'
//   ]
//   const months = [
//     'January',
//     'February',
//     'March',
//     'April',
//     'May',
//     'June',
//     'July',
//     'August',
//     'September',
//     'October',
//     'November',
//     'December'
//                 ]

//     const day = weekDay[d.getDay()]
//     const month = months[d.getMonth()]
//     const date = d.getDate()
//     const year = d.getFullYear()




//   return(
//   <>
//     {day}
//     {month}
//     {date}
//     {year}
//   </>
//   );
// };


// export default DateFetch;

const d = new Date()
const weekDay = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
              ]

  export const day = weekDay[d.getDay()]
  export const month = months[d.getMonth()]
  export const date = d.getDate()
  export const year = d.getFullYear()
