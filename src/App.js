import { useEffect } from 'react';
import { useState } from 'react';
import logo from './logo.svg';
import './reset.css';
import './App.css';
import { initializeApp } from "firebase/app";
import { getFirestore,collection, addDoc, doc, query, where, getDocs, getDoc,setDoc, onSnapshot  } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged  } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db, auth } from './firebase/firebase';
import Card from './Card';
import Theme from './components/Theme';
import GameSetup from './components/GameSetup';
import Game from './components/Game';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";

function App() {

  const [game, setGame] = useState();
  const [selection, setSelection] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const gameId = "pgEvzAYb6maxhtrIw1GU";
  
  const createGame = async (maxPlayers,size,gameType) => {
    // CLOUD FUNCTION EXECUTION
    // const createGame = httpsCallable(functions, 'testFunc');
    // try {
    //   const result = await createGame({maxPlayers: 4, size: 6})
    //   // const data = await result.json();
    //   console.log(result)
    //   // console.log(data);
    // } catch(e) {
    //   console.log(e)
    // }
    const validSizes = [4,6];

    if (typeof maxPlayers !== "number" || typeof size !== "number") {
      console.log("Invalid data type");
      return;
    }

    if (!validSizes.includes(size) || maxPlayers > 4 || maxPlayers < 1) {
      console.log("Invalid game parameters");
      return;
    }

    if (gameType !== 'icons' || gameType !== 'numbers') {
      console.log("Invalid game tyoe");
      return;
    }

    const gameGrid = generateEmptyGrid();

    const gameRef = await addDoc(collection(db, "game"),  {
      finished: false,
      started: false,
      host: auth.currentUser.uid,
      maxPlayers,
      grid: gameGrid,
      players: [
        {
          playerId: auth.currentUser.uid,
          score: 0,
          playerPresent: true,
          isReady: false
        }
      ],
      createdAt: new Date()
    });

    const solutionRef = await addDoc(collection(db, "solution"),  {
      game: gameRef.id,
      grid: generateSolution()
    });

    function generateEmptyGrid() {
      let grid = [];

      for (let i = 0; i < size*size; i++) {
        grid.push(-1);
      }

      return grid;
    }

    function generateSolution() {
      // Unique icons
      const iconSet = ['football-ball','mountain','tree','wind','tractor','space-shuttle','meteor',
        'rocket','bomb','cloud','feather','bone','fish','ice-cream','pizza-slice','stroopwafel','plane','wine-glass-alt'];

      // Unique number set equal to the number of grid's columns
      let numberSet = [];

      // Make a copy of the empty grid
      let solution = [...gameGrid];

      for (let i = 0; i < (size * size) / 2; i++) {

        // Unique element of the solution array
        let uniqueElement;

        // Select a random element depending on the type of the game
        if (gameType === 'numbers') {
          // Generate a unique random number
          uniqueElement = generateNumber(numberSet);
          // Keep track of the number so we know only add unique ones
          numberSet.push(uniqueElement);
        } else if (gameType === 'icons') {
          // Select a random icon from the iconSet
          uniqueElement = selectIcon(iconSet);
        }

        // Put the generated element in 2 random places of the solution array
        for (let b = 0; b < 2; b++) {
          // Store the indexes of all remaining empty elements
          const emptyGridElements = [];

          // Check which solution elements are still empty
          solution.forEach((item,index) => {
            if (item === -1) {
              emptyGridElements.push(index);
            }
          })

          const randIndex = Math.floor(Math.random() * emptyGridElements.length);

          solution[emptyGridElements[randIndex]] = uniqueElement;
        }
      }

      return solution;
    }

    function generateNumber(numbers) {
      const newNumber = Math.floor(Math.random() * 100);
      if (numbers.includes(newNumber)) {
        return generateNumber(numbers);
      } else {
        return newNumber;
      }
    }

    function selectIcon(iconSet) {
      const randomIndex = Math.floor(Math.random() * iconSet.length);
      const randomIcon = iconSet[randomIndex];
      iconSet.splice(randomIndex,1);
      return randomIcon;
    }

    return gameRef.id;
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
          active: true,
          isReady: false
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
        if (auth.currentUser.uid === gameDoc.host) {
          // TODO: If the host leaves before the game is started, delete the game
        } else {
          changedGameData.players.splice(playerIndex,1);
        }
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

    if (!currentGameSnap.get("started")) {
      console.log("The game has not started yet");
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
    let finished = currentGameSnap.get("finished");

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

    if (!grid.find(gridElm => gridElm === -1)) {
      finished = true;
    }

    const currentGameRef = doc(db, 'game', gameId);
    await setDoc(currentGameRef, {currentTurn, players, grid, finished}, { merge: true });

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
      setIsLoading(false);
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

    newSelection.push({index, value: res});

    setSelection(newSelection);
  }

  const selectionIncludes = (index) => {
    return selection.find(elm => {
      return index === elm.index
    })
  } 

  const startGame = async () => {
    const currentGameSnap = await getDoc(doc(db, 'game', gameId));

    if (!currentGameSnap.exists()) {
      console.log("This game doesn't exist");
      return;
    }

    if (currentGameSnap.get("host") !== auth.currentUser.uid) {
      console.log("You are not the host of this game");
      return;
    }

    if (currentGameSnap.get("started")) {
      console.log("This game has already started");
      return;
    }

    if (currentGameSnap.get("maxPlayers") !== currentGameSnap.get("players").length) {
      console.log("Not enough players to start the game");
      return;
    }

    const currentTurn = {
      player: currentGameSnap.get("players")[0].id,
      selection: []
    }

    const currentGameRef = doc(db, 'game', gameId);
    await setDoc(currentGameRef, {started: true, currentTurn}, { merge: true });
  }

  const WaitingRoom = () => {
    return (
      <div>
        <p>{game.players.length === game.maxPlayers ? 'Waiting for the host to start the game' : 'Waiting for more players to join'}</p>
        <span>{`${game.players.length}/${game.maxPlayers}`}</span>
        {game.players.map((player, index) => {
          return (
            <div>{`Player ${index +1}`}</div>
          )
        })}
      </div>
    )
  }

  if (isLoading) return (<div>Loading</div>)


  return (
      <Theme>
        <Router>
          <Routes>
            <Route path="/" element={
               <GameSetup></GameSetup>
            }>
            </Route>
            <Route path="/game/:gameId" element={
              <Game></Game>
            }>
            </Route>
            <Route
              path="*"
              element={<Navigate to="/" />}
            />
          </Routes>
        </Router>
      <div>
        <button onClick={() => createGame(4,6)}>Add new game</button>
        <button onClick={joinGame}>Join game</button>
        <button onClick={leaveGame}>Leave game</button>
        <button onClick={guess}>Guess</button>
        <button onClick={listenToGameChanges}>Listen to game changes</button>
      </div>
      {game && !game.started && WaitingRoom()}
      <div className="game-grid">
        {game && game.started && !game.finished && game.grid.map((elm, index) => {
          const foundSelection = selectionIncludes(index);
          return (<Card 
            selected={foundSelection ? true : false} 
            onBubbleSelect={bubbleSelectHandler} 
            index={index} 
            value={foundSelection ? foundSelection.value : elm}>
            </Card>)
        })}
      </div>
      {game && game.started && !game.finished && game.players.map((player, index) => {
          return (
            <div>{`Player ${index +1}: ${player.score}`}</div>
          )
        })}

        {game && !game.started && game.host === auth.currentUser.uid && game.maxPlayers === game.players.length && <button onClick={startGame}>Start the game</button>}
      </Theme>
  );
}

export default App;
