import { useEffect } from "react";
import { useState } from "react";
import "./reset.css";
import "./App.css";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";
import Theme from "./components/Theme";
import GameSetup from "./components/GameSetup";
import Game from "./components/Game";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Messages from "./components/Messages";
import MessagesProvider from "./components/MessagesProvider";
import Loading from "./components/shared/Loading";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [readyForTransition, setReadyForTransition] = useState(false);

  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    setReadyForTransition(true);
  });

  const signIn = async () => {
    await signInAnonymously(auth);
  };

  useEffect(() => {
    if (auth.currentUser) return;
    signIn();
  }, []);

  useEffect(() => {
    if (!readyForTransition) return;

    // Delay for a smooth transition between pages
    const transitionTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(transitionTimeout);
    };
  }, [readyForTransition]);

  if (isLoading)
    return (
      <Theme>
        <Loading readyForTransition={readyForTransition}></Loading>
      </Theme>
    );

  return (
    <Theme>
      <MessagesProvider>
        <Router>
          <Routes>
            <Route path="/" element={<GameSetup></GameSetup>}></Route>
            <Route path="/game/:gameId" element={<Game></Game>}></Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
        <Messages></Messages>
      </MessagesProvider>
    </Theme>
  );
}

export default App;
