import React, {useState} from 'react';
import { auth, db } from '../firebase/firebase';
import styled from 'styled-components';
import Button from './shared/Button';
import Card from './shared/Card';
import OptionButton from './shared/OptionButton';
import settingsGroups from "./data/settingsGroups.json";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from 'react-router';

const PageContainer = styled.div`
    background-color: ${props => props.theme.colors.dark};
    display: flex;
    padding: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
`;

const Title = styled.h2`
    color: white;
    margin-bottom: 24px;
`;

const SettingsLabel = styled.span`
    display: block;
    font-size: 14px;
    color: ${props => props.theme.colors.gothic};
    margin-bottom: 8px;
`;

const ButtonGroup = styled.div`
    display: grid;
    grid-template-columns: repeat(${props => props.children.length},1fr);
    column-gap: 8px;
    margin-bottom: 12px;
`


const GameSetup = () => {

    const [gameSettings, setGameSettings] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleOptionChange = ({value, optionType}) => {
        if (isLoading) return;
        
        const settings = {...gameSettings};
        settings[optionType] = value;
        setGameSettings(settings);
        console.log(settings)
    }

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
        const validGameTypes = ['icons', 'numbers'];
    
        if (typeof maxPlayers !== "number" || typeof size !== "number") {
          console.log("Invalid data type");
          return;
        }
    
        if (!validSizes.includes(size) || maxPlayers > 4 || maxPlayers < 1) {
          console.log("Invalid game parameters");
          return;
        }
    
        if (!validGameTypes.includes(gameType)) {
          console.log("Invalid game type");
          return;
        }
    
        const gameGrid = generateEmptyGrid();
    
        const gameRef = await addDoc(collection(db, "game"),  {
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

    const handleCreateGame = async () => {
        setIsLoading(true);

        const newGameId = await createGame(gameSettings.maxPlayers, gameSettings.size, gameSettings.gameType); 

        if (newGameId) {
            navigate('/game/' + newGameId);
        }
    }

    return (
        <PageContainer>
            <Title>memory</Title>
            <Card>
                {settingsGroups.map((group, index) => {
                    return (
                        <React.Fragment>
                            <SettingsLabel>{group.label}</SettingsLabel>
                            <ButtonGroup>
                                {group.options.map((option, optionIndex) => {
                                    return (
                                    <OptionButton 
                                        onClick={handleOptionChange} 
                                        optionType={group.type} 
                                        value={option.value}
                                        isActive={gameSettings[group.type] === option.value}>
                                            {option.label}
                                    </OptionButton>)
                                })}
                            </ButtonGroup>
                        </React.Fragment>
                    )
                })}
                <Button isLoading={isLoading} onClick={handleCreateGame} type="primary" width="100%" margin={"12px 0 0 0"}>Start Game</Button>
            </Card>
        </PageContainer>
    )
}

export default GameSetup;