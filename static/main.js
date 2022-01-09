const firebaseConfig = {
    apiKey: "AIzaSyClv8aHmcjwfjkGuqDrogi46edrezuktfA",
    authDomain: "ntut-web-c0525.firebaseapp.com",
    projectId: "ntut-web-c0525",
    storageBucket: "ntut-web-c0525.appspot.com",
    messagingSenderId: "690596703723",
    appId: "1:690596703723:web:f2a2a54b86d458cd1e3dae"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();