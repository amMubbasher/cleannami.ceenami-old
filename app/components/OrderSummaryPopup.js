"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const OrderSummaryPopup = ({ isOpen, onClose, orderData }) => {
  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Extract data for display
  const {
    firstName = "",
    lastName = "",
    email = "",
    phone = "",
    address = "",
    city = "",
    state = "",
    bedrooms = "",
    scheduledDate = "",
    scheduledTime = "",
    frequencyLabel = "One Time",
    pricing = {},
    addons = [],
  } = orderData || {};

  const {
    basePrice = 100,
    addonTotal = 0,
    subtotal = 100,
    couponDiscountAmount = 0,
    frequencyDiscountAmount = 0,
    finalPrice = 100,
  } = pricing || {};

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
              },
            }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
          >
            {/* Header with gradient background */}
            <div className="relative bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-6 text-white">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.2, duration: 0.4 },
                }}
              >
                <h2 className="text-2xl font-bold">
                  Your Booking is Confirmed!
                </h2>
                <p className="opacity-90 mt-1">
                  We've received your cleaning request
                </p>
              </motion.div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {/* Order Info */}
              {/* <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.3 } }}
                className="mb-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{scheduledDate}</h3>
                    <p className="text-sm text-gray-500">{scheduledTime} • {frequencyLabel}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{address}</h3>
                    <p className="text-sm text-gray-500">{city}, {state}</p>
                  </div>
                </div>
              </motion.div> */}

              {/* Price Breakdown */}
              <motion.div
                className="bg-gray-50 rounded-xl p-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.4, duration: 0.4 },
                }}
              >
                <h3 className="font-medium text-gray-900 mb-3">
                  Price Breakdown
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Cleaning</span>
                    <span>${basePrice.toFixed(2)}</span>
                  </div>

                  {addonTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Add-ons</span>
                      <span>${addonTotal.toFixed(2)}</span>
                    </div>
                  )}

                  {addons.length > 0 && (
                    <div className="pl-4 pt-1 pb-1 text-xs text-gray-500 border-l-2 border-gray-200">
                      {addons.map((addon, index) => (
                        <div key={index} className="flex justify-between mb-1">
                          <span>{addon.id.replace("_", " ")}</span>
                          <span>${addon.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-dashed border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>

                    {couponDiscountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount</span>
                        <span>-${couponDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {frequencyDiscountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{frequencyLabel} Discount</span>
                        <span>-${frequencyDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between font-bold text-lg mt-3 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-blue-600">
                    ${finalPrice.toFixed(2)}
                  </span>
                </div>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.5, duration: 0.4 },
                }}
              >
                <h3 className="font-medium text-gray-900 mb-3">
                  Contact Information
                </h3>
                <p className="text-sm text-gray-600">
                  {firstName} {lastName}
                </p>
                <p className="text-sm text-gray-600">{email}</p>
                <p className="text-sm text-gray-600">{phone}</p>
              </motion.div>
            </div>
            {/* checkout btn */}
            <div className="px-6 pb-6">
              <button
                onClick={() => {
                  window.location.href = `/checkout?orderId=${orderData.id}`;
                }}
                // onClick={() => window.location.href = "/checkout"}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderSummaryPopup;
