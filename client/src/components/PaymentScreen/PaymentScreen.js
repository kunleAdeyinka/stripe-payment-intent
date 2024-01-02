import React, { useState } from "react";

import style from "./PaymentScreen.module.scss";
import ListPaymentMethods from "../ListPaymentMethods";
import { postRequest } from "../../utils/api";
import PaymentForm from "../PaymentForm/PaymentForm";

const PaymentScreen = () => {
  const [selectedMethod, setSelectedMethod] = useState({});
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [activeScreen, setActiveScreen] = useState({
    prePayment: true,
    paymentMethods: false,
    paymentForm: false,
  });

  const createPaymentIntent = (selectedPaymentMethodId) => {
    console.log("payment intent id ", selectedPaymentMethodId);

    postRequest(`/payment/create`, {
      paymentMethod: selectedPaymentMethodId,
    })
      .then((resp) => {
        setPaymentIntent(resp.data);
        setActiveScreen({ paymentForm: false, paymentMethods: true });
        changeActiveScreen("paymentForm");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSelectCard = (method) => {
    setSelectedMethod(method);
    createPaymentIntent(method.id);
  };

  const changeActiveScreen = (screen) => {
    let toUpdate = {
      prePayment: false,
      paymentMethods: false,
      paymentForm: false,
    };
    toUpdate[screen] = true;
    setActiveScreen(toUpdate);
  };

  const handleClickMakePayment = () => {
    changeActiveScreen("paymentMethods");
  };

  return (
    <div className={style.wrapper}>
      {activeScreen.prePayment && (
        <button onClick={handleClickMakePayment}>Make Payment</button>
      )}

      {activeScreen.paymentMethods && (
        <ListPaymentMethods handleSelectCard={handleSelectCard} />
      )}

      {activeScreen.paymentForm && paymentIntent && (
        <PaymentForm
          paymentIntent={paymentIntent}
          paymentMethod={selectedMethod}
        />
      )}
    </div>
  );
};

export default PaymentScreen;
