"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { CourseCard } from "@/components/common/CourseCard/CourseCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Formik, Form, Field, FieldProps } from "formik";
import FormInputField from "@/components/common/Form/FormInput";
import { useSelector, useDispatch } from "react-redux";
import {
  updateCartFromStorage,
  purchaseCourses,
} from "@/store/slices/cartSlice";
import { RootState, AppDispatch } from "@/store";
import toast from "react-hot-toast";

export default function Cart() {
  const t = useTranslations("MyCart");
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    dispatch(updateCartFromStorage());
  }, [dispatch]);

  const handlePurchase = async () => {
    if (cart.totalItems === 0) {
      toast.error(t("noCoursesInCart") || "No courses in cart", {
        duration: 4000,
        position: "top-center",
      });
      return;
    }

    try {
      const result = await dispatch(purchaseCourses()).unwrap();

      if (result.status) {
        toast.success(
          t("purchaseSuccess") ||
            `Purchase completed successfully! Added courses: ${result.data?.added_courses.join(
              ", "
            )}`,
          {
            duration: 4000,
            position: "top-center",
            style: {
              background: "#4CAF50",
              color: "#fff",
            },
          }
        );

        if (result.data && result.data.skipped_courses.length > 0) {
          toast(
            t("someCoursesSkipped") ||
              `Some courses were not processed: ${result.data.skipped_courses.join(
                ", "
              )}`,
            {
              duration: 4000,
              position: "top-center",
              style: {
                background: "#FFC107",
                color: "#000",
              },
              icon: "⚠️",
            }
          );
        }
      } else {
        toast.error(
          result.message ||
            t("purchaseFailed") ||
            "Failed to complete purchase.",
          {
            duration: 4000,
            position: "top-center",
            style: {
              background: "#F44336",
              color: "#fff",
            },
          }
        );

        if (result.errors) {
          toast.error(`Errors: ${result.errors.join(", ")}`, {
            duration: 4000,
            position: "top-center",
            style: {
              background: "#F44336",
              color: "#fff",
            },
          });
        }
      }
    } catch (error) {
      console.error("Error during purchase:", error);

      // Handle error properly based on type
      let errorMessage =
        t("purchaseError") || "An error occurred during purchase.";

      if (typeof error === "string") {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#F44336",
          color: "#fff",
        },
      });
    }
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-charcoal-blue">
          {t("myCart")}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <p className="text-center col-span-full">{t("noCoursesInCart")}</p>
          )}
        </div>

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
                  <p className="text-xs text-white">{cart.totalItems} מוצרים</p>
                </div>

                <div className="text-right mb-2 text-sm text-white" dir="ltr">
                  ?יש לך קופון
                </div>

                <Formik
                  initialValues={{ coupon: "" }}
                  onSubmit={handlePurchase}
                >
                  {() => (
                    <Form className="flex flex-col gap-4">
                      <Field name="coupon">
                        {({ field }: FieldProps) => (
                          <FormInputField
                            id="coupon"
                            type="text"
                            label=""
                            placeholder="הזן אותו כאן"
                            {...field}
                            isRTL
                            className="bg-gray-100 rounded-lg py-5!"
                          />
                        )}
                      </Field>

                      <Button
                        type="submit"
                        className="bg-black hover:bg-black/90 text-white w-full py-3 rounded-md text-sm font-medium"
                        disabled={cart.totalItems === 0 || cart.purchaseLoading}
                      >
                        {cart.purchaseLoading
                          ? "מעבד..."
                          : `סה״כ לתשלום ${cart.totalAmount}₪`}
                      </Button>
                    </Form>
                  )}
                </Formik>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
