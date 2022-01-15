import styled from "styled-components";
import Button from "./shared/Button";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 10;

  &::before {
    position: absolute;
    content: "";
    background-color: #000;
    opacity: 0.5;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
`;

const Modal = styled.div`
  background-color: white;
  padding: 32px;
  border-radius: 20px;
  text-align: center;
  width: 100%;
  margin: 0 24px;
  animation-name: modal-pop-up;
  animation-duration: 0.3s;
  animation-direction: forward;
  transform: scale(1);

  @media only screen and (min-width: 480px) {
    max-width: 450px;
  }

  @media only screen and (min-width: 3840px) {
    max-width: 1024px;
  }

  @keyframes modal-pop-up {
    0% {
      transform: scale(0.8);
    }
    80% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
`;

const Title = styled.h2`
  margin-bottom: 12px;
  color: ${(props) => props.theme.colors.dark};
  font-size: 24px;

  @media only screen and (min-width: 768px) {
    font-size: 48px;
  }

  @media only screen and (min-width: 3840px) {
    font-size: 64px;
    margin-bottom: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  margin-bottom: 24px;
  color: ${(props) => props.theme.colors.gothic};

  @media only screen and (min-width: 768px) {
    font-size: 18px;
  }

  @media only screen and (min-width: 3840px) {
    font-size: 32px;
    margin-bottom: 32px;
  }
`;

const ResultsList = styled.ul`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

const Result = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) =>
    props.isWinner
      ? props.theme.colors.pickledBluewood
      : props.theme.colors.mystic};
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;

  span:first-child {
    color: ${(props) => (props.isWinner ? "white" : props.theme.colors.gothic)};
    font-size: 18px;
  }

  span:last-child {
    font-size: 20px;
    color: ${(props) =>
      props.isWinner ? "white" : props.theme.colors.pickledBluewood};
  }

  :last-child {
    margin-bottom: 0;
  }

  @media only screen and (min-width: 3840px) {
    span:first-child {
      font-size: 32px;
    }

    span:last-child {
      font-size: 40px;
    }
  }
`;

const ButtonGroup = styled.div`
  display: grid;
  column-gap: 8px;
  grid-template-columns: 1fr;

  button {
    margin-bottom: 12px;
  }

  button:last-child {
    margin-bottom: 0;
  }

  @media only screen and (min-width: 480px) {
    grid-template-columns: 1fr 1fr;

    button {
      margin-bottom: 0;
    }

    button:last-child {
      margin-bottom: 0;
    }
  }
`;

const sortByScore = (a, b) => {
  if (a.score < b.score) return 1;
  if (a.score > b.score) return -1;

  return 0;
};

const ResultsModal = ({ game, onRestart, onNewGame, loadingId }) => {
  // Sort players by score
  const sortedPlayers = game.players.sort(sortByScore);

  return (
    <Container>
      <Modal>
        <Title>{sortedPlayers[0].name} Wins!</Title>
        <Subtitle>Game over... here are the results:</Subtitle>
        <ResultsList>
          {sortedPlayers.map((player, index) => {
            return (
              <Result key={player.id} isWinner={index === 0}>
                <span>{player.name}</span>
                <span>{`${player.score} Pairs`}</span>
              </Result>
            );
          })}
        </ResultsList>
        <ButtonGroup>
          <Button
            onClick={onRestart}
            type="primary"
            loadingId={loadingId}
            actionId="restart-game"
          >
            Restart
          </Button>
          <Button
            onClick={onNewGame}
            type="secondary"
            loadingId={loadingId}
            actionId="new-game"
          >
            Setup New Game
          </Button>
        </ButtonGroup>
      </Modal>
    </Container>
  );
};

export default ResultsModal;
