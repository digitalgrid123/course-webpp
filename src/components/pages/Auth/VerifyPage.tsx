"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Form } from "@/components/ui/form";
import SubmitButton from "@/components/common/Button/SubmitButton";
import VerificationCodeInput from "@/components/common/Form/VerificationCodeInput";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import { AppDispatch, RootState } from "@/store";
import {
  clearAuthErrors,
  clearRegisteredUser,
  sendOtp,
  verifyOtp,
} from "@/store/slices/authSlice";

interface VerifyFormValues {
  verification_code: string;
}

export default function VerifyPage() {
  const t = useTranslations("Verify");
  const isRTL = true;
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, fieldErrors, successMessage, registeredUser, user } =
    useSelector((state: RootState) => state.auth);

  const [resendCooldown, setResendCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [source, setSource] = useState("login");

  const validationSchema = Yup.object().shape({
    verification_code: Yup.string()
      .length(4, t("codeLengthError"))
      .required(t("codeRequired")),
  });

  const form = useForm<VerifyFormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: { verification_code: "" },
    mode: "onChange",
  });

  const {
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = form;

  const codeValue = watch("verification_code");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSource(params.get("source") || "login");
  }, []);

  useEffect(() => {
    if (fieldErrors) {
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        if (field === "otp" || field === "verification_code") {
          setError("verification_code", {
            type: "manual",
            message: messages[0],
          });
        }
      });
    }
  }, [fieldErrors, setError]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (successMessage && !loading) toast.success(successMessage);
  }, [successMessage, loading]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthErrors());
    };
  }, [dispatch]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const onSubmit = async (data: VerifyFormValues) => {
    const email = registeredUser?.user?.email || user?.email;
    if (!email) {
      toast.error("Email not found. Please register or log in again.");
      return;
    }

    dispatch(clearAuthErrors());

    const credentials = { email, otp: data.verification_code };
    const resultAction = await dispatch(verifyOtp(credentials));

    if (verifyOtp.fulfilled.match(resultAction)) {
      localStorage.removeItem("loginFormData");
      localStorage.removeItem("signupFormData");
      dispatch(clearRegisteredUser());

      const isOnboarded = resultAction.payload.data.user.is_onboarded;
      if (isOnboarded === 0) {
        router.push("/onboarding");
      } else if (isOnboarded === 1) {
        document.cookie = "isLogged=true; path=/";
        router.push("/dashboard");
      }
    }
  };

  const handleResendCode = async () => {
    const email = registeredUser?.user?.email || user?.email;
    if (!canResend || !email) return;

    dispatch(clearAuthErrors());

    const credentials = { email };
    const resultAction = await dispatch(sendOtp(credentials));

    if (sendOtp.fulfilled.match(resultAction)) {
      setResendCooldown(30);
      setCanResend(false);
    }
  };

  const backLink = source === "signup" ? "/register" : "/login";
  const backLabel =
    source === "signup" ? t("backToRegister") : t("backToLogin");

  return (
    <div
      className={`h-screen flex flex-col lg:flex-row ${
        isRTL ? "lg:flex-row-reverse" : ""
      } bg-soft-gray`}
    >
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16 bg-white flex-1">
        <div className="w-full max-w-md flex flex-col justify-center h-full">
          <div className={`mb-8 ${isRTL ? "text-right" : "text-left"}`}>
            <h1 className="text-4xl font-bold text-charcoal-blue mb-2 tracking-tight-pro leading-snug">
              {t("title")}
            </h1>
            <p className="text-sm text-slate-gray mb-1">{t("subtitle")}</p>
          </div>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <VerificationCodeInput
                value={codeValue}
                onChange={(val) =>
                  setValue("verification_code", val, {
                    shouldValidate: true,
                    shouldTouch: true,
                  })
                }
                error={errors.verification_code?.message}
                isRTL={isRTL}
              />

              <div
                className={`flex items-center justify-between text-sm ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <span>
                  {t("didNotReceive")}{" "}
                  <button
                    type="button"
                    disabled={!canResend}
                    onClick={handleResendCode}
                    className={`font-medium underline transition-colors duration-200 ${
                      canResend
                        ? "text-amber-gold hover:text-amber-gold/80"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {t("resendCode")}
                  </button>
                </span>
                {!canResend && (
                  <span className="text-slate-gray">{resendCooldown}s</span>
                )}
              </div>

              <SubmitButton
                isSubmitting={loading || isSubmitting}
                isValid={isValid && codeValue.length === 4}
                label={t("verify")}
                className="w-full py-3 rounded-lg bg-amber-gold hover:bg-amber-gold/90 transition-all"
              />
            </form>
          </Form>

          <p className={`mt-6 text-sm ${isRTL ? "text-right" : "text-left"}`}>
            <Link
              href={backLink}
              className="text-amber-gold font-medium underline hover:text-amber-gold/80"
            >
              {backLabel}
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 items-center justify-center">
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src="/assets/images/cover/cover-image.webp"
            alt="Verification background"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover w-full h-full"
            priority
          />
        </div>
      </div>
    </div>
  );
}
