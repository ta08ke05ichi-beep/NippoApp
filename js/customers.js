import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    writeBatch,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

console.log("customers.js 起動");


const customerList =
document.getElementById("customerList");

const addBtn =
document.getElementById("addCustomerBtn");


// 顧客一覧表示

async function loadCustomers(){


    customerList.innerHTML="読み込み中...";


    const q =
    query(
        collection(db,"customers"),
        orderBy("name")
    );


    const snapshot =
    await getDocs(q);



    if(snapshot.empty){

        customerList.innerHTML=
        "登録されている顧客はありません";

        return;

    }



    customerList.innerHTML="";



    snapshot.forEach((doc)=>{


        const data = doc.data();


        const div =
        document.createElement("div");


        div.className="customer-card";


     div.innerHTML =
`
<p>
🏢 ${data.name}
</p>
`;


div.onclick = ()=>{

    location.href =
    "customer-history.html?customer=" + data.name;

};


        customerList.appendChild(div);


    });


}



// 顧客追加

async function addCustomer(){


    const name =
    prompt("顧客名を入力してください");


    if(!name){

        return;

    }



    const snapshot =
    await getDocs(
        collection(db,"customers")
    );



    let exists=false;



    snapshot.forEach((doc)=>{


        if(doc.data().name === name){

            exists=true;

        }

    });



    if(exists){

        alert("登録済みの顧客です");

        return;

    }



    await addDoc(
        collection(db,"customers"),
        {

            name:name,

            createdAt:new Date()

        }
    );



    alert("顧客を追加しました");


    loadCustomers();


}



// ボタン

addBtn.addEventListener(
"click",
addCustomer
);



// 起動

loadCustomers();

// =====================
// CSV一括取込（writeBatch版）
// =====================

const csvFile =
document.getElementById("csvFile");

const importBtn =
document.getElementById("importBtn");

const importStatus =
document.getElementById("importStatus");



importBtn.addEventListener(
"click",
async()=>{


    const file =
    csvFile.files[0];


    if(!file){

        alert("CSVファイルを選択してください");

        return;

    }


    importStatus.textContent =
    "CSV読み込み中...";



    const text =
    await file.text();



    const lines =
    text.split(/\r?\n/);



    const batch =
    writeBatch(db);



    let count = 0;



    for(let i = 1; i < lines.length; i++){


        if(!lines[i].trim()){

            continue;

        }



        const row =
        lines[i].split(",");



        const customerName =
        row[0]?.trim();



        if(!customerName){

            continue;

        }



        const customerRef =
        doc(collection(db,"customers"));



        batch.set(
    customerRef,
    {

        name:
        row[0]?.trim() || "",

        name2:
        row[1]?.trim() || "",

        honorific:
        row[2]?.trim() || "",

        postal:
        row[3]?.trim() || "",

        address1:
        row[4]?.trim() || "",

        address2:
        row[5]?.trim() || "",

        tel:
        row[6]?.trim() || "",

        fax:
        row[7]?.trim() || "",

        contactName:
        row[8]?.trim() || "",

        contactHonorific:
        row[9]?.trim() || "",

        createdAt:
        new Date()

    }
);



        count++;



        // Firestoreは1回500件までなので分割

        if(count % 500 === 0){


            await batch.commit();


            importStatus.textContent =
            `${count}件登録中...`;

        }

    }



    // 残りを保存

    await batch.commit();



    importStatus.textContent =
    `${count}件の顧客を登録しました`;



    alert(
        "CSV取込完了しました"
    );


    loadCustomers();



});