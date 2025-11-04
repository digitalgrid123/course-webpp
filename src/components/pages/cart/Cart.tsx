"use client";

import React, { useEffect, useState } from "react";
import { CourseCard } from "@/components/common/CourseCard/CourseCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentModal } from "@/components/common/PaymentModal/PaymentModal";
import Image from "next/image";
import { Formik, Form, Field, FieldProps } from "formik";
import FormInputField from "@/components/common/Form/FormInput";
import { useSelector, useDispatch } from "react-redux";
import {
  updateCartFromStorage,
  purchaseCourses,
  validateCoupon,
  removeCoupon,
  clearCouponError,
} from "@/store/slices/cartSlice";
import { RootState, AppDispatch } from "@/store";
import toast from "react-hot-toast";
import { ShoppingCart, X, CheckCircle } from "lucide-react";

interface CouponFormValues {
  coupon: string;
}

export default function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    dispatch(updateCartFromStorage());
  }, [dispatch]);

  const handleCouponSubmit = async (values: CouponFormValues) => {
    if (!values.coupon.trim()) {
      toast.error("אנא הזן קוד קופון", {});
      return;
    }

    try {
      const result = await dispatch(validateCoupon(values.coupon)).unwrap();

      if (result.status) {
        toast.success(result.message || "הקופון הוחל בהצלחה!", {});
      } else {
        toast.error(result.message || "קוד קופון לא תקין", {});
      }
    } catch (error) {
      console.error("Error during coupon validation:", error);

      let errorMessage = "אירעה שגיאה בזמן בדיקת הקופון";

      if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(errorMessage, {});
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.success("הקופון הוסר", {});
  };

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (cart.coupon.error && e.target.value.trim() !== "") {
      dispatch(clearCouponError());
    }
  };

  const handleOpenPaymentModal = () => {
    if (cart.totalItems === 0) {
      toast.error("אין קורסים בסל", {});
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      const result = await dispatch(purchaseCourses()).unwrap();

      if (result.status) {
        toast.success(result.message || "הרכישה בוצעה בהצלחה!", {});
        setIsPaymentModalOpen(false);

        if (result.data && result.data.skipped_courses.length > 0) {
          toast(
            `חלק מהקורסים לא עובדו: ${result.data.skipped_courses.join(", ")}`
          );
        }
      } else {
        toast.error(result.message || "רכישה נכשלה", {});

        if (result.errors) {
          toast.error(`שגיאות: ${result.errors.join(", ")}`, {});
        }
      }
    } catch (error) {
      console.error("Error during purchase:", error);

      let errorMessage = "אירעה שגיאה בזמן הרכישה";

      if (typeof error === "string") {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {});
    }
  };

  const displayAmount = cart.coupon.validated
    ? cart.coupon.newTotal
    : cart.totalAmount;

  return (
    <div className="p-6 flex flex-col min-h-screen" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-charcoal-blue">הסל שלי</h1>
      </div>
      <div
        className={`grid grid-cols-1 lg:grid-cols-8 gap-8 ${
          cart.items.length > 0 ? "" : "flex-1"
        }`}
      >
        <div
          className={`${
            cart.items.length > 0
              ? "lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "col-span-full flex items-center justify-center"
          }`}
        >
          {cart.items.length > 0 ? (
            cart.items.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.name}
                instructor={course.teacher.name}
                image={course.image}
                price={course.price?.toString()}
                textAlign="center"
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-4">
              <ShoppingCart className="w-20 h-20 text-gray-400" />
              <p className="text-center text-gray-500 text-lg">
                אין קורסים בסל
              </p>
            </div>
          )}
        </div>
        {cart.items.length > 0 && (
          <div className="lg:col-span-3">
            <div className="sticky top-6">
              <Card className="bg-amber-gold text-white rounded-2xl p-0 border-0 w-full">
                <CardContent className="p-6 text-center">
                  <h2 className="text-lg font-bold mb-2">סיכום הזמנה</h2>
                  <div className="flex items-center gap-2 mb-4 justify-center">
                    <Image
                      src={"/assets/images/icons/module-white.svg"}
                      width={16}
                      height={16}
                      alt="module"
                    />
                    <p className="text-xs text-white">
                      {cart.totalItems} מוצרים
                    </p>
                  </div>

                  {cart.coupon.validated && (
                    <div className="mb-3 p-3 bg-white-100 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium text-charcoal-blue">
                          קופון הוחל!
                        </span>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-charcoal-blue hover:text-gray-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between text-charcoal-blue">
                          <span>הנחה:</span>
                          <span>{cart.coupon.discount}%</span>
                        </div>
                        <div className="flex justify-between line-through text-charcoal-blue">
                          <span>מחיר מקורי:</span>
                          <span>{cart.totalAmount}₪</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-right mb-2 text-sm text-white" dir="ltr">
                    ?יש לך קופון
                  </div>

                  <Formik
                    initialValues={{ coupon: "" }}
                    onSubmit={handleCouponSubmit}
                    enableReinitialize
                  >
                    {({ submitForm, values }) => (
                      <Form className="flex flex-col  gap-4">
                        <div className="flex gap-2 items-center">
                          <div className=" flex-1">
                            <Field name="coupon">
                              {({ field }: FieldProps) => (
                                <FormInputField
                                  id="coupon"
                                  type="text"
                                  label=""
                                  placeholder="הזן אותו כאן"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleCouponChange(e);
                                  }}
                                  isRTL
                                  className="bg-gray-100 rounded-lg py-5"
                                  disabled={
                                    cart.coupon.loading || cart.coupon.validated
                                  }
                                />
                              )}
                            </Field>
                          </div>
                          {!cart.coupon.validated ? (
                            <Button
                              type="button"
                              onClick={submitForm}
                              disabled={
                                cart.coupon.loading || !values.coupon.trim()
                              }
                              className="bg-black hover:bg-black/90 text-white px-4 py-3 rounded-md text-sm font-medium whitespace-nowrap h-full"
                            >
                              {cart.coupon.loading ? "..." : "החל"}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={handleRemoveCoupon}
                              className="bg-white hover:bg-black text-charcoal-blue px-4 py-3 rounded-md text-sm font-medium whitespace-nowrap h-full"
                            >
                              הסר
                            </Button>
                          )}
                        </div>

                        {cart.coupon.error && (
                          <div className="text-red-200 text-sm bg-red-600/50 p-2 rounded">
                            {cart.coupon.error}
                          </div>
                        )}

                        <Button
                          type="button"
                          onClick={handleOpenPaymentModal}
                          className="bg-black hover:bg-black/90 text-white w-full py-3 rounded-md text-sm font-medium"
                          disabled={cart.purchaseLoading}
                        >
                          {cart.purchaseLoading
                            ? "מעבד..."
                            : `סה״כ לתשלום ${displayAmount}₪`}
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        isLoading={cart.purchaseLoading}
      />
    </div>
  );
}
