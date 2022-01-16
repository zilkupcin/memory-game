# About

This is a multiplayer memory game built with React which uses the Firebase Firestore Database to bring data to the front end in real time. It also uses Firebase Cloud Functions to separate server-side logic from front end code. 

 :warning: **Cloud functions have a cold start delay**, therefore if the app hasn't been used by anyone in a while, there will be a 5-10s delay for each cloud function to run folr the 1st time. This affects: new game creation, setting the ready state, taking a turn, restarting the game.

[Try a live demo here](https://memory-game.zildev.com/).

# Setup

To set this up locally, you should first set up a new Firebase app [here](https://firebase.google.com/).

Once you've set up the app, set up **Firestore Database** and **Functions** in your dashboard.

Clone these repositories:
```
https://github.com/zilkupcin/memory-game
https://github.com/zilkupcin/memory-game-cloud
```

Install the Firebase CLI from [here](https://firebase.google.com/docs/cli)

In the **memory-game** project repository, create an .env file and set the values to these environment variables with your app's credentials.

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

Set the REACT_APP_DEV_MODE variable to true
```
REACT_APP_DEV_MODE=true
```

In the **memory-game-cloud** repository, run 
```
npm install
firebase-login
firebase emulators:start
```

In the **memory-game** repository, run
```
npm start
```

This will open up a browser window with the game which will communicate with the local version of cloud functions.






