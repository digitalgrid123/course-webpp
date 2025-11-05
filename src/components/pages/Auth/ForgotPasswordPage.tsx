"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { Form } from "@/components/ui/form";
import SubmitButton from "@/components/common/Button/SubmitButton";
import FormInputField from "@/components/common/Form/FormInput";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/store";
import { useRouter } from "next/navigation";
import { clearAuthErrors, sendOtp } from "@/store/slices/authSlice";

interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");
  const isRTL = true;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, fieldErrors, successMessage } = useSelector(
    (state: RootState) => state.auth
  );

  const validationSchema = Yup.object().shape({
    email: Yup.string().email(t("emailInvalid")).required(t("emailRequired")),
  });

  const form = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  const {
    handleSubmit,
    register,
    setError,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = form;

  useEffect(() => {
    const savedData = localStorage.getItem("forgotPasswordFormData");
    if (savedData) {
      const parsedData: ForgotPasswordFormValues = JSON.parse(savedData);
      reset(parsedData);
    }
  }, [reset]);

  useEffect(() => {
    if (fieldErrors) {
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        setError(field as keyof ForgotPasswordFormValues, {
          type: "manual",
          message: messages[0],
        });
      });
    }
  }, [fieldErrors, setError]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      localStorage.removeItem("forgotPasswordFormData");
      // Navigate to verify page after successful OTP send
      router.push("/verify?source=forgot-password");
    }
  }, [successMessage, router]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthErrors());
    };
  }, [dispatch]);

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    dispatch(clearAuthErrors());
    localStorage.setItem("forgotPasswordFormData", JSON.stringify(values));

    // Use sendOtp action instead of forgotPassword
    const resultAction = await dispatch(
      sendOtp({
        email: values.email,
      })
    );

    if (sendOtp.fulfilled.match(resultAction)) {
      // Store email for verification page
      localStorage.setItem("verificationEmail", values.email);
    }
  };

  return (
    <div className={`min-h-screen flex ${isRTL ? "flex-row-reverse" : ""}`}>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className={`mb-8 ${isRTL ? "text-right" : "text-left"}`}>
            <h1 className="text-4xl font-semibold text-charcoal-blue mb-1 tracking-tight-pro leading-11">
              {t("title")}
            </h1>
            <p
              className={`text-sm mb-1 leading-4 font-normal ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <span>{t("rememberPasswordPrefix")}</span>{" "}
              <Link
                href="/login"
                className="text-amber-gold font-semibold underline"
              >
                {t("rememberPasswordAction")}
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-4">{t("instructions")}</p>
          </div>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormInputField
                id="email"
                type="email"
                label={t("emailLabel")}
                placeholder={t("emailPlaceholder")}
                {...register("email")}
                error={errors.email?.message}
                isRTL={isRTL}
              />

              <SubmitButton
                isSubmitting={loading || isSubmitting}
                isValid={isValid}
                label={t("resetPassword")}
              />
            </form>
          </Form>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 items-center justify-center">
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src="/assets/images/cover/cover-image.webp"
            alt="Forgot password background"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
