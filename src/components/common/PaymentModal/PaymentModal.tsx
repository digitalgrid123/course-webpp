"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/common/Modal/Modal";
import { Button } from "@/components/ui/button";
import { Formik, Form, Field, FieldProps } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

interface PaymentFormValues {
  fullName: string;
  idNumber: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  isLoading: boolean;
}

interface MonthYearOption {
  value: string;
  label: string;
}

// Yup validation schema
const paymentValidationSchema = Yup.object({
  fullName: Yup.string()
    .required("שדה חובה")
    .min(2, "שם מלא חייב להכיל לפחות 2 תווים")
    .matches(
      /^[a-zA-Z\u0590-\u05FF\s]+$/,
      "שם מלא יכול להכיל רק אותיות בעברית או אנגלית"
    ),

  idNumber: Yup.string()
    .required("שדה חובה")
    .matches(/^\d+$/, "תעודת זהות יכולה להכיל רק ספרות")
    .min(8, "תעודת זהות חייבת להכיל 8-9 ספרות")
    .max(9, "תעודת זהות חייבת להכיל 8-9 ספרות"),

  cardNumber: Yup.string()
    .required("שדה חובה")
    .matches(
      /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/,
      "מספר כרטיס חייב להיות 16 ספרות בפורמט XXXX XXXX XXXX XXXX"
    )
    .test("card-match", "מספר כרטיס לא תקין", function (value) {
      if (!value) return false;

      const cleanCardNumber = value.replace(/\s/g, "");
      const validCardNumber =
        process.env.NEXT_PUBLIC_VALID_CARD_NUMBER || "4580000000000000";

      return cleanCardNumber === validCardNumber;
    }),

  expiryDate: Yup.string()
    .required("שדה חובה")
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "פורמט לא תקין (MM/YY)")
    .test("expiry", "תאריך התפוגה חייב להיות בעתיד", function (value) {
      if (!value) return false;

      const [month, year] = value.split("/");
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison

      return expiryDate > currentDate;
    }),

  cvv: Yup.string()
    .required("שדה חובה")
    .matches(/^\d{3,4}$/, "CVV חייב להיות 3 או 4 ספרות")
    .test("cvv-match", "CVV לא תקין", function (value) {
      if (!value) return false;

      const validCvv = process.env.NEXT_PUBLIC_VALID_CVV || "123";
      return value === validCvv;
    }),
});

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  isLoading,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePaymentSubmit = async (values: PaymentFormValues) => {
    // Additional validation to ensure everything matches
    const cleanCardNumber = values.cardNumber.replace(/\s/g, "");
    const validCardNumber =
      process.env.NEXT_PUBLIC_VALID_CARD_NUMBER || "4580000000000000";
    const validCvv = process.env.NEXT_PUBLIC_VALID_CVV || "123";

    if (cleanCardNumber !== validCardNumber) {
      toast.error("מספר כרטיס לא תקין", {});
      return;
    }

    if (values.cvv !== validCvv) {
      toast.error("CVV לא תקין", {});
      return;
    }

    // Validate expiry date is in future
    const [month, year] = values.expiryDate.split("/");
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const currentDate = new Date();

    if (expiryDate <= currentDate) {
      toast.error("תאריך התפוגה חייב להיות בעתיד", {});
      return;
    }

    // If all validations pass, trigger success
    onPaymentSuccess();
  };

  const generateMonthYearOptions = (): MonthYearOption[] => {
    const options: MonthYearOption[] = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Generate options for the next 10 years
    for (let year = currentYear; year <= currentYear + 10; year++) {
      for (let month = 1; month <= 12; month++) {
        // Skip past months for current year
        if (year === currentYear && month < currentMonth + 1) continue;

        const monthStr = month.toString().padStart(2, "0");
        const yearStr = year.toString().slice(-2);
        const value = `${monthStr}/${yearStr}`;
        const label = `${monthStr}/${year}`;

        options.push({ value, label });
      }
    }
    return options;
  };

  const handleExpiryDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: string) => void
  ) => {
    let value = e.target.value.replace(/\D/g, "");

    // Handle backspace - clear everything including "/"
    if (
      e.nativeEvent instanceof InputEvent &&
      e.nativeEvent.inputType === "deleteContentBackward"
    ) {
      if (value.length === 0) {
        setFieldValue("expiryDate", "");
        return;
      }
    }

    // Format as MM/YY
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }

    setFieldValue("expiryDate", value);
  };

  const handleDatePickerSelect = (
    value: string,
    setFieldValue: (field: string, value: string) => void
  ) => {
    setFieldValue("expiryDate", value);
    setShowDatePicker(false);
  };

  const handleInputFocus = () => {
    setShowDatePicker(true);
  };

  const monthYearOptions = generateMonthYearOptions();

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-lg">
      <div className="relative" dir="rtl">
        <h2 className="text-2xl font-semibold text-right mb-9 text-blue-gray border-b border-gray-500 pb-2.5">
          פרטי תשלום
        </h2>

        <Formik
          initialValues={{
            fullName: "",
            idNumber: "",
            cardNumber: "",
            expiryDate: "",
            cvv: "",
          }}
          validationSchema={paymentValidationSchema}
          onSubmit={handlePaymentSubmit}
        >
          {({
            setFieldValue,

            errors,
            touched,
            isValid,
            dirty,
            values,
          }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-right text-lg font-bold text-blue-gray mb-2">
                  שם מלא לחשבונית
                </label>
                <Field name="fullName">
                  {({ field }: FieldProps) => (
                    <div>
                      <input
                        {...field}
                        type="text"
                        placeholder="שם מלא"
                        className="w-full px-4 py-3 border-[1.5px] border-gray-500 rounded-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                      {errors.fullName && touched.fullName && (
                        <div className="text-red-500 text-sm text-right mt-1">
                          {errors.fullName}
                        </div>
                      )}
                    </div>
                  )}
                </Field>
              </div>

              <div>
                <label className="block text-right text-lg font-bold text-blue-gray mb-2">
                  תעודת זהות
                </label>
                <Field name="idNumber">
                  {({ field }: FieldProps) => (
                    <div>
                      <input
                        {...field}
                        type="text"
                        placeholder="תעודת זהות"
                        maxLength={9}
                        className="w-full px-4 py-3 border-[1.5px] border-gray-500 rounded-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                      {errors.idNumber && touched.idNumber && (
                        <div className="text-red-500 text-sm text-right mt-1">
                          {errors.idNumber}
                        </div>
                      )}
                    </div>
                  )}
                </Field>
              </div>

              <div>
                <label className="block text-right text-lg font-bold text-blue-gray mb-2">
                  מספר כרטיס אשראי
                </label>
                <Field name="cardNumber">
                  {({ field }: FieldProps) => (
                    <div>
                      <input
                        {...field}
                        type="text"
                        placeholder="1234  5678  9101  1121"
                        maxLength={19}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\s/g, "");
                          if (value.length > 16) value = value.slice(0, 16);
                          const formatted =
                            value.match(/.{1,4}/g)?.join(" ") || value;
                          setFieldValue("cardNumber", formatted);
                        }}
                        className="w-full px-4 py-3 border-[1.5px] border-gray-500 rounded-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-500"
                        dir="ltr"
                      />
                      {errors.cardNumber && touched.cardNumber && (
                        <div className="text-red-500 text-sm text-right mt-1">
                          {errors.cardNumber}
                        </div>
                      )}
                    </div>
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-right text-lg font-bold text-blue-gray mb-2">
                    CVV
                  </label>
                  <Field name="cvv">
                    {({ field }: FieldProps) => (
                      <div>
                        <input
                          {...field}
                          type="text"
                          placeholder="123"
                          maxLength={3}
                          className="w-full px-4 py-3 border-[1.5px] border-gray-500 rounded-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                        {errors.cvv && touched.cvv && (
                          <div className="text-red-500 text-sm text-right mt-1">
                            {errors.cvv}
                          </div>
                        )}
                      </div>
                    )}
                  </Field>
                </div>

                <div className="relative">
                  <label className="block text-right text-lg font-bold text-blue-gray mb-2">
                    תוקף כרטיס
                  </label>
                  <div className="relative">
                    <Field name="expiryDate">
                      {({ field }: FieldProps) => (
                        <div className="relative">
                          <div className="relative">
                            <input
                              {...field}
                              ref={inputRef}
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              onChange={(e) =>
                                handleExpiryDateChange(e, setFieldValue)
                              }
                              onFocus={handleInputFocus}
                              className="w-full px-4 py-3 border-[1.5px] border-gray-500 rounded-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-500 "
                              dir="ltr"
                            />
                          </div>

                          {errors.expiryDate && touched.expiryDate && (
                            <div className="absolute -bottom-6 left-0 right-0 text-red-500 text-sm text-center">
                              {errors.expiryDate}
                            </div>
                          )}
                        </div>
                      )}
                    </Field>

                    {/* Date Picker Dropdown - Positioned absolutely outside the normal flow */}
                    {showDatePicker && (
                      <div
                        ref={datePickerRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto top-full"
                      >
                        {monthYearOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={`w-full px-4 py-3 text-center hover:bg-gray-100 transition-colors ${
                              values.expiryDate === option.value
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }`}
                            onClick={() =>
                              handleDatePickerSelect(
                                option.value,
                                setFieldValue
                              )
                            }
                            dir="ltr"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !isValid || !dirty}
                className="w-full bg-dark-blue hover:bg-dark-blue text-white py-7 rounded-sm text-base font-bold mt-6 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    מעבד...
                  </>
                ) : (
                  "אישור תשלום"
                )}
              </Button>

              <p className="text-sm text-gray-500 text-right mt-2 leading-relaxed">
                הנתונים האישיים שלך ישמשו לעיבוד ההזמנה שלך, לשיפור החוויה שלך
                באתר זה, ולמטרות נוספות המתוארות במדיניות הפרטיות שלנו.
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};
