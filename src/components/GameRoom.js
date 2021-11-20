import React from 'react';
import styled from 'styled-components';

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(${props => Math.sqrt(props.size)}, 1fr);
    column-gap: 8px;
    row-gap: 8px;
    margin-bottom: 32px;
`;

const GridItem = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px;
    background-color: ${props => {
        if (props.revealed) {
            return props.theme.colors.jungleMist;
        } else if (props.selected) {
            return props.theme.colors.primary;
        } else {
            return props.theme.colors.pickledBluewood;
        }
    }};
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &::after {
        content: '';
        display:block;
        padding-bottom: 100%;
        font-size: 32px;
    }

    i {
        font-size: 32px;
        color: white;
    }
`;

const Players = styled.div`
    display: grid;
    grid-template-columns: repeat(2,1fr);
    column-gap: 12px;
    row-gap: 24px;
`;

const Player = styled.div`
    position: relative;
    border-radius: 8px;
    background-color: ${props => props.current ? props.theme.colors.primary : props.theme.colors.mystic};
    padding: 12px;
    color: white;

    &::before {
        position: absolute;
        display: inline-block;
        content: '';
        width: 24px;
        height: 24px;
        background-color: ${props => props.current ? props.theme.colors.primary : props.theme.colors.mystic};
        right: 50%;
        top: 0;
        transform: translate(50%,-50%) rotate(45deg);
    }
    
    span:first-child {
        display: block;
        color: ${props => props.current ? "white" : props.theme.colors.gothic};
        margin-bottom: 8px;
    }

    span:last-child {
        display: block;
        color: ${props => props.current ? "white" : props.theme.colors.pickledBluewood}
    }
`;

const GameRoom = ({game, selection, onGuess}) => {

    const selectionIncludes = (index) => {
        return selection.find(elm => {
          return index === elm.index
        })
    } 

    const getItemContent = (gridItem, foundSelection) => {
        if (foundSelection) {
            if (game.gameType === 'numbers') {
                return foundSelection.value;
            } else {
                return <span className={`fas fa-${foundSelection.value}`}></span>
            }
        }

        if (gridItem === -1) return '';

        if (game.gameType === 'numbers') {
            return gridItem;
        } else {
            return <span className={`fas fa-${gridItem}`}></span>
        }
    }

    return(
        <React.Fragment>
            <Grid size={game.grid.length}>
                {game.grid.map((gridItem, index) => {
                    const foundSelection = selectionIncludes(index);

                    return (
                    <GridItem selected={foundSelection ? true : false} revealed={gridItem !== -1} onClick={(() => onGuess(index))}>
                        {getItemContent(gridItem, foundSelection)}
                        {/* {(game.gameType === 'numbers' && gridItem !== -1) ? gridItem : '' }
                        {(game.gameType === 'icons' && gridItem !== -1) ? <span className="fas fa-spinner fa-spin"></span> : ''} */}
                    </GridItem>)
                })}
            </Grid>
            <Players>
                {game.players.map((player, index) => {
                    return (
                        <Player current={player.id === game.currentTurn.player}>
                            <span>{`Player ${index + 1}`}</span>
                            <span>{player.score}</span>
                        </Player>
                    )
                })}
            </Players>
        </React.Fragment>
    )
}

export default GameRoom;