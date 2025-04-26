# chat-time: Connect with friends!

Setup and Installation

Follow the steps below to set up the development environment and run the app locally:
1. Prerequisites

    Node.js (v14 or later)
    Expo CLI: npm install -g expo-cli
    Android Studio (for Android Emulator) or Xcode (for iOS Simulator)
    Firebase account with project created

2. Clone the Repository

git clone https://github.com/logicless-bt/chat-time.git
cd chat-time

3. Install Dependencies

Run the following command to install necessary libraries: npm install

Install Expo Go (on your mobile device)

    iOS: Expo Go on the App Store
    Android: Expo Go on Google Play

Firebase Configuration

Go to the Firebase Console and create a new project.

Enable Firestore Database and Firebase Cloud Storage.

Set up Anonymous Authentication in the Authentication tab.

Copy your Firebase configuration object:

{
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}

Replace the placeholder credentials in App.js

const App = () = {
   const firebaseConfig = {

         // Your web app's Firebase configuration

      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
      };

         // Initialize Firebase

      firebase.initializeApp(firebaseConfig);

Running the App

Start the Expo development server: npm start

Use one of the following options to test the app:

    Android: Scan the QR code using the Expo Go app.
    iOS: Scan the QR code with the Camera app (Expo Go must be installed).
    Simulator: Use an emulator (Android Studio or Xcode).
