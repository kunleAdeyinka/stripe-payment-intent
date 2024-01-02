# SETUP INTENTS API

- used to setup a payment method for future payments

## Goal

- Have payment credentials saved and optimized for future payments, meaning the payment method is configured for any scenario
- When setting up a card, for example it may be necessary to authenticate the customer or check the card's validty with the customer's bank
- Strope updates the SetupIntent object throught that process.

## Saving and Reusing Payment Methods

- Setup Intents API is useful for businesses that onboard customers but don't charge them right away

### Example:

- A car rental company that collects payment method details before the customer rents the car and charges the card after the rental period ends
- A crowdfunding website that collects card details to be charged later, only if the campaign reaches a certain amount
- A utility company that charges a different amount each month based on usage but collects SEPA payment details before the first month’s payment

## Getting permission to save a payment method

- If you set up a payment method for future off-session payments, you need permission
- Creating an agreement (sometimes called a mandate) up front allows you to charge the customer when they’re not actively using your website or app.
- Add terms to your website or app that state how you plan to process payments, and let customers opt in.
- At a minimum, ensure that your terms cover the following:
  - The customer’s permission to your initiating a payment or a series of payments on their behalf
  - The anticipated frequency of payments (that is, one-time or recurring)
  - How the payment amount will be determined

## Increasing success rate by specifying usage

- The usage parameter tells Stripe how you plan to use paymeent method details later.
- if you only plan to use the card when the customer is checking out, set usage to on_session.
- This lets the bank know you plan to use the card when the customer is available to authenticate, so you can postpone authenticating the card details until then and avoid upfront friction.

## On-Session Payment

- A payment is this if it occurs while the customer is actively in your checkout flow and able to authenticate payment method
