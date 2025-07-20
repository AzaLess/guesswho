import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import CreateGame from "./pages/CreateGame";
import JoinGame from "./pages/JoinGame";
import WaitingRoom from "./pages/WaitingRoom";
import SubmitFacts from "./pages/SubmitFacts";
import GameRound from "./pages/GameRound";
import Scoreboard from "./pages/Scoreboard";
import EndScreen from "./pages/EndScreen";
import Rules from "./pages/Rules";
import Analytics from "./pages/Analytics";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./styles.css";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/create" element={<CreateGame />} />
          <Route path="/join" element={<JoinGame />} />
          <Route path="/waiting" element={<WaitingRoom />} />
          <Route path="/facts" element={<SubmitFacts />} />
          <Route path="/round" element={<GameRound />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/end" element={<EndScreen />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/secret-analytics" element={<Analytics />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
