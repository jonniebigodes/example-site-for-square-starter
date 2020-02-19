import React, { Component } from "react"
import axios from 'axios'
import { navigate } from "gatsby"
import "./square.css"
export default class PaymentForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      cardBrand: "",
      paymentNounce: "",
      googlePay: "",
      applePay: "",
      masterPass: "",
      error:false
    }
    this.requestCardNonce = this.requestCardNonce.bind(this)
  }
  requestCardNonce() {
    this.paymentForm.requestCardNonce()
  }
  componentDidMount() {
    const config = {
      // Initialize the payment form elements

      //TODO: Replace with your sandbox application ID defined in your .env (either development or production) file
      applicationId: process.env.GATSBY_SQUARE_APLLICATION_ID,
      locationId: process.env.GATSBY_SQUARE_LOCATION_ID,
      inputClass: "sq-input",
      autoBuild: false,
      // Customize the CSS for SqPaymentForm iframe elements
      inputStyles: [
        {
          fontSize: "16px",
          lineHeight: "24px",
          padding: "16px",
          placeholderColor: "#a0a0a0",
          backgroundColor: "transparent",
        },
      ],
      // Initialize the payment methods placeholders
      applePay: {
        elementId: "sq-apple-pay",
      },
      masterpass: {
        elementId: "sq-masterpass",
      },
      googlePay: {
        elementId: "sq-google-pay",
      },
      cardNumber: {
        elementId: "sq-card-number",
        placeholder: "Your Card Number",
      },
      cvv: {
        elementId: "sq-cvv",
        placeholder: "CVV",
      },
      expirationDate: {
        elementId: "sq-expiration-date",
        placeholder: "MM/YY",
      },
      postalCode: {
        elementId: "sq-postal-code",
        placeholder: "Zip Code",
      },
      /**
       * SqPaymentForm callback functions.
       * For more information see https://developer.squareup.com/docs/api/paymentform#_callbackfunctions_detail
       */
      callbacks: {
        /*
         * callback function: methodsSupported
         * this will be called multiple times, depending on the payment options available
         * Triggered when: the page is loaded
         * You can read more about it in https://developer.squareup.com/docs/api/paymentform#methodssupported
         */
        methodsSupported: methods => {
          if (methods.googlePay) {
            this.setState({ googlePay: methods.googlePay })
          }
          if (methods.applePay) {
            this.setState({ applePay: methods.applePay })
          }
          if (methods.masterpass) {
            this.setState({ masterpass: methods.masterpass })
          }
          return
        },
        /*
         * callback function: createPaymentRequest
         * required for Apple Pay, Google Pay, Masterpass (leave it or the build will not go through, generates misleading cross origin error)
         * Triggered when: a digital wallet payment button is clicked
         * You can read more about it in https://developer.squareup.com/docs/api/paymentform#cardnonceresponsereceived
         */
        createPaymentRequest: () => {
          return {
            requestShippingAddress: false,
            requestBillingInfo: true,
            currencyCode: "USD",
            countryCode: "US",
            total: {
              label: "MERCHANT NAME",
              amount: "100",
              pending: false,
            },
            lineItems: [
              {
                label: "Subtotal",
                amount: "100",
                pending: false,
              },
            ],
          }
        },
        /*
         * callback function: cardNonceResponseReceived
         * Triggered when: SqPaymentForm completes a card nonce request
         * You can read more about it in https://developer.squareup.com/docs/api/paymentform#cardnonceresponsereceived
         */
        cardNonceResponseReceived: (errors, nonce, cardData) => {
          if (errors) {
            // Log errors from nonce generation to the Javascript console
            console.log("Encountered errors:")
            errors.forEach(function(error) {
              console.log("  " + error.message)
            })
            return
          }
          this.setState({
            paymentNounce: nonce,
          })
          // adjust the endpoint accordingly before deploying
          axios.post(process.env.NODE_ENV==='development'?'http://localhost:9000/processpay':'https://your-website/.netlify/functions/processpay',{
            paymentAmmount:this.props.ammount*100, 
            currency:"USD",
            cardNounce:nonce
          }).then(result=>{
            // navigates to the paymentreciept page
            navigate("/paymentreciept/",{
              state:result.data
            })
          }).catch(error=>{
            console.log(`error in processing payment:${error}`)
            this.setState({error:true})
          })
        },
        /*
         * callback function: unsupportedBrowserDetected
         * Invoked when the payment form is hosted in an unsupported browser.
         * https://developer.squareup.com/docs/api/paymentform#unsupportedbrowserdetected
         */
        unsupportedBrowserDetected: () => {},
        /*
         * callback function: inputEventReceived
         * Triggered when: Visitors interact with SqPaymentForm iframe elements.
         * You can read more about it https://developer.squareup.com/docs/api/paymentform#inputeventreceived
         */
        inputEventReceived: inputEvent => {
          switch (inputEvent.eventType) {
            case "focusClassAdded":
              break
            case "focusClassRemoved":
              break
            case "errorClassAdded":
              document.getElementById("error").innerHTML =
                "Please fix card information errors before continuing."
              break
            case "errorClassRemoved":
              document.getElementById("error").style.display = "none"
              break
            case "cardBrandChanged":
              if (inputEvent.cardBrand !== "unknown") {
                this.setState({
                  cardBrand: inputEvent.cardBrand,
                })
              }
              break
            case "postalCodeChanged":
              break
            default:
              break
          }
        },
        paymentFormLoaded: () => {
          console.log("form was loaded")
        },
      },
    }
    this.paymentForm = new this.props.paymentForm(config, this.props.ammount)
    this.paymentForm.build()
  }
  render() {
    const { masterpass, googlePay, applePay,cardBrand,error} = this.state
    if (error){
      return (
        <>
          <h1>Something went wrong!</h1>
          <h2>Check the console to see what might have happened</h2>
        </>
      )
    }
    return (
        <>
          <div id="form-container">
            <div id="sq-ccbox">
              <p>
                <span className="leftCenter">{`Enter your ${cardBrand!==""?cardBrand.toUpperCase():""} Card Info Below`} </span>
              </p>
              <div id="sq-card-number"></div>
              <input type="hidden" id="card-nonce" name="nonce" />
              <div className="third" id="sq-expiration-date"></div>
              <div className="third" id="sq-cvv"></div>
              <div className="third" id="sq-postal-code"></div> 
            </div>
            <p style={{ textAlign: "center" }} id="error" />
            <button
              id="sq-creditcard"
              className="button-credit-card"
              onClick={this.requestCardNonce}
            >
              {" "}
              Pay with credit card
            </button>
            <div id="sq-walletbox">
              <button
                style={{ display: masterpass ? "block" : "none" }}
                className="button-masterpass"
                id="sq-masterpass"
              />
              <button
                style={{ display: googlePay ? "inherit" : "none" }}
                className="button-google-pay"
                id="sq-google-pay"
              />
              <button
                style={{ display: applePay ? "inherit" : "none" }}
                className="button-applepay"
                id="sq-apple-pay"
              />
              <hr />
            </div>
          </div>
        </>
    )
  }
}
/* paymentForm.propTypes={
  PaymentForm:PropTypes.any,
  ammount:PropTypes.number.isRequired
}
paymentForm.defaultProps={
  paymentForm:null,
  ammount:1
} */