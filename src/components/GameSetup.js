import React, { useState } from "react";
import styled from "styled-components";
import Button from "./shared/Button";
import Card from "./shared/Card";
import OptionButton from "./shared/OptionButton";
import settingsGroups from "./data/settingsGroups.json";
import { useNavigate } from "react-router";
import { runCloud } from "../firebase/firebaseCloud";
import { MessagesContext } from "./MessagesProvider";
import { useContext } from "react/cjs/react.development";

const PageContainer = styled.div`
  background-color: ${(props) => props.theme.colors.dark};
  display: flex;
  padding: 24px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  animation-name: fade-in;
  animation-iteration-count: 1;
  animation-duration: 0.3s;
  animation-direction: forward;

  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

const Title = styled.h2`
  color: white;
  margin-bottom: 24px;
`;

const SettingsLabel = styled.span`
  display: block;
  font-size: 14px;
  color: ${(props) => props.theme.colors.gothic};
  margin-bottom: 8px;

  @media only screen and (min-width: 768px) {
    font-size: 16px;
  }

  @media only screen and (min-width: 3840px) {
    font-size: 24px;
  }
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => props.children.length}, 1fr);
  column-gap: 8px;
  margin-bottom: 12px;

  @media only screen and (min-width: 480px) {
    margin-bottom: 24px;
  }
`;

const GameSetup = () => {
  const [gameSettings, setGameSettings] = useState({});
  const [loadingId, setLoadingId] = useState();

  const navigate = useNavigate();

  const { addMessage } = useContext(MessagesContext);

  const handleOptionChange = ({ value, optionType }) => {
    if (loadingId) return;
    setGameSettings({ ...gameSettings, [optionType]: value });
  };

  const handleCreateGame = async () => {
    // Check if the settings have been set
    if (
      !gameSettings.maxPlayers ||
      !gameSettings.size ||
      !gameSettings.gameType
    ) {
      return;
    }

    // Shows a loading spinner on a button
    setLoadingId("create-game");

    const response = await runCloud("createGame", {
      maxPlayers: gameSettings.maxPlayers,
      size: gameSettings.size,
      gameType: gameSettings.gameType,
    });

    // Display an error message if there's one
    if (response.status === "error") {
      addMessage(response.body, "error");
      return;
    }

    navigate("/game/" + response.body);
  };

  return (
    <PageContainer>
      <Title>memory</Title>
      <Card>
        {settingsGroups.map((group, index) => {
          return (
            <React.Fragment key={index}>
              <SettingsLabel>{group.label}</SettingsLabel>
              <ButtonGroup>
                {group.options.map((option, optionIndex) => {
                  return (
                    <OptionButton
                      key={optionIndex}
                      onClick={handleOptionChange}
                      optionType={group.type}
                      value={option.value}
                      isActive={gameSettings[group.type] === option.value}
                    >
                      {option.label}
                    </OptionButton>
                  );
                })}
              </ButtonGroup>
            </React.Fragment>
          );
        })}
        <Button
          actionId="create-game"
          loadingId={loadingId}
          onClick={handleCreateGame}
          type="primary"
          width="100%"
          margin={"12px 0 0 0"}
        >
          Start Game
        </Button>
      </Card>
    </PageContainer>
  );
};

export default GameSetup;
