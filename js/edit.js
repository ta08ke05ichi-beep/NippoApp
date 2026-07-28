import { db } from "./firebase.js";

import {

doc,
getDoc,
updateDoc,
collection,
getDocs

} from 
"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";



console.log("edit.js 起動");



const params =
new URLSearchParams(location.search);


const id =
params.get("id");



const nameInput =
document.getElementById("name");


const dateInput =
document.getElementById("date");


const customerInput =
document.getElementById("customer");


const workInput =
document.getElementById("work");


const contentInput =
document.getElementById("content");


const timeInput =
document.getElementById("time");






// 顧客一覧読み込み

async function loadCustomers(selectedCustomer){


customerInput.innerHTML = "";



const first =
document.createElement("option");

first.value = "";

first.textContent =
"顧客を選択してください";


customerInput.appendChild(first);



const snapshot =
await getDocs(
collection(db,"customers")
);



snapshot.forEach(docSnap=>{


const data =
docSnap.data();



const option =
document.createElement("option");


option.value =
data.name;


option.textContent =
data.name;



if(data.name === selectedCustomer){

option.selected = true;

}



customerInput.appendChild(option);


});


}


// 日報データ読み込み

async function loadData(){



if(!id){

alert("日報IDがありません");

return;

}



const snap =
await getDoc(
doc(db,"reports",id)
);



if(!snap.exists()){

alert("日報がありません");

return;

}



const data =
snap.data();

console.log(data);

nameInput.value =
data.name || "";



dateInput.value =
data.date || "";



workInput.value =
data.work || "";



contentInput.value =
data.content || "";



timeInput.value =
data.time || "";




await loadCustomers(
data.customer
);



}





loadData();








// 更新

document
.getElementById("saveBtn")
.addEventListener(
"click",
async()=>{



await updateDoc(

doc(db,"reports",id),

{


name:
nameInput.value,


date:
dateInput.value,


customer:
customerInput.value,


work:
workInput.value,


content:
contentInput.value,


time:
timeInput.value



}

);



alert("更新しました😊");



location.href =
`report-detail.html?id=${id}`;



});
