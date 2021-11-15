import {useState} from 'react';
import styled from 'styled-components';
import Button from './shared/Button';
import Card from './shared/Card';

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

    const handleGameTypeChange = (value) => {

    }

    const handlePlayerCountChange = (value) => {

    }

    const handleGridSizeChange = (value) => {
        console.log(value)
    }

    return (
        <PageContainer>
            <Title>memory</Title>
            <Card>
                <SettingsLabel>Select Theme</SettingsLabel>
                <ButtonGroup>
                    <Button onClick={handleGameTypeChange} type="tertiary" value="numbers">Numbers</Button>
                    <Button onClick={handleGameTypeChange} type="tertiary" value="icons">Icons</Button>
                </ButtonGroup>
                <SettingsLabel>Number of Players</SettingsLabel>
                <ButtonGroup>
                    <Button onClick={handlePlayerCountChange} type="tertiary" value={1}>1</Button>
                    <Button onClick={handlePlayerCountChange} type="tertiary" value={2}>2</Button>
                    <Button onClick={handlePlayerCountChange} type="tertiary" value={3}>3</Button>
                    <Button onClick={handlePlayerCountChange} type="tertiary" value={4}>4</Button>
                </ButtonGroup>
                <SettingsLabel>Grid Size</SettingsLabel>
                <ButtonGroup>
                    <Button onClick={handleGridSizeChange} type="tertiary" value={4}>4x4</Button>
                    <Button onClick={handleGridSizeChange} type="tertiary" value={6}>6x6</Button>
                </ButtonGroup>
                <Button type="primary" width="100%" margin={"12px 0 0 0"}>Start Game</Button>
            </Card>
        </PageContainer>
    )
}

export default GameSetup;