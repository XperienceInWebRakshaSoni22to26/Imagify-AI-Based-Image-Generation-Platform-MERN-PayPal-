import React, { useContext, useEffect } from 'react';
import { plans, assets } from "../assets/assets";
import { AppContext } from "../Context/AppContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const BuyCredit = () => {
    const { user, backendUrl, loadCreditsData, token, setShowLogin } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Dynamically load the PayPal SDK script
        const loadPayPalScript = () => {
            if (!window.paypal) {
                const script = document.createElement("script");
                script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_KEY_ID}&components=buttons`;
                script.async = true;
                script.onload = () => {
                    console.log("PayPal SDK loaded successfully");
                };
                document.body.appendChild(script);
            }
        };

        loadPayPalScript();
    }, []);

    const paymentPaypal = async(planId) => {
        try {
            if (!user) {
                setShowLogin(true);
                return;
            }

            const { data } = await axios.post(
                backendUrl + '/api/user/pay-pal', { planId, userId: user._id }, { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                const containerId = `paypal-container-${planId}`;
                const container = document.getElementById(containerId);
                if (!container) return;
                container.innerHTML = ''; // Clear previous buttons

                if (window.paypal) {
                    window.paypal.Buttons({
                        createOrder: () => data.orderID,
                        onApprove: async(data) => {
                            try {
                                const res = await axios.post(
                                    backendUrl + '/api/user/verify-paypal', { orderID: data.orderID }, { headers: { Authorization: `Bearer ${token}` } }
                                );

                                if (res.data.success) {
                                    toast.success("Credits Added");
                                    loadCreditsData();
                                    navigate('/');
                                } else {
                                    toast.error(res.data.message || "Payment verification failed");
                                }

                                container.innerHTML = '';
                            } catch (err) {
                                toast.error("Error during payment verification");
                                console.error(err);
                                container.innerHTML = '';
                            }
                        },
                        onCancel: () => {
                            toast.info("Payment cancelled");
                            container.innerHTML = '';
                        },
                        onError: (err) => {
                            toast.error("Payment Error: " + err.message);
                            container.innerHTML = '';
                        },
                    }).render(`#${containerId}`);
                } else {
                    toast.error("PayPal SDK not loaded");
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return ( <
        motion.div initial = {
            { opacity: 0.2, y: 100 }
        }
        transition = {
            { duration: 1 }
        }
        whileInView = {
            { opacity: 1, y: 0 }
        }
        viewport = {
            { once: true }
        }
        className = "min-h-[80vh] text-center pt-14 mb-10" >
        <
        button className = "border border-gray-400 px-10 py-2 rounded-full mb-6" >
        Our Plans <
        /button> <
        h1 className = "text-center text-3xl font-medium mb-6" > Choose the plan < /h1>

        <
        div className = "flex flex-wrap justify-center gap-6 text-left" > {
            plans.map((item, index) => ( <
                div key = { index }
                className = "bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500 w-72" >
                <
                img width = { 40 }
                src = { assets.logo_icon }
                alt = "" / >
                <
                p className = "mt-3 mb-1 font-semibold" > { item.id } < /p> <
                p className = "text-sm" > { item.desc } < /p> <
                p className = "mt-6" >
                <
                span className = "text-3xl font-medium" > $ { item.price } < /span> / { item.credits }
                credits <
                /p>

                <
                button onClick = {
                    () => paymentPaypal(item.id)
                }
                className = "w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5" > { user ? 'Purchase' : 'Get Started' } <
                /button>

                { /* 👇 PayPal button will appear here */ } <
                div id = { `paypal-container-${item.id}` }
                className = "mt-4" > < /div> < /
                div >
            ))
        } <
        /div> < /
        motion.div >
    );
};

export default BuyCredit;