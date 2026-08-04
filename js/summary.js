import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


const monthInput =
document.getElementById("month");

const nameInput =
document.getElementById("name");

const visitCount =
document.getElementById("visitCount");

const workCount =
document.getElementById("workCount");

const customerCount =
document.getElementById("customerCount");

const timeCount =
document.getElementById("timeCount");


// 今月を初期表示

const today = new Date();

monthInput.value =
`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;



document.getElementById("searchBtn")
.addEventListener("click",loadSummary);



async function loadSummary(){

    const snapshot =
    await getDocs(
        collection(db,"reports")
    );


    let visits = 0;

    let works = 0;

    let minutes = 0;


    const customers =
    new Set();


    const month =
    monthInput.value;


    const targetMonth =
    `${month.split("-")[0]}-${month.split("-")[1]}`;


    const name =
    nameInput.value;



    snapshot.forEach((doc)=>{


        const data =
        doc.data();



        // 担当者

        if(
            name !== "全員" &&
            data.name !== name
        ){
            return;
        }



        // 月

        if(
            !data.date.startsWith(targetMonth)
        ){
            return;
        }



        // 訪問数

        visits++;



        // 作業数

        if(data.work){

            works++;

        }



        // 顧客数

        if(data.customer){

            customers.add(data.customer);

        }



        // 作業時間

        if(
            data.startTime &&
            data.endTime
        ){

            const start =
            data.startTime.split(":");

            const end =
            data.endTime.split(":");



            const startMinutes =
            Number(start[0])*60 +
            Number(start[1]);


            const endMinutes =
            Number(end[0])*60 +
            Number(end[1]);



            minutes +=
            endMinutes - startMinutes;

        }


    });



    visitCount.textContent =
    `${visits}件`;


    workCount.textContent =
    `${works}件`;


    customerCount.textContent =
    `${customers.size}社`;



    const hour =
    Math.floor(minutes / 60);


    const min =
    minutes % 60;



    timeCount.textContent =
    `${hour}時間${min}分`;

}