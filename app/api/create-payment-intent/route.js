import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/app/firebaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(req) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const docRef = db.collection("orders").doc(orderId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = docSnap.data();
    const finalPrice = order?.pricing?.finalPrice;

    if (!finalPrice || finalPrice <= 0) {
      return NextResponse.json(
        { error: "Invalid order price" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalPrice * 100), // cents
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { orderId },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("PaymentIntent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
