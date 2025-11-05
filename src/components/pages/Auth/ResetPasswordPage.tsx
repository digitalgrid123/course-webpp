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
import { clearAuthErrors, resetPassword } from "@/store/slices/authSlice";
import { User } from "@/types";

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const t = useTranslations("ResetPassword");
  const isRTL = true;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, fieldErrors, successMessage } = useSelector(
    (state: RootState) => state.auth
  );

  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, t("passwordMinLength"))
      .required(t("passwordRequired")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], t("passwordsMustMatch"))
      .required(t("confirmPasswordRequired")),
  });

  const form = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const {
    handleSubmit,
    register,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = form;

  useEffect(() => {
    if (fieldErrors) {
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        setError(field as keyof ResetPasswordFormValues, {
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

      localStorage.removeItem("verificationEmail");
    }
  }, [successMessage, router]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthErrors());
    };
  }, [dispatch]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    dispatch(clearAuthErrors());

    const resultAction = await dispatch(
      resetPassword({
        password: values.password,
        password_confirmation: values.confirmPassword,
      })
    );

    if (resetPassword.fulfilled.match(resultAction)) {
      const userData = resultAction.payload?.data?.user;

      if (userData) {
        handleUserNavigation(userData);
      } else {
        toast.error("לא ניתן לאחזר את נתוני המשתמש. אנא התחבר מחדש.");
        router.push("/login");
      }
    } else {
      toast.error("איפוס הסיסמה נכשל. נסה שוב.");
    }
  };

  const handleUserNavigation = (userData: User) => {
    const userStatus = userData.status;
    const isOnboarded = userData.is_onboarded;

    if (userStatus === 1) {
      if (isOnboarded === 0) {
        router.push("/onboarding");
      } else if (isOnboarded === 1) {
        document.cookie = "isLogged=true; path=/";
        router.push("/dashboard");
      }
    } else if (userStatus === 0) {
      router.push("/verify?source=login");
    } else {
      router.push("/login");
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
                id="password"
                type="password"
                label={t("passwordLabel")}
                placeholder={t("passwordPlaceholder")}
                {...register("password")}
                error={errors.password?.message}
                isRTL={isRTL}
              />

              <FormInputField
                id="confirmPassword"
                type="password"
                label={t("confirmPasswordLabel")}
                placeholder={t("confirmPasswordPlaceholder")}
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
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
            alt="Reset password background"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
