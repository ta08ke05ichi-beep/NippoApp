const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

async function deleteEmptyCustomers() {

  const snapshot = await db.collection("customers").get();

  let batch = db.batch();
  let count = 0;

  snapshot.forEach(doc => {

    const data = doc.data();

    if (!data.name || data.name.trim() === "") {

      batch.delete(doc.ref);
      count++;

    }

  });

  await batch.commit();

  console.log("削除した件数:", count);

}

deleteEmptyCustomers();