const env = require("dotenv").config({ path: "./.env" });
const express = require("express");
const client = require("./db");
const cors = require("cors");
const { resolve } = require("path");
const app = express();
const PORT = 4242;
const bcrypt = require("bcrypt");
const { issueToken, authorize, Roles } = require("./auth");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors());
app.use(express.json());
//app.use("/", express.static(resolve.join(__dirname, "/public")));

app.get("/ping", function (req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

/* Helper Functions  ----------------------------------------------------------------------------------------------------- */

async function createStripeCustomer({ name, email, phone }) {
  return new Promise(async (resolve, reject) => {
    try {
      const Customer = await stripe.customers.create({
        name: name,
        email: email,
        phone: phone,
      });

      resolve(Customer);
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

async function attachMethod({ paymentMethod, customerId }) {
  return new Promise(async (resolve, reject) => {
    try {
      const paymentMethodAttach = await stripe.paymentMethods.attach(
        paymentMethod,
        {
          customer: customerId,
        }
      );
      resolve(paymentMethodAttach);
    } catch (err) {
      reject(err);
    }
  });
}

async function listCustomerPayMethods(customerId) {
  return new Promise(async (resolve, reject) => {
    try {
      const paymentMethods = await stripe.customers.listPaymentMethods(
        customerId,
        {
          type: "card",
        }
      );
      resolve(paymentMethods);
    } catch (err) {
      reject(err);
    }
  });
}

/* Add A New User */
app.post("/user/register", async (req, res) => {
  const { email, name, password, phone, role } = req.body;

  console.log("User Details: ", email, name, password, phone, role);

  /*  Add this user in your database and store stripe's customer id against the user   */
  try {
    const stripeCustomer = await createStripeCustomer({
      email,
      name,
      password,
      phone,
    });
    console.log("stripeCustomer : ", stripeCustomer);

    bcrypt.hash(password, 10).then(async function (hashedPassword) {
      const insertData = {
        name,
        email,
        password: hashedPassword,
        isActive: false,
        stripeId: stripeCustomer.id,
      };

      console.log("hashedPassword user data ", insertData);
      const collection = client.db("stripe-users").collection("users");

      const result = await collection.insertOne(insertData);
      console.log("result is ", result);

      if (result) {
        const newUser = { _id: result.insertedId, email, name, role };
        const token = issueToken(newUser);
        console.log("newUser: ", newUser);
        console.log("token: ", token);
        res.status(200).json({ ...newUser, token });

        client.close();
      } else {
        console.log(err);
        return res.status(400).json({ message: "Error: Could not add user" });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "An error occured" });
  }
});

/** Attach Payment Method To User Info in DB */
app.post("/payment/method/attach", async (req, res) => {
  const { paymentMethod, customerId } = req.body;

  console.log("Payment method is ", paymentMethod);
  console.log("customerId is ", customerId);

  try {
    const method = await attachMethod({ paymentMethod, customerId });
    console.log("**** METHOD INFO ****");
    console.log(method);
    res.status(200).json({ message: "Payment method attached succesully" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Could not attach payment method" });
  }
});

/** Fetches all the Payment Methods Of A User  */
app.get("/payment/methods", async (req, res) => {
  /* Query database to fetch Stripe Customer Id of current logged in user */
  const customerId = "cus_PAq9FIUNo8IHeC";

  try {
    const paymentMethods = await listCustomerPayMethods(customerId);
    res.status(200).json(paymentMethods);
  } catch (err) {
    console.log(err);
    res.status(500).json("Could not get payment methods");
  }
});

/* ---------------------------------------------------------------------- */

app.post("/payment/create", async (req, res) => {
  const { paymentMethod } = req.body;

  /* Query database for getting the payment amount and customer id of the current logged in user */

  const amount = 100;
  const currency = "USD";
  const userCustomerId = "cus_PAq9FIUNo8IHeC";

  console.log("*** Amount == ", amount);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: userCustomerId,
      payment_method: paymentMethod,
      confirmation_method: "manual", // For 3D Security
      description: "Buy Product",
    });

    /* Add the payment intent record to your datbase if required */
    res.status(200).json(paymentIntent);
  } catch (err) {
    console.log(err);
    res.status(500).json("Could not create payment");
  }
});

/* ---------------------------------------------------------------------- */

app.post("/payment/confirm", async (req, res) => {
  const { paymentIntent, paymentMethod } = req.body;
  try {
    const intent = await stripe.paymentIntents.confirm(paymentIntent, {
      payment_method: paymentMethod,
      return_url: "https://localhost:3000/success-payment",
    });

    /* Update the status of the payment to indicate confirmation */
    res.status(200).json(intent);
  } catch (err) {
    console.error(err);
    res.status(500).json("Could not confirm payment");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
