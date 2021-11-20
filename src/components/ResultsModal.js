import styled from 'styled-components';
import Button from './shared/Button';

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
        content: '';
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
`;

const Title = styled.h2`
    margin-bottom: 12px;
    color: ${props => props.theme.colors.dark}
`;

const Subtitle = styled.p`
    font-size: 16px;
    margin-bottom: 24px;
    color: ${props => props.theme.colors.gothic}
`;

const ResultsList = styled.ul`
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;
`;

const Result = styled.li`
    display: flex;
    justify-content: space-between;
    background-color: ${props => props.isWinner ? props.theme.colors.pickledBluewood : props.theme.colors.mystic};
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 12px;

    span:first-child {
        color: ${props => props.isWinner ? "white" : props.theme.colors.gothic};
        font-size: 18px;
    }

    span:last-child {
        font-size: 20px;
        color: ${props => props.isWinner ? "white" : props.theme.colors.pickledBluewood};
    }

    :last-child {
        margin-bottom: 0;
    }
`

const ButtonGroup = styled.div`
    display: grid;
    column-gap: 8px;
    grid-template-columns: repeat(${props => props.children.length},1fr);
`;

const sortByScore = (a,b) => {
    if (a.score < b.score) return 1;
    if (a.score > b.score) return -1;

    return 0;
}

const ResultsModal = ({game, onRestart, onNewGame}) => {
    const sortedPlayers = game.players.sort(sortByScore);

    return (
        <Container>
            <Modal>
                <Title>{sortedPlayers[0].name} Wins!</Title>
                <Subtitle>Game over... here are the results:</Subtitle>
                <ResultsList>
                    {sortedPlayers.map((player,index) => {
                        return (
                            <Result isWinner={index === 0}>
                                <span>{player.name}</span>
                                <span>{`${player.score} Pairs`}</span>
                            </Result>
                        )
                    })}
                </ResultsList>
                <ButtonGroup>
                    <Button onClick={onRestart} type="primary">Restart</Button>
                    <Button onClick={onNewGame} type="secondary">Setup New Game</Button>
                </ButtonGroup>
            </Modal>
        </Container>
    )
}

export default ResultsModal;