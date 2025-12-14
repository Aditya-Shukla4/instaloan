import { Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import ChatApp from "@/pages/ChatApp"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<ChatApp />} />
    </Routes>
  );
}

export default App;
