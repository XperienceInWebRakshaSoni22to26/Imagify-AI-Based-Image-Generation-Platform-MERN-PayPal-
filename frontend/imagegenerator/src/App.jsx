import React from 'react';
import { Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


import Navbar from "./Components/Navbar";
import Login from "./Components/Login";
import { useContext } from "react";
import Home from "./Pages/Home";
import Result from "./Pages/Result";
import BuyCredit from "./Pages/BuyCredit";
import Footer from "./Components/Footer";
import { AppContext } from './Context/AppContext';
const App = () => {
    const { showLogin } = useContext(AppContext);








    return ( <
        div className = 'px-4 sm:px-10 md:px-14 lg:px-28 min-h-screen bg-gradian-to-b from-teal-50 to-orange-50 ' >

        <
        ToastContainer position = "bottom-right" / >

        <
        Navbar / >



        { showLogin && < Login / > }

        <
        Routes >

        <
        Route path = '/'
        element = { < Home / > }
        />




        <
        Route path = "/result"
        element = { < Result / > }
        />

        <
        Route path = "/buy"
        element = { < BuyCredit / > }
        />

        <
        /Routes>


        <
        Footer / >



        <
        /div>
    )
}

export default App