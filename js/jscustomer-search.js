import { db } from "./firebase.js";

import {
collection,
getDocs
}
from
"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


const search =
document.getElementById("customerSearch");


const list =
document.getElementById("customerSearchList");


let customers=[];



// 顧客読み込み

async function loadCustomers(){


const snap =
await getDocs(
collection(db,"customers")
);



customers=[];


snap.forEach(doc=>{

customers.push({

id:doc.id,

name:doc.data().name

});


});


showCustomers(customers);


}



// 表示

function showCustomers(data){


list.innerHTML="";


data.forEach(customer=>{


const div =
document.createElement("div");


div.className="customer-item";


div.innerHTML=

`
🏢 ${customer.name}
`;



div.onclick=()=>{


location.href=

`report.html?customer=${customer.name}`;


};



list.appendChild(div);



});


}



// 検索

search.addEventListener(
"input",
()=>{


const text =
search.value;


const result =
customers.filter(c=>

c.name.includes(text)

);



showCustomers(result);



});



loadCustomers();