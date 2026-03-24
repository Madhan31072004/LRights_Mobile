import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatbotWidget from "../components/ChatbotWidget";
import "../styles/Layout.css";

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
      <ChatbotWidget />
    </>
  );
};

export default MainLayout;
