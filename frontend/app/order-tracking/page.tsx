"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");

  return (
    <div className="min-h-screen bg-accent/5 py-24">
      <Container>
        <div className="mx-auto max-w-2xl rounded-[32px] border border-accent/20 bg-white p-8 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">EcoMarche tracking</span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-secondary">Track Your Order</h1>
          <p className="mt-3 text-sm font-bold leading-6 text-gray-500">
            Enter your order ID from checkout. Logged-in customers can also open order details from the account dashboard.
          </p>
          <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => event.preventDefault()}>
            <input
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="Order ID or order number"
              className="h-14 flex-1 rounded-2xl border border-accent/20 bg-accent/5 px-5 text-sm font-bold outline-none focus:border-primary"
            />
            <Link href={orderId ? `/orders/${encodeURIComponent(orderId)}` : "/dashboard/orders"}>
              <Button type="button" className="h-14 w-full sm:w-auto">Track</Button>
            </Link>
          </form>
        </div>
      </Container>
    </div>
  );
}
