import { useEffect } from 'react';
import { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { initializeApp } from "firebase/app";
import { getFirestore,collection, addDoc, doc, query, where, getDocs, getDoc,setDoc, onSnapshot  } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged  } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import Card from './Card';


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
const functions = getFunctions(app);

function App() {

  const [game, setGame] = useState();
  const [selection, setSelection] = useState([]);

  const gameId = "pgEvzAYb6maxhtrIw1GU";
  
  const createGame = async () => {
    const createGame = httpsCallable(functions, 'testFunc');
    try {
      const result = await createGame({maxPlayers: 4, size: 6})
      // const data = await result.json();
      console.log(result)
      // console.log(data);
    } catch(e) {
      console.log(e)
    }
    // try {
    //   const docRef = await addDoc(collection(db, "game"), {
    //     started: false,
    //     finished: false,
    //     endTime: new Date(),
    //     grid: [1,2,3,4,5,6,7,8]
    //   });
    //   console.log("Document written with ID: ", docRef.id);
    // } catch (e) {
    //   console.error("Error adding document: ", e);
    // }
  }

  const joinGame = async () => {
    try {
      const gameRef = collection(db, "game");
      const playerGames = query(gameRef, where("finished", "==", false));
      let querySnapshot = await getDocs(playerGames);

      let playerActive = false;

      querySnapshot.forEach((doc) => {
        const activePlayer = doc.get("players").find(player => {
          return player.id === auth.currentUser.uid && player.active === true; 
        });

        if (activePlayer) {
          playerActive = true;
        }
      });

      if (playerActive) {
        console.log("You're currently in another game");
        return;
      }


      const newGameSnap = await getDoc(doc(db, 'game', gameId));

      if (newGameSnap.get("players").length + 1 > newGameSnap.get("maxPlayers")) {
        console.log("Max players reached");
        return;
      } else if (newGameSnap.get("started")) {
        console.log("The game has already started");
        return;
      } else if (newGameSnap.get("finished")) {
        console.log("The game has already finished");
        return;
      }

      const players = newGameSnap.get("players");
      players.push(
        {
          id: auth.currentUser.uid,
          score: 0,
          active: true
        });

      const newGameRef = doc(db, 'game', gameId);
      await setDoc(newGameRef, {players}, { merge: true });

      if (newGameSnap.exists()) {
        console.log("Joined the game")
      } else {
        console.log("This game doesn't exist")
      }


    } catch(e) {
      console.log('error', e);
    }
  }

  const leaveGame = async () => {
    const gameRef = collection(db, "game");
    const playerGames = query(gameRef, where("finished", "==", false));
    let querySnapshot = await getDocs(playerGames);

    const updatedGames = [];

    querySnapshot.forEach(async (gameDoc) => {
      const activePlayer = gameDoc.get("players").find(player => {
        return player.id === auth.currentUser.uid && player.active === true; 
      });

      if (!activePlayer) return;

        const playerIndex = gameDoc.get("players").indexOf(activePlayer)

        const activeGameRef = doc(db, 'game', gameDoc.id);

        const changedGameData = {};

        changedGameData.players = gameDoc.get("players");
        
        // If the game has started, just change the active state, else remove the player
        if (gameDoc.get("started")) {
          changedGameData.players[playerIndex].active = false;
        } else {
          changedGameData.players.splice(playerIndex,1);
        }

        updatedGames.push(gameDoc.id);

        await setDoc(activeGameRef, changedGameData, { merge: true });
    });

    if (updatedGames.length > 0) {
      console.log("Successfully left the game")
    } else {
      console.log("No games to leave");
    }
  }

  const guess = async (index) => {
    // Find the current game
    const currentGameSnap = await getDoc(doc(db, 'game', gameId));

    if (!currentGameSnap.exists()) {
      console.log("Game with this ID doesn't exist");
      return;
    }

    if (currentGameSnap.get("currentTurn").player !== auth.currentUser.uid) {
      console.log("It's not your turn");
      return;
    }

    if (currentGameSnap.get("grid")[index] !== -1) {
      console.log("Please select an empty bubble");
      return;
    }

    const solutionRef = collection(db, "solution");
    const solutionQuery = query(solutionRef, where("game", "==", gameId));
    let solution = await getDocs(solutionQuery);
    solution = solution.docs[0];

    const solutionGrid = solution.get("grid");
    const number = solutionGrid[index];

    const currentTurn = currentGameSnap.get("currentTurn");
    const players = currentGameSnap.get("players");
    const grid = currentGameSnap.get("grid");

    if (currentTurn.selection.length < 2) {

      if (currentTurn.player === auth.currentUser.uid && currentTurn.selection[0] === index) {
        console.log("Please select a different bubble");
        return;
      }

      currentTurn.selection.push(index);

      if (currentTurn.selection.length === 2) {

        const currentPlayer = players.find(player => {
          return player.id === auth.currentUser.uid;
        })

        if (solutionGrid[currentTurn.selection[0]] === solutionGrid[currentTurn.selection[1]]) {

          // Increase player's score
          currentPlayer.score = currentPlayer.score + 1;

          // Update grid
          grid[currentTurn.selection[0]] = solutionGrid[currentTurn.selection[0]];
          grid[currentTurn.selection[1]] = solutionGrid[currentTurn.selection[1]];
        }

        // End player's turn here?

        if (players.length > 1) {
          const currentPlayerIndex = players.indexOf(currentPlayer);

          let nextPlayer = players.find((player, index) => {
            return index > currentPlayerIndex && player.active;
          })

          if (!nextPlayer) {
            nextPlayer =  players.find((player, index) => {
              return index !== currentPlayerIndex && player.active;
            })
          }

          if (!nextPlayer) {
            console.log("No next player found, end of game")

            // End game here
          } else {
            console.log("The next player is ", nextPlayer.id)
            currentTurn.player = nextPlayer.id;
          }
        }
      }
    } else {
      currentTurn.selection = [];
      currentTurn.selection.push(index);
    }

    const currentGameRef = doc(db, 'game', gameId);
    await setDoc(currentGameRef, {currentTurn, players, grid}, { merge: true });

    return number;
  }

  const listenToGameChanges = () => {
    const unsub = onSnapshot(doc(db, "game", gameId), (doc) => {
      setGame(doc.data());
  });
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
    } else {
      console.log("logged out")
    }
  });
  
  const signIn = async () => {
    try {
      await signInAnonymously(auth);
    } catch(e) {
      console.log(e);
    }
  }

  useEffect(()=> {
    console.log(auth.currentUser)
    signIn();
  },[])

  useEffect(() => {
    let removeSelectionTimeout;
    if (selection.length === 2) {
      removeSelectionTimeout = setTimeout(()=>{
        setSelection([]);
      },2000);
    }
  
    return () => {
      if (removeSelectionTimeout) clearTimeout(removeSelectionTimeout);
    }
  },[selection])

  const bubbleSelectHandler = async (index) => {
    // Client side check
    if (game.currentTurn.player !== auth.currentUser.uid) {
      console.log("It's not your turn");
      return;
    }

    const res = await guess(index);

    // CHECK IF RETURNS FALSE

    let newSelection = [...selection];

    if (newSelection.length === 2) {
      newSelection = [];
    } 

    newSelection.push({index, number: res});

    setSelection(newSelection);
  }

  const selectionIncludes = (index) => {
    return selection.find(elm => {
      return index === elm.index
    })
  } 


  return (
    <div className="App">
      <header className="App-header">
        <button onClick={createGame}>Add new game</button>
        <button onClick={joinGame}>Join game</button>
        <button onClick={leaveGame}>Leave game</button>
        <button onClick={guess}>Guess</button>
        <button onClick={listenToGameChanges}>Listen to game changes</button>
      </header>
      <div>
        {game && game.maxPlayers}
      </div>

      <div className="game-grid">
        {game && game.grid.map((elm, index) => {
          const foundSelection = selectionIncludes(index);
          console.log(foundSelection)
          return (<Card 
            selected={foundSelection ? true : false} 
            onBubbleSelect={bubbleSelectHandler} 
            index={index} 
            number={foundSelection ? foundSelection.number : elm}>
            </Card>)
        })}
      </div>
      {game && game.players.map((player, index) => {
          return (
            <div>{`Player ${index +1}: ${player.score}`}</div>
          )
        })}
    </div>
  );
}

export default App;
