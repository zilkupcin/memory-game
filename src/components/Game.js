import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from "react-router-dom";
import styled from 'styled-components'
import Header from './Header';
import WaitingRoom from './WaitingRoom';
import { db, auth } from '../firebase/firebase';
import { collection, doc, query, where, getDocs, getDoc,setDoc, onSnapshot  } from "firebase/firestore";
import GameRoom from './GameRoom';
import ResultsModal from './ResultsModal';
import { restartGame } from '../firebase/firebaseCloud';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    padding: 12px;
`;


const Game = () => {

    const [game, setGame] = useState();
    const [selection, setSelection] = useState([]);

    const gameId = useParams().gameId;
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "game", gameId), (doc) => {
            if (!doc.data()) navigate('/', { replace: true });

            setGame(doc.data());


        });
        
        return () => {
            unsubscribe();
        }
    },[gameId]);

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
      },[selection]);


    useEffect(() => {
        if (!game ||
            game.started || 
            game.players.length >= game.maxPlayers ||
            game.players.find(player => player.id === auth.currentUser.uid)) return;

        console.log("safe to join")
        joinGame();
        
    },[game])

    useEffect(() => {
      if (game && game.nextGame) {
        navigate(`/game/${game.nextGame}`);
      }
    },[game])

    if (!game) {
        return (<i className="fas fa-spinner fa-spin"></i>);
    }

    const currentPlayer = game.players.find(player => player.id === auth.currentUser.uid);


    const handleReadyClick = async () => {
        try {
            const gameSnap = await getDoc(doc(db, 'game', gameId));

            const players = gameSnap.get("players");
            let started = gameSnap.get("started");
            const thisPlayer = players.find(player => player.id === auth.currentUser.uid);

            if (gameSnap.get("finished")) {
                console.log("The game has finished");
                return;
            } else if (started) {
                console.log ("The game has already started");
                return;
            } else if (!thisPlayer) {
                console.log("You are not in this game");
                return;
            }

            thisPlayer.isReady = !thisPlayer.isReady;

            // Check if there are any players that aren't ready
            const notReadyPlayers = players.find(player => player.isReady === false);

            // If there aren't any - start the game
            if (!notReadyPlayers && players.length === gameSnap.get("maxPlayers")) {
                started = true;
            }

            const gameRef = doc(db, 'game', gameId);
            await setDoc(gameRef, {players, started}, { merge: true });


        } catch(e) {
            console.log(e);
        }
    }

    const handleGuess = async (index) => {
         // Client side check
         if (game.currentTurn.player !== auth.currentUser.uid) {
            console.log("It's not your turn");
            return;
        }

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
                  finished = true;
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

        // Uncomment this in cloud functions
        // return number;


        // CLIENT SIDE CODE BELOW
        // CHECK IF RETURNS FALSE
    
        let newSelection = [...selection];
    
        if (newSelection.length === 2) {
            newSelection = [];
        } 
    
        newSelection.push({index, value: number});
    
        setSelection(newSelection);
    }

    const joinGame = async () => {
        try {

          // Find all games where the player could is still active
          const gameRef = collection(db, "game");
          const playerGames = query(gameRef, where("finished", "==", false));
          let querySnapshot = await getDocs(playerGames);
    
          // Loop through each game and update set player to inactive in these games
          querySnapshot.forEach(async (doc) => {
            const players = doc.get("players");

            const activePlayer = players.find(player => {
              return player.id === auth.currentUser.uid && player.active === true; 
            });

            if (activePlayer) {
              console.log("Found active games, setting player inactive");
              activePlayer.active = false;
              
              const activeGameRef = doc(db, 'game', doc.id);
              await setDoc(activeGameRef, {players}, { merge: true });
            }
          });
    
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
              name: `Player ${players.length + 1}`,
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

    const handleRestart = async () => {
      try {
        await restartGame(gameId);
      } catch(e) {
        console.log(e);
      }
    }

    const handleNewGame = async () => {

    }

    return(
        <Container>
            <Header isHost ={game.host === auth.currentUser.uid}></Header>
            {!currentPlayer && <div>Joining the game</div>}
            {currentPlayer && !game.started && <WaitingRoom onToggleReady={handleReadyClick} players={game.players} currentPlayer={currentPlayer}></WaitingRoom>}
            {currentPlayer && game.started && <GameRoom onGuess={handleGuess} game={game} selection={selection}></GameRoom> }
            {game.finished && <ResultsModal onRestart={handleRestart} onNewGame={handleNewGame} game={game}></ResultsModal>}
        </Container>
    )
}

export default Game;