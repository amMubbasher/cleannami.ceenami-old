"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import WhoYouAreForm from "./WhoYouAreForm";
import YourHomeForm from "./YourHomeForm";
import ChooseServiceForm from "./ChooseServiceForm";
import AddOnsSelector from "./AddOnsSelector";
import CouponCodeComponent from "./CouponCodeComponent";
import SchedulingComponent from "./SchedulingComponent";
import FrequencyComponent from "./FrequencyComponent";
import AdditionalInformationComponent from "./AdditionalInformationComponent";
import OrderSummaryPopup from "./OrderSummaryPopup";
import { db } from "../firebase-config";
import { collection, addDoc } from "firebase/firestore";
import CleaningTypeForm from "./CleaningTypeForm";

const Main = () => {
  const { register, handleSubmit, setValue, control, watch } = useForm({
    defaultValues: {
      addons: [],
      couponDiscount: 0,
      cleaningType: "residential",
      frequencyDiscount: 0,
      frequency: "one-time",
      frequencyLabel: "One Time",
      subscriptionLength: 1,
      calendarLink: "",
    },
  });

  const bedrooms = watch("bedrooms") || "1";
  const fullBathrooms = watch("fullBathrooms") || "1";
  const halfBathrooms = watch("halfBathrooms") || "0";
  const homeSize = watch("homeSize") || "0-999";
  const addons = watch("addons") || [];
  const couponDiscount = watch("couponDiscount") || 0;
  const frequencyDiscount = watch("frequencyDiscount") || 0;
  const frequencyLabel = watch("frequencyLabel") || "One Time";

  // ✅ NEW: Rule-based pricing
  const getBasePrice = (bedrooms, fullBathrooms, halfBathrooms) => {
    const bedCount = parseInt(bedrooms) || 1;
    const fullBathCount = parseInt(fullBathrooms) || 1;
    const halfBathCount = parseInt(halfBathrooms) || 0;

    const base = 100; // 1 bed, 1 bath
    const extraBedrooms = Math.max(0, bedCount - 1);
    const extraFullBaths = Math.max(0, fullBathCount - 1);
    const extraHalfBaths = halfBathCount;

    const bedPrice = extraBedrooms * 30;
    const fullBathPrice = extraFullBaths * 20;
    const halfBathPrice = extraHalfBaths * 10;

    return base + bedPrice + fullBathPrice + halfBathPrice;
  };

  const getSqFtSurcharge = (sqFtRange) => {
    switch (sqFtRange) {
      case "0-999":
        return 0;
      case "1000-1499":
        return 25;
      case "1500-1999":
        return 50;
      case "2000-2499":
        return 75;
      case "2500-2999":
        return 100;
      case "3000+":
        return 125; // or trigger custom quote UI
      default:
        return 0;
    }
  };

  // ✅ Use updated rule-based pricing
  const baseFromRules = getBasePrice(bedrooms, fullBathrooms, halfBathrooms);
  const sqFtCharge = getSqFtSurcharge(homeSize);
  const basePrice = baseFromRules + sqFtCharge;

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const addonTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
  const subtotal = basePrice + addonTotal;
  const couponDiscountAmount = (subtotal * couponDiscount) / 100;
  const frequencyDiscountAmount = (subtotal * frequencyDiscount) / 100;
  const totalDiscount = couponDiscountAmount + frequencyDiscountAmount;
  const finalPrice = Math.max(basePrice, subtotal - totalDiscount);

  const estimateCleaningJob = (
    homeSize,
    fullBathrooms,
    halfBathrooms,
    bedrooms
  ) => {
    let time = 0;
    switch (homeSize) {
      case "0-999":
        time += 60;
        break;
      case "1000-1499":
        time += 90;
        break;
      case "1500-1999":
        time += 120;
        break;
      case "2000-2499":
        time += 150;
        break;
      case "2500+":
        time += 180;
        break;
      default:
        time += 90;
    }
    time += parseInt(fullBathrooms || 0) * 20;
    time += parseInt(halfBathrooms || 0) * 10;
    time += parseInt(bedrooms || 0) * 15;
    let cleanerCount = 1;
    if (time > 180) cleanerCount = 3;
    else if (time > 120) cleanerCount = 2;
    return {
      estimatedTime: Math.ceil(time),
      cleanerCount,
    };
  };

  const onSubmit = async (data) => {
    const { homeSize, fullBathrooms, halfBathrooms, bedrooms } = data;
    const { estimatedTime, cleanerCount } = estimateCleaningJob(
      homeSize,
      fullBathrooms,
      halfBathrooms,
      bedrooms
    );
    const finalData = {
      ...data,
      pricing: {
        basePrice,
        addonTotal,
        subtotal,
        couponDiscountAmount,
        frequencyDiscountAmount,
        totalDiscount,
        finalPrice,
      },
      estimatedTime,
      cleanerCount,
      status: "open",
      contractors: [],
    };
    // setOrderData(finalData);
    // setIsPopupOpen(true);
    // try {
    //   await addDoc(collection(db, "orders"), finalData);
    //   console.log("Data successfully uploaded to Firestore");
    // } catch (error) {
    //   console.error("Error uploading data to Firestore:", error);
    // }
    try {
      const docRef = await addDoc(collection(db, "orders"), finalData);
      console.log("Order saved with ID:", docRef.id);

      setOrderData({ ...finalData, id: docRef.id }); // keep orderId in state
      setIsPopupOpen(true);
    } catch (error) {
      console.error("Error uploading data to Firestore:", error);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const showCustomQuoteWarning = homeSize === "3000+";

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[95%] lg:w-[80%] mx-auto pb-10"
      >
        <div className="flex max-md:flex-col gap-10 relative mt-16">
          <div className="md:w-[70%]">
            <WhoYouAreForm register={register} />
            <CleaningTypeForm register={register} />
            <YourHomeForm register={register} />
            <ChooseServiceForm register={register} />
            <AddOnsSelector
              register={register}
              setValue={setValue}
              control={control}
            />
            <SchedulingComponent register={register} setValue={setValue} />
            <FrequencyComponent
              register={register}
              setValue={setValue}
              control={control}
            />
            <AdditionalInformationComponent
              register={register}
              control={control}
              watch={watch}
            />
          </div>

          <div className="md:w-[30%] h-full sticky top-[88px] p-6 bg-gradient-to-br from-white to-blue-300 border border-gray-200 rounded-lg ">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Base Cleaning Price:</span>
                <span>${basePrice.toFixed(2)}</span>
              </div>

              {addonTotal > 0 && (
                <div className="flex justify-between">
                  <span>Add-ons:</span>
                  <span>${addonTotal.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {frequencyDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    {frequencyLabel} Discount ({frequencyDiscount}%):
                  </span>
                  <span>-${frequencyDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount ({couponDiscount}%):</span>
                  <span>-${couponDiscountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between text-xl font-bold border-t border-gray-300 pt-3">
              <span>Total:</span>
              <span>${finalPrice.toFixed(2)}</span>
            </div>

            {showCustomQuoteWarning && (
              <p className="mt-3 text-sm text-red-600 italic">
                * For homes over 3000 sq ft, a custom quote may apply.
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-40 mt-8 bg-[#1115ac] text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium text-lg"
        >
          Book Now
        </button>
      </form>

      <OrderSummaryPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        orderData={orderData}
      />
    </>
  );
};

export default Main;
