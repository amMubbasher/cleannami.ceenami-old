"use client";

import { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function CheckoutForm({ orderId, finalPrice }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (!orderId) return;
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create PI");
        setClientSecret(data.clientSecret);
      })
      .catch((err) => {
        console.error("Error creating PaymentIntent:", err);
        alert("Unable to start payment. Please try again.");
      });
  }, [orderId]);

  if (!clientSecret) return <p>Loading payment form...</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    if (result.error) {
      alert(result.error.message);
      window.location.href = "/payment/error";
    } else if (result.paymentIntent?.status === "succeeded") {
      window.location.href = "/payment/success";
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4">
      <div className="p-2 border rounded">
        <CardElement />
      </div>
      <button
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        {loading ? "Processing..." : `Pay $${finalPrice}`}
      </button>
    </form>
  );
}
