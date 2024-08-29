import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/homeComponents/Layout";
import Home from "./pages/Home";



const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<Home />} /> 


        </Route>
      </Routes>
    </BrowserRouter>
  
    

  );
};

export default App;
