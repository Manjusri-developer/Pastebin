import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import CreatePaste from "./CreatePaste/CreatePaste";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import PasteView from "./PasteView/PasteView";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
    <ToastContainer position="top-right" autoClose={2000} />
    <BrowserRouter>
  <Routes>
    <Route path="/" element={<CreatePaste/>}/>
    <Route path="/pastes/:id" element={<PasteView/>}/>
    </Routes>
  </BrowserRouter>
    </>
  )
}

export default App;