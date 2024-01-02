import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import config from "../utils/config.json";

const stripePromise = loadStripe(config.stripePublishableKey);

const Stripe = (props) => {
  const options = {
    clientSecret: props.client_secret,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {props.children}
    </Elements>
  );
};

export default Stripe;
