import { Routes, Route, BrowserRouter } from "react-router-dom";
import Landing from "@/pages/Landing";
import ChatApp from "@/pages/ChatApp";
import Auth from "@/pages/Auth";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<ChatApp />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
  );
}

export default App;
