import ForgotPassword from "./Components/ForgotPassword";
import Home from "./Components/Home";
import Login from "./Components/Login";
import Signup from "./Components/Signup";

import { ThemeProvider } from "./theme/ThemeProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home />} />
          <Route path="/forgot" element={<ForgotPassword />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;