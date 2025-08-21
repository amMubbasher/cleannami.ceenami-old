"use client";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase-config";
import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);
export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      const docRef = doc(db, "orders", orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOrderData({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchOrder();
  }, [orderId]);

  if (!orderData) return <p>Loading order...</p>;

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        orderId={orderData.id}
        finalPrice={orderData.pricing.finalPrice}
      />
    </Elements>
  );
}
