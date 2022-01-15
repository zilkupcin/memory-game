import styled from "styled-components";
import Button from "./shared/Button";
import { auth } from "../firebase/firebase";

const Container = styled.div`
  flex: 1;

  @media only screen and (min-width: 480px) {
    width: 100%;
    max-width: 460px;
    margin: 32px auto 0 auto;
  }
`;

const PlayerList = styled.ul`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

const Player = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  background-color: ${(props) =>
    props.isReady ? props.theme.colors.dark : props.theme.colors.mystic};
  color: ${(props) => (props.isReady ? "white" : props.theme.colors.gothic)};
  margin-bottom: 12px;
  transition: all 0.2s ease-in-out;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PlayerName = styled.span`
  font-size: 16px;

  @media only screen and (min-width: 768px) {
    font-size: 20px;
  }
`;

const PlayerState = styled.span`
  font-size: 20px;

  @media only screen and (min-width: 768px) {
    font-size: 24px;
  }
`;

const Title = styled.h2`
  margin-bottom: 12px;
  color: ${(props) => props.theme.colors.dark};
  text-align: center;

  @media only screen and (min-width: 768px) {
    font-size: 48px;
    margin-bottom: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  margin-bottom: 24px;
  color: ${(props) => props.theme.colors.gothic};
  text-align: center;

  @media only screen and (min-width: 768px) {
    font-size: 20px;
    margin-bottom: 32px;
  }
`;

const WaitingRoom = ({
  players,
  onToggleReady,
  onLinkCopy,
  currentPlayer,
  maxPlayers,
  loadingId,
}) => {
  return (
    <Container>
      <Title>{`${players.length}/${maxPlayers} players are here`}</Title>
      <Subtitle>
        {maxPlayers !== 1
          ? "Waiting for other players to join"
          : "Begin the game when ready!"}
      </Subtitle>
      <PlayerList>
        {players.map((player, index) => {
          return (
            <Player key={player.id} isReady={player.isReady ? true : false}>
              <PlayerName>
                Player {index + 1}{" "}
                {auth.currentUser.uid === player.id ? "(You)" : ""}
              </PlayerName>
              <PlayerState>
                {player.isReady ? "Ready" : "Not ready"}
              </PlayerState>
            </Player>
          );
        })}
      </PlayerList>
      <Button
        width="100%"
        onClick={onToggleReady}
        margin="0 0 8px 0"
        type="primary"
        loadingId={loadingId}
        actionId="toggle-ready"
      >
        {currentPlayer.isReady ? "I'm not ready" : "I'm ready!"}
      </Button>
      <Button
        width="100%"
        onClick={onLinkCopy}
        type="secondary"
        actionId="copy-invite-link"
      >
        Copy invite link
      </Button>
    </Container>
  );
};

export default WaitingRoom;
