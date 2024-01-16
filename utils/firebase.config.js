// Import the functions you need from the SDKs you need
import admin from 'firebase-admin'
import serviceAccount from './credentials.json' assert {type: 'json'};

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const storage = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://e-book-manager.appspot.com', // Replace with your Firebase Storage bucket URL
});


export default storage