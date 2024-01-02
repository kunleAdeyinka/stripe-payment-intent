import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "./App.css";
import StripeWrapper from "./components/StripeWrapper";
import Register from "./components/Register";
import AddPayMethod from "./components/AddPayMethod";
import PaymentScreen from "./components/PaymentScreen";
import PaymentSuccess from "./components/PaymentSuccess";

function App() {
  return (
    <StripeWrapper>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/add-payment-method" element={<AddPayMethod />} />
          <Route path="/make-payment" element={<PaymentScreen />} />
          <Route path="/success-payment" element={<PaymentSuccess />} />
        </Routes>
      </Router>
    </StripeWrapper>
  );
}

export default App;
