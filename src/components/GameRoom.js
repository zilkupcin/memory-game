import React from "react";
import styled from "styled-components";
import GridItem from "./GridItem";
import { auth } from "../firebase/firebase";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => Math.sqrt(props.size)}, 1fr);
  column-gap: 8px;
  row-gap: 8px;
  margin-bottom: 32px;

  @media only screen and (min-width: 768px) {
    margin: 32px auto 64px auto;
    width: 100%;
    max-width: 80%;
  }

  @media only screen and (min-width: 1024px) {
    max-width: 480px;
  }

  @media only screen and (min-width: 1280px) {
    max-width: 600px;
  }

  @media only screen and (min-width: 3840px) {
    max-width: 1024px;
  }
`;

const Players = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 12px;
  row-gap: 24px;

  @media only screen and (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media only screen and (min-width: 1280px) {
    width: 100%;
    max-width: 1024px;
    margin: 0 auto;
  }

  @media only screen and (min-width: 3840px) {
    max-width: 2048px;
  }
`;

const Player = styled.div`
  position: relative;
  border-radius: 8px;
  background-color: ${(props) =>
    props.current ? props.theme.colors.primary : props.theme.colors.mystic};
  padding: 12px;
  color: white;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;

  &::before {
    position: absolute;
    display: inline-block;
    content: "";
    width: 24px;
    height: 24px;
    background-color: ${(props) =>
      props.current ? props.theme.colors.primary : props.theme.colors.mystic};
    right: 50%;
    top: 0;
    transform: translate(50%, -50%) rotate(45deg);
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  }

  span:first-child {
    display: block;
    color: ${(props) => (props.current ? "white" : props.theme.colors.gothic)};
    margin-bottom: 8px;
  }

  span:last-child {
    display: block;
    color: ${(props) =>
      props.current ? "white" : props.theme.colors.pickledBluewood};
  }

  @media only screen and (min-width: 768px) {
    span:first-child {
      font-size: 20px;
    }

    span:last-child {
      font-size: 24px;
    }
  }

  @media only screen and (min-width: 3840px) {
    padding: 24px;

    span:first-child {
      font-size: 28px;
    }

    span:last-child {
      font-size: 32px;
    }
  }
`;

const GameRoom = ({ game, selection, onGuess }) => {
  const selectionIncludes = (index) => {
    return selection.find((elm) => {
      return index === elm.index;
    });
  };

  const getItemContent = (gridItem, foundSelection) => {
    if (foundSelection) {
      if (game.gameType === "numbers") {
        return foundSelection.value;
      } else {
        return <span className={`fas fa-${foundSelection.value}`}></span>;
      }
    }

    if (gridItem === -1) return "";

    if (game.gameType === "numbers") {
      return gridItem;
    } else {
      return <span className={`fas fa-${gridItem}`}></span>;
    }
  };

  const isCurrentTurn = game.currentTurn.player === auth.currentUser.uid;

  return (
    <React.Fragment>
      <Grid size={game.grid.length}>
        {game.grid.map((gridItem, index) => {
          const foundSelection = selectionIncludes(index);

          return (
            <GridItem
              selected={foundSelection ? true : false}
              revealed={gridItem !== -1}
              index={index}
              key={index}
              onItemClick={onGuess}
              isCurrentTurn={isCurrentTurn}
            >
              {getItemContent(gridItem, foundSelection)}
            </GridItem>
          );
        })}
      </Grid>
      <Players>
        {game.players.map((player, index) => {
          return (
            <Player
              key={player.id}
              current={player.id === game.currentTurn.player}
            >
              <span>
                {`Player ${index + 1}`}{" "}
                {auth.currentUser.uid === player.id ? "(You)" : ""}
              </span>
              <span>{player.score}</span>
            </Player>
          );
        })}
      </Players>
    </React.Fragment>
  );
};

export default GameRoom;
