import styled from "styled-components";
import Button from "./shared/Button";

const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @media only screen and (min-width: 1280px) {
    width: 100%;
    max-width: 1024px;
    margin: 0 auto;
  }

  @media only screen and (min-width: 3840px) {
    max-width: 2048px;
  }
`;

const Logo = styled.h1`
  color: ${(props) => props.theme.colors.dark};
  font-size: 20px;

  @media only screen and (min-width: 768px) {
    font-size: 32px;
  }

  @media only screen and (min-width: 3840px) {
    font-size: 48px;
  }
`;

const ButtonGroup = styled.div`
  button:first-child {
    margin-right: 8px;
  }

  button:only-child {
    margin-right: 0;
  }
`;

const Header = ({ isHost, onNewGame, onRestart, loadingId }) => {
  return (
    <StyledHeader>
      <Logo>memory</Logo>
      <ButtonGroup>
        {isHost && (
          <Button
            type="primary"
            onClick={onRestart}
            loadingId={loadingId}
            actionId="restart-game"
          >
            Restart
          </Button>
        )}
        <Button
          onClick={onNewGame}
          type="secondary"
          loadingId={loadingId}
          actionId="new-game"
        >
          New Game
        </Button>
      </ButtonGroup>
    </StyledHeader>
  );
};

export default Header;
