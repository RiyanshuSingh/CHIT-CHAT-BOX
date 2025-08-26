<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDWjqwsyzl7Yo2dzP8z5e7MQEb5C0uKXQs",
    authDomain: "chit-chat-box-f89de.firebaseapp.com",
    projectId: "chit-chat-box-f89de",
    storageBucket: "chit-chat-box-f89de.firebasestorage.app",
    messagingSenderId: "4019103312",
    appId: "1:4019103312:web:3401dc7bc79675456d1355",
    measurementId: "G-60TP9R3V17"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
