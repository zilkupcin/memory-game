import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "./Header";
import WaitingRoom from "./WaitingRoom";
import { db, auth } from "../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import GameRoom from "./GameRoom";
import ResultsModal from "./ResultsModal";
import { runCloud } from "../firebase/firebaseCloud";
import { MessagesContext } from "./MessagesProvider";
import Loading from "./shared/Loading";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
`;

const Game = () => {
  const [game, setGame] = useState();
  const [selection, setSelection] = useState([]);
  const [loadingId, setLoadingId] = useState();

  const gameId = useParams().gameId;
  const navigate = useNavigate();

  const { addMessage } = useContext(MessagesContext);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "game", gameId), (doc) => {
      if (!doc.data()) navigate("/", { replace: true });

      setGame(doc.data());
    });

    return () => {
      unsubscribe();
    };
  }, [gameId]);

  useEffect(() => {
    let removeSelectionTimeout;
    if (selection.length === 2) {
      removeSelectionTimeout = setTimeout(() => {
        setSelection([]);
      }, 2000);
    }

    return () => {
      if (removeSelectionTimeout) clearTimeout(removeSelectionTimeout);
    };
  }, [selection]);

  useEffect(() => {
    if (
      !game ||
      game.started ||
      game.players.length >= game.maxPlayers ||
      game.players.find((player) => player.id === auth.currentUser.uid)
    )
      return;

    joinGame();
  }, [game]);

  useEffect(() => {
    if (game && game.nextGame) {
      navigate(`/game/${game.nextGame}`);
      addMessage("The game has been restarted", "notice");
    }
  }, [game]);

  if (!game) {
    return <i className="fas fa-spinner fa-spin"></i>;
  }

  const currentPlayer = game.players.find(
    (player) => player.id === auth.currentUser.uid
  );

  const handleReadyClick = async () => {
    setLoadingId("toggle-ready");
    const response = await runCloud("setReady", { gameId });

    // Display an error message
    if (response.status === "error") {
      addMessage(response.body, "error");
    }
    setLoadingId(null);
  };

  const handleGuess = async (index) => {
    if (game.currentTurn.player !== auth.currentUser.uid) {
      return;
    }

    const response = await runCloud("guess", { gameId, index });

    // Display an error message if there's one
    if (response.status === "error") {
      addMessage(response.body, "error");
      return;
    }

    let newSelection = [...selection];

    if (newSelection.length === 2) {
      newSelection = [];
    }

    newSelection.push({ index, value: response.body });
    setSelection(newSelection);
  };

  const joinGame = async () => {
    const response = await runCloud("join", { gameId });

    // Display an error message if there's one
    if (response.status === "error") {
      addMessage(response.body, "error");
    }
  };

  const handleRestart = async () => {
    setLoadingId("restart-game");
    const response = await runCloud("restartGame", { gameId });

    // Display an error message if there's one
    if (response.status === "error") {
      addMessage(response.body, "error");
    }

    setLoadingId(null);
  };

  const handleNewGame = async () => {
    setLoadingId("new-game");
    const response = await runCloud("leaveGame");

    // Display an error message if there's one
    if (response.status === "error") {
      addMessage(response.body, "error");
      setLoadingId(null);
      return;
    }

    navigate("/", { replace: true });
  };

  const handleLinkCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    addMessage("Link copied!", "notice");
  };

  if (!currentPlayer) {
    return <Loading readyForTransition={true}></Loading>;
  }

  return (
    <Container>
      <Header
        onNewGame={handleNewGame}
        onRestart={handleRestart}
        isHost={game.host === auth.currentUser.uid}
        loadingId={loadingId}
      ></Header>
      {!currentPlayer && <div>Joining the game</div>}
      {currentPlayer && !game.started && (
        <WaitingRoom
          onToggleReady={handleReadyClick}
          onLinkCopy={handleLinkCopy}
          maxPlayers={game.maxPlayers}
          players={game.players}
          currentPlayer={currentPlayer}
          loadingId={loadingId}
        ></WaitingRoom>
      )}
      {currentPlayer && game.started && (
        <GameRoom
          onGuess={handleGuess}
          game={game}
          selection={selection}
        ></GameRoom>
      )}
      {game.finished && !game.nextGame && (
        <ResultsModal
          onRestart={handleRestart}
          onNewGame={handleNewGame}
          loadingId={loadingId}
          game={game}
        ></ResultsModal>
      )}
    </Container>
  );
};

export default Game;
