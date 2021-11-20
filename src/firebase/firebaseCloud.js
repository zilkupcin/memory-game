import { db, auth } from './firebase';
import { collection, doc, addDoc, query, where, getDocs, getDoc,setDoc, onSnapshot  } from "firebase/firestore";


const restartGame = async (gameId) => {

    // Find the game
    const gameSnap = await getDoc(doc(db, 'game', gameId));

    if (gameSnap.get("host") != auth.currentUser.uid) {
        console.log("You are not the host of this game");
        return;
    }

    if (!gameSnap.get("finished") || !gameSnap.get("started")) {
        console.log("Please wait for the game to finish")
    }

    const currentGameRef = doc(db, 'game', gameId);


    const size = gameSnap.get("grid").length;
    const gameType = gameSnap.get("gameType");
    const maxPlayers = gameSnap.get("maxPlayers");
    const gameGrid = generateEmptyGrid(Math.sqrt(size));
    
    const newGameRef = await addDoc(collection(db, "game"),  buildGameTemplate(maxPlayers, gameType, gameGrid));

    await addDoc(collection(db, "solution"),  {
        game: newGameRef.id,
        grid: generateSolution(Math.sqrt(size),gameType, gameGrid)
    });

    await setDoc(currentGameRef, {nextGame: newGameRef.id}, { merge: true });
}

function generateEmptyGrid(size) {
    let grid = [];

    for (let i = 0; i < size*size; i++) {
      grid.push(-1);
    }

    return grid;
}

function generateSolution(size, gameType, gameGrid) {
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

  const buildGameTemplate = (maxPlayers, gameType, gameGrid) => {
      return {
        finished: false,
        started: false,
        host: auth.currentUser.uid,
        maxPlayers,
        grid: gameGrid,
        gameType: gameType,
        players: [
        {
            id: auth.currentUser.uid,
            name: "Player 1",
            score: 0,
            active: true,
            isReady: false
        }
        ],
        currentTurn: {
            player: auth.currentUser.uid,
            selection: []
        },
        createdAt: new Date()
    }
}

export { restartGame };