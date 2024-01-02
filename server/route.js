const router = require("express").Router();
const bcrypt = require("bcrypt");
const db = require("./db");
const ObjectID = require("mongodb").ObjectId;

const { issueToken, authorize, Roles } = require("./auth");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/* Add A New User */
router.post("/user/register", async (req, res) => {
  const { email, password, role, name, phone } = req.body;

  console.log("User Details: ", email, password, role, name);

  /*  Add this user in your database and store stripe's customer id against the user   */
  try {
    const stripeCustomer = await createStripeCustomer({
      email,
      name,
      password,
      phone,
    });
    console.log("stripeCustomer : ", stripeCustomer);

    bcrypt.hash(password, 10).then(function (hashedPassword) {
      const insertData = {
        name,
        email,
        password: hashedPassword,
        role,
        isActive: false,
      };
      db.getDb()
        .collection("users")
        .insertOne(insertData, (err, result) => {
          if (err) {
            console.log(err);
            return res
              .status(400)
              .json({ message: "Error: Could not add user" });
          }

          const newUser = { _id: result.insertedId, email, name, role };
          const token = issueToken(newUser);
          console.log("newUser: ", newUser);
          console.log("token: ", token);
          res.status(200).json({ ...newUser, token });
        });
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "An error occured" });
  }
});

/* Login with Credentials */
router.post("/auth/login", (req, res) => {
  const { emailId, password } = req.body;
  const query = { emailId };

  db.getDb()
    .collection("users")
    .findOne(query, async (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ message: "Error: Could not get user details" });
      }

      // No record found for the given emailId
      if (!result) {
        return res.status(401).json({ message: "Incorrect Credentials" });
      }

      //User found
      const hashedPassword = result.password;
      let isPasswordCorrect;

      try {
        isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
        console.log(isPasswordCorrect);
      } catch (errBcrypt) {
        console.log(errBcrypt);
        return res
          .status(400)
          .json({ message: "Error: Could not get user password" });
      }

      // Wrong password given
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Incorrect Credentials" });
      }

      //User authenticated
      const user = result;
      delete user.password;

      const token = issueToken(user);
      return res.status(200).json({ ...user, token });
    });
});

/* Get User Profile API*/

router.get("/user/profile", authorize(Roles.All), (req, res) => {
  const query = { _id: ObjectID(req.user._id) };
  db.getDb()
    .collection("users")
    .findOne(query, (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ message: "Error: Could not get user profile" });
      }

      return res.status(200).json(result);
    });
});

/* Update asActive field */

router.patch("/user/status", authorize(Roles.Admin), (req, res) => {
  const { userId, isActive } = req.body;
  const query = { _id: ObjectID(userId) };
  const patchData = { $set: { isActive } };

  db.getDb()
    .collection("users")
    .updateOne(query, patchData, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ message: "Error: Could not update" });
      }

      return res.status(200).json({ message: "User data updated" });
    });
});

module.exports = router;
