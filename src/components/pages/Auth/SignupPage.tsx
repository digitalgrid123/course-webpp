"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Form } from "@/components/ui/form";
import SubmitButton from "@/components/common/Button/SubmitButton";
import FormInputField from "@/components/common/Form/FormInput";
import ProfileImageUpload from "@/components/common/Form/ProfileImageUpload";
import { AppDispatch, RootState } from "@/store";
import { clearAuthErrors, registerUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

interface SignupFormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  profile_image?: string;
}

export default function SignupPage() {
  const t = useTranslations("Signup");
  const isRTL = true;
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, fieldErrors } = useSelector(
    (state: RootState) => state.auth
  );

  const validationSchema = Yup.object().shape({
    first_name: Yup.string().required(t("firstNameRequired")),
    last_name: Yup.string().required(t("lastNameRequired")),
    email: Yup.string().email(t("emailInvalid")).required(t("emailRequired")),
    password: Yup.string()
      .min(8, t("passwordMinLength"))
      .required(t("passwordRequired")),
    password_confirmation: Yup.string()
      .oneOf([Yup.ref("password"), undefined], t("passwordsMustMatch"))
      .required(t("confirmPasswordRequired")),
  });

  const form = useForm<SignupFormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      password_confirmation: "",
      profile_image: "",
    },
    mode: "onTouched",
  });

  const {
    handleSubmit,
    register,
    setValue,
    setError,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = form;

  useEffect(() => {
    const savedData = localStorage.getItem("signupFormData");
    if (savedData) {
      const parsedData: SignupFormValues = JSON.parse(savedData);
      reset(parsedData);
    }
  }, [reset]);

  useEffect(() => {
    if (fieldErrors) {
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        setError(field as keyof SignupFormValues, {
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
    return () => {
      dispatch(clearAuthErrors());
    };
  }, [dispatch]);

  const onSubmit = async (values: SignupFormValues) => {
    dispatch(clearAuthErrors());

    localStorage.setItem("signupFormData", JSON.stringify(values));
    const resultAction = await dispatch(registerUser(values));

    if (registerUser.fulfilled.match(resultAction)) {
      router.push("/verify?source=signup");
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
              <span>{t("alreadyHaveAccountPrefix")}</span>{" "}
              <Link
                href="/login"
                className="text-amber-gold font-medium underline"
              >
                {t("alreadyHaveAccountAction")}
              </Link>
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <ProfileImageUpload
                initialImage={form.getValues("profile_image")}
                onUploadComplete={(url) => setValue("profile_image", url)}
              />

              <FormInputField
                id="first_name"
                type="text"
                label={t("firstNameLabel")}
                placeholder={t("firstNamePlaceholder")}
                {...register("first_name")}
                error={errors.first_name?.message}
                isRTL={isRTL}
              />

              <FormInputField
                id="last_name"
                type="text"
                label={t("lastNameLabel")}
                placeholder={t("lastNamePlaceholder")}
                {...register("last_name")}
                error={errors.last_name?.message}
                isRTL={isRTL}
              />

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

              <FormInputField
                id="password_confirmation"
                type="password"
                label={t("confirmPasswordLabel")}
                placeholder={t("confirmPasswordPlaceholder")}
                {...register("password_confirmation")}
                error={errors.password_confirmation?.message}
                isRTL={isRTL}
              />

              <SubmitButton
                isSubmitting={loading || isSubmitting}
                isValid={isValid}
                label={t("signUp")}
              />
            </form>
          </Form>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 items-center justify-center">
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src="/assets/images/cover/cover-image.webp"
            alt="Signup background"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
