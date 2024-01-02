import React, { useState, useEffect, useRef } from "react";
import { useElements, useStripe } from "@stripe/react-stripe-js";
import { Country, State, City } from "country-state-city";
import Select from "react-select";
import { CardElement } from "@stripe/react-stripe-js";

import style from "./AddPayMethod.module.scss";
import { postRequest } from "../../utils/api";

const AddPayMethod = () => {
  const stripe = useStripe();

  const elements = useElements();
  const card = useRef();

  const [locations, setLocations] = useState({
    countries: "",
    states: "",
    cities: "",
  });
  const [selectedLocation, setSelectedLocation] = useState({
    country: {},
    city: {},
    state: {},
  });

  const [cardInfo, setCardInfo] = useState({
    name: "",
    expiry: "",
    number: "",
    address: {
      line: "",
      postalCode: "",
    },
  });

  const handleChangeName = (e) => {
    const { value } = e.target;
  };

  const handleChangeAddressLine = (e) => {
    const { value } = e.target;
  };

  const parseForSelect = (arr) => {
    return arr.map((item) => ({
      label: item.name,
      value: item.isoCode ? item.isoCode : item.name,
    }));
  };

  const handleSelectCountry = (country) => {
    const states = State.getStatesOfCountry(country.value);

    setSelectedLocation((prev) => {
      return { ...prev, country };
    });

    setLocations((prev) => ({ ...prev, states: parseForSelect(states) }));
  };

  const handleSelectState = (state) => {
    const cities = City.getCitiesOfState(
      selectedLocation.country.value,
      state.value
    );
    setSelectedLocation((prev) => {
      return { ...prev, state };
    });

    setLocations((prev) => ({ ...prev, cities: parseForSelect(cities) }));
  };

  const handleSelectCity = (city) => {
    setSelectedLocation((prev) => {
      return { ...prev, city };
    });
  };

  const handleChangePostalCode = (e) => {
    const { value } = e.target;
    setCardInfo((prev) => {
      return { ...prev, address: { ...prev.address, postalCode: value } };
    });
  };

  const handleSubmit = async () => {
    const address = cardInfo.address;
    const billingDetails = {
      name: cardInfo.name,
      address: {
        country: address.country,
        state: address.state,
        city: address.city,
        line1: address.line,
      },
    };

    try {
      /**
       * const result = await stripe.createPaymentMethod({
        type: "card",
        billing_details: billingDetails,
        card: elements.getElement(CardElement),
      });
       * 
       */

      // insert payment method id and user email into the db
      const paymentObj = {
        paymentMethod: "pm_1OMa3rIBmncyq5NdC71e1iCm", //result.id
        customerId: "cus_PAq9FIUNo8IHeC", // customer id
      };

      //console.log("result : ", result);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const allCountry = Country.getAllCountries();

    setLocations((prev) => {
      return { ...prev, countries: parseForSelect(allCountry) };
    });
  }, []);

  return (
    <div className={style.wrapper}>
      <div className={style.innerWrapper}>
        <div className={style.title}>Add Payment Method</div>

        <div className={style.row}>
          <label>Cardholder Name</label>
          <input
            onChange={handleChangeName}
            type="text"
            name="name"
            placeholder="Enter card holder name"
          />
        </div>

        <div className={style.rowPaymentInput}>
          <CardElement />
        </div>

        <div className={style.addressWrapper}>
          <div className={style.row}>
            <label>Address</label>
            <input
              onChange={handleChangeAddressLine}
              type="text"
              name="address"
              placeholder="Enter Full Address"
            />
          </div>

          <div className={style.rowSelect}>
            <div>
              <label>Country</label>
              <Select
                isClearable={true}
                isSearchable={true}
                name="country"
                value={selectedLocation.country}
                options={locations.countries}
                onChange={handleSelectCountry}
              />
            </div>

            <div>
              <label>State</label>
              <Select
                isClearable={true}
                isSearchable={true}
                name="state"
                value={selectedLocation.state}
                options={locations.states}
                onChange={handleSelectState}
              />
            </div>
          </div>
          <div className={style.rowSelect}>
            <div>
              <label>City</label>
              <Select
                isClearable={true}
                isSearchable={true}
                name="city"
                value={selectedLocation.city}
                options={locations.cities}
                onChange={handleSelectCity}
              />
            </div>
            <div>
              <label>Postal Code</label>
              <input
                onChange={handleChangePostalCode}
                type="text"
                placeholder="Enter Zip Code"
              />
            </div>
          </div>
          <div className={style.btnContainer}>
            <button onClick={handleSubmit}>Save Card</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPayMethod;
