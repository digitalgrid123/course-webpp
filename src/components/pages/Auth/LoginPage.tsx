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
import { loginUser, clearAuthErrors } from "@/store/slices/authSlice";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const t = useTranslations("Login");
  const isRTL = true;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, fieldErrors, successMessage } = useSelector(
    (state: RootState) => state.auth
  );

  const validationSchema = Yup.object().shape({
    email: Yup.string().email(t("emailInvalid")).required(t("emailRequired")),
    password: Yup.string()
      .min(8, t("passwordMinLength"))
      .required(t("passwordRequired")),
  });

  const form = useForm<LoginFormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: { email: "", password: "" },
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
    const savedData = localStorage.getItem("loginFormData");
    if (savedData) {
      const parsedData: LoginFormValues = JSON.parse(savedData);
      reset(parsedData);
    }
  }, [reset]);

  useEffect(() => {
    if (fieldErrors) {
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        setError(field as keyof LoginFormValues, {
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
      localStorage.removeItem("loginFormData");
    }
  }, [successMessage]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthErrors());
    };
  }, [dispatch]);

  const onSubmit = async (values: LoginFormValues) => {
    dispatch(clearAuthErrors());
    localStorage.setItem("loginFormData", JSON.stringify(values));
    const resultAction = await dispatch(loginUser(values));

    if (loginUser.fulfilled.match(resultAction)) {
      const userData = resultAction.payload.data.user;
      const userStatus = userData.status;
      const isOnboarded = userData.is_onboarded;

      if (userStatus === 0) {
        router.push("/verify?source=login");
      } else if (userStatus === 1) {
        if (isOnboarded === 0) {
          router.push("/onboarding");
        } else if (isOnboarded === 1) {
          document.cookie = "isLogged=true; path=/";
          router.push("/dashboard");
        }
      }
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
              <span>{t("noAccountPrefix")}</span>{" "}
              <Link
                href="/register"
                className="text-amber-gold font-semibold underline"
              >
                {t("noAccountAction")}
              </Link>
            </p>
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

              <FormInputField
                id="password"
                type="password"
                label={t("passwordLabel")}
                placeholder={t("passwordPlaceholder")}
                {...register("password")}
                error={errors.password?.message}
                isRTL={isRTL}
              />

              <div className="flex items-end text-sm">
                <Link
                  href="/forgot-password"
                  className="text-slate-gray font-medium hover:text-amber-gold underline underline-offset-4 decoration-slate-gray transition"
                >
                  {t("forgotPassword")}
                </Link>
              </div>

              <SubmitButton
                isSubmitting={loading || isSubmitting}
                isValid={isValid}
                label={t("signIn")}
              />
              <p className="text-sm text-gray-500 text-right leading-4 font-medium">
                בהתחברות למערכת הינך מאשר את{" "}
                <Link href="/terms" className="text-amber-gold underline">
                  התקנון
                </Link>{" "}
                וגם את{" "}
                <Link
                  href="/privacy-policy"
                  className="text-amber-gold underline"
                >
                  מדיניות הפרטיות
                </Link>
                .
              </p>
            </form>
          </Form>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 items-center justify-center">
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src="/assets/images/cover/cover-image.webp"
            alt="Login background"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
