import { db } from "./firebase.js";

import {

doc,
getDoc,
updateDoc,
collection,
getDocs

} from
"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


console.log("customer-detail.js 起動");



const params =
new URLSearchParams(location.search);


const id =
params.get("id");



const customerInfo =
document.getElementById("customerInfo");


const historyList =
document.getElementById("historyList");





// 顧客情報取得

async function loadCustomer(){


if(!id){

customerInfo.innerHTML =
"顧客IDがありません";

return;

}



const snap =
await getDoc(
doc(db,"customers",id)
);



if(!snap.exists()){

customerInfo.innerHTML =
"顧客情報がありません";

return;

}



const data =
snap.data();



customerInfo.innerHTML = `


<div class="detail-card">


<label>
顧客名
</label>

<input
type="text"
id="name"
value="${data.name || ""}">



<label>
郵便番号
</label>

<input
type="text"
id="postal"
value="${data.postal || ""}">



<label>
住所
</label>

<input
type="text"
id="address"
value="${(data.address1 || "") + (data.address2 || "")}">



<label>
電話番号
</label>

<input
type="text"
id="tel"
value="${data.tel || ""}">



<label>
メモ
</label>

<textarea
id="memo">
${data.memo || ""}
</textarea>



<button id="saveBtn">

💾 保存

</button>


</div>


`;





document
.getElementById("saveBtn")
.addEventListener(
"click",
async()=>{


await updateDoc(

doc(db,"customers",id),

{

name:
document.getElementById("name").value,


postal:
document.getElementById("postal").value,


address1:
document.getElementById("address").value,


tel:
document.getElementById("tel").value,


memo:
document.getElementById("memo").value


}

);



alert("保存しました😊");


});


}







// 日報履歴取得

async function loadHistory(){



historyList.innerHTML =
"読み込み中...";



const snapshot =
await getDocs(
collection(db,"reports")
);



historyList.innerHTML = "";



let count = 0;



snapshot.forEach(docSnap=>{


const data =
docSnap.data();



if(data.customer !== id
&& data.customer !== undefined){


return;

}





historyList.innerHTML += `


<div class="report-card">


<h3>

${data.name || ""}さん

</h3>


<p>
📅 ${data.date || ""}
</p>


<p>
👷 ${data.work || ""}
</p>


<p>
📝 ${data.content || ""}
</p>


<p>
⏱ ${data.time || ""}
</p>


</div>


`;



count++;


});




if(count === 0){


historyList.innerHTML =

"<p>対応履歴はありません。</p>";


}



}





// 戻るボタン

const backBtn =
document.getElementById("backBtn");


if(backBtn){


backBtn.addEventListener(
"click",
()=>{


location.href =
"customers.html";


});


}






loadCustomer();

loadHistory();
