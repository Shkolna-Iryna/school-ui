import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ColorTabs from "./First.jsx";
import Register from "./Register.jsx";
import Answers from "./Answer.jsx";
import Login from "./Login.jsx";
import Rating from "./Rating.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/answer/:taskId" element={<Answers />} />
        <Route path="sign_in" element={<Register />} />
        <Route path="sub" element={<ColorTabs />} />
        <Route path="rating" element={<Rating />} />
      </Routes>
    </Router>
  );
}
export default App;
