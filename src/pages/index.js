import React, { useState, useEffect } from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import PaymentForm from "../components/paymentForm"
/**
 * function to load the Square Sdk and add it to the <head> element
 */
const loadSquareSdk = () => {
  return new Promise((resolve, reject) => {
    const sqPaymentScript = document.createElement("script")
    // sandbox: https://js.squareupsandbox.com/v2/paymentform
    // production: https://js.squareup.com/v2/paymentform
    sqPaymentScript.src = "https://js.squareupsandbox.com/v2/paymentform"
    sqPaymentScript.type = "text/javascript"
    sqPaymentScript.crossorigin = "anonymous"
    sqPaymentScript.onload = () => {
      resolve()
    }
    sqPaymentScript.onerror = () => {
      reject(`Failed to load ${sqPaymentScript.src}`)
    }
    document.getElementsByTagName("head")[0].appendChild(sqPaymentScript)
  })
}

const IndexPage = () => {
  const [squareStatus, setSquareStatus] = useState("notLoaded")
  
  /**
   * Use effect hook [https://reactjs.org/docs/hooks-effect.html]
   * to call the function to set the square sdk upon mounting the page
   * Sets the state depending on the response returned
   */
  useEffect(() => {
    loadSquareSdk()
      .then(() => {
        setSquareStatus("SUCCESS")
      })
      .catch(() => setSquareStatus("ERROR"))
  }, [])
  
  return (
    <Layout>
      <SEO title="Home" />
      <h1 style={{textAlign:'center'}}>Thank you for purchasing </h1>
      <h2 style={{textAlign:'center'}}>Awesome dog chew toy for $2</h2>
      {
        squareStatus==="notLoaded" && (
          <>
            <h3 style={{textAlign:'center'}}>Please hold a moment while we're presently setting up your payment!</h3>
            <h3 style={{textAlign:'center'}}>Thank you for your patience</h3>
          </>
        )
      }
      {squareStatus === "ERROR" && (
        <p>Failed to load SquareSDK, Please refresh the page</p>
      )}
      {squareStatus === "SUCCESS" && (
         <PaymentForm paymentForm={window.SqPaymentForm} ammount={2} />
        
      )}
    </Layout>
  )
}
export default IndexPage
