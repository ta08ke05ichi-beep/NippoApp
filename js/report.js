import { db } from "./firebase.js";

import {

collection,
addDoc,
getDocs,
serverTimestamp

} from 
"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";



const dateInput = document.getElementById("date");

const nameInput = document.getElementById("name");

const customerInput = document.getElementById("customer");

const workInput = document.getElementById("work");

const contentInput = document.getElementById("content");

const timeInput = document.getElementById("time");

const saveBtn = document.getElementById("saveBtn");




// 今日の日付セット

const today = new Date();

const yyyy = today.getFullYear();

const mm = String(today.getMonth()+1)
.padStart(2,"0");

const dd = String(today.getDate())
.padStart(2,"0");


dateInput.value =
`${yyyy}-${mm}-${dd}`;





// 前回の名前を保存

const savedName =
localStorage.getItem("reportName");


if(savedName){

nameInput.value = savedName;

}



nameInput.addEventListener(
"change",
()=>{

localStorage.setItem(
"reportName",
nameInput.value
);

});






// 顧客一覧読み込み

async function loadCustomers(){


const snap =
await getDocs(
collection(db,"customers")
);


snap.forEach(doc=>{


const data = doc.data();


const option =
document.createElement("option");


option.value =
data.name;


option.textContent =
data.name;


customerInput.appendChild(option);


});


}


loadCustomers();






// 保存

saveBtn.addEventListener(
"click",
async()=>{


if(!nameInput.value){

alert("名前を選択してください");

return;

}



if(!customerInput.value){

alert("顧客を選択してください");

return;

}




await addDoc(

collection(db,"reports"),

{


date:dateInput.value,

name:nameInput.value,

customer:customerInput.value,

work:workInput.value,

content:contentInput.value,

time:timeInput.value,


createdAt:
serverTimestamp()


}


);



alert("保存しました");



// 入力クリア

contentInput.value="";

timeInput.value="";


}

);
