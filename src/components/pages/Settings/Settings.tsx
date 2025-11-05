"use client";
import React, { useEffect } from "react";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { updateProfile, clearProfileErrors } from "@/store/slices/profileSlice";
import { Form } from "@/components/ui/form";
import ProfileImageUpload from "@/components/common/Form/ProfileImageUpload";
import FormInputField from "@/components/common/Form/FormInput";
import SubmitButton from "@/components/common/Button/SubmitButton";
import toast from "react-hot-toast";

const profileSchema = yup.object({
  profile_image: yup.string().nullable().optional(),
  first_name: yup
    .string()
    .required("שם פרטי נדרש")
    .min(2, "השם הפרטי חייב להכיל לפחות 2 תווים"),
  last_name: yup
    .string()
    .required("שם משפחה נדרש")
    .min(2, "שם המשפחה חייב להכיל לפחות 2 תווים"),
  email: yup.string().required("אימייל נדרש").email("כתובת אימייל לא תקינה"),
});

const passwordSchema = yup.object({
  old_password: yup
    .string()
    .nullable()
    .required("יש להזין סיסמה נוכחית")
    .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
  password: yup
    .string()
    .nullable()
    .test(
      "min-length",
      "הסיסמה חייבת להכיל לפחות 6 תווים",
      (value) => !value || value.length >= 8
    ),
  password_confirmation: yup
    .string()
    .nullable()
    .test("passwords-match", "הסיסמאות אינן תואמות", function (value) {
      const { password } = this.parent;
      if (!password && !value) return true;
      return password === value;
    }),
});

type ProfileFormData = yup.InferType<typeof profileSchema>;
type PasswordFormData = yup.InferType<typeof passwordSchema>;

interface SettingsProps {
  isRTL?: boolean;
}

const Settings = ({ isRTL = true }: SettingsProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, successMessage, fieldErrors } = useSelector(
    (state: RootState) => state.profile
  );

  const profileForm = useForm<ProfileFormData>({
    resolver: yupResolver(
      profileSchema
    ) as unknown as Resolver<ProfileFormData>,
    mode: "onChange",
    defaultValues: {
      profile_image: undefined,
      first_name: "",
      last_name: "",
      email: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: yupResolver(
      passwordSchema
    ) as unknown as Resolver<PasswordFormData>,
    mode: "onChange",
    defaultValues: {
      old_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      profileForm.setValue("profile_image", userData.profile_image || "");
      profileForm.setValue("first_name", userData.first_name || "");
      profileForm.setValue("last_name", userData.last_name || "");
      profileForm.setValue("email", userData.email || "");
    }
  }, [profileForm]);

  useEffect(() => {
    return () => {
      dispatch(clearProfileErrors());
    };
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearProfileErrors());
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(`שגיאה: ${error}`);
    }
  }, [error]);

  const onProfileSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    try {
      const updateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        profile_image: data.profile_image || "",
      };
      await dispatch(updateProfile(updateData)).unwrap();
      toast.success("הפרופיל עודכן בהצלחה");
    } catch {
      toast.error("עדכון הפרופיל נכשל");
    }
  };

  const onPasswordSubmit: SubmitHandler<PasswordFormData> = async (data) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        toast.error("לא נמצאו נתוני משתמש");
        return;
      }

      const userData: {
        first_name: string;
        last_name: string;
        profile_image?: string;
      } = JSON.parse(storedUser);

      const updateData: {
        first_name: string;
        last_name: string;
        profile_image?: string;
        old_password?: string;
        password?: string;
        password_confirmation?: string;
      } = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        profile_image: userData.profile_image || "",
      };

      if (data.old_password && data.password && data.password_confirmation) {
        updateData.old_password = data.old_password;
        updateData.password = data.password;
        updateData.password_confirmation = data.password_confirmation;
      }

      await dispatch(updateProfile(updateData)).unwrap();
      passwordForm.reset();
      toast.success("הסיסמה עודכנה בהצלחה");
    } catch {
      toast.error("עדכון הסיסמה נכשל");
    }
  };

  const isPasswordFormFilled =
    passwordForm.watch("old_password") &&
    passwordForm.watch("password") &&
    passwordForm.watch("password_confirmation");

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-50">
          <div className="w-10 h-10 border-4 border-amber-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <h1 className="text-3xl font-semibold text-charcoal-blue mb-8">
        {isRTL ? "הגדרות" : "Settings"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          <div className="bg-white rounded-20 p-5 sm:p-6 lg:p-7 shadow-soft-dark">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-charcoal-blue mb-0.5 text-right">
              {isRTL ? "עדכון פרטים" : "Update details"}
            </h2>

            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-3.5 sm:space-y-4"
              >
                <ProfileImageUpload
                  initialImage={
                    profileForm.getValues("profile_image") ?? undefined
                  }
                  onUploadComplete={(url) =>
                    profileForm.setValue("profile_image", url, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                />

                <FormInputField
                  id="first_name"
                  type="text"
                  label="שם פרטי"
                  placeholder="הזן שם פרטי"
                  {...profileForm.register("first_name")}
                  error={
                    profileForm.formState.errors.first_name?.message ||
                    fieldErrors?.first_name?.[0]
                  }
                  isRTL={true}
                />

                <FormInputField
                  id="last_name"
                  type="text"
                  label="שם משפחה"
                  placeholder="הזן שם משפחה"
                  {...profileForm.register("last_name")}
                  error={
                    profileForm.formState.errors.last_name?.message ||
                    fieldErrors?.last_name?.[0]
                  }
                  isRTL={true}
                />

                <FormInputField
                  id="email"
                  type="email"
                  label="אימייל"
                  placeholder="הזן כתובת אימייל"
                  {...profileForm.register("email")}
                  error={profileForm.formState.errors.email?.message}
                  isRTL={true}
                  disabled
                />

                <SubmitButton
                  isSubmitting={false}
                  isValid={profileForm.formState.isValid}
                  label={isRTL ? "עדכון" : "Update"}
                />
              </form>
            </Form>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          <div className="bg-white rounded-20 p-5 sm:p-6 lg:p-7 shadow-soft-dark">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-charcoal-blue text-right mb-5 sm:mb-6">
              {isRTL ? "הגדרות סיסמא" : "Password Settings"}
            </h2>

            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-3.5 sm:space-y-4"
              >
                <FormInputField
                  id="old_password"
                  type="password"
                  label="סיסמא נוכחית"
                  placeholder="הזן סיסמה נוכחית"
                  {...passwordForm.register("old_password")}
                  error={
                    passwordForm.formState.errors.old_password?.message ||
                    fieldErrors?.old_password?.[0]
                  }
                  isRTL={true}
                />

                <FormInputField
                  id="password"
                  type="password"
                  label="סיסמא חדשה"
                  placeholder="הזן סיסמה חדשה"
                  {...passwordForm.register("password")}
                  error={
                    passwordForm.formState.errors.password?.message ||
                    fieldErrors?.password?.[0]
                  }
                  isRTL={true}
                />

                <FormInputField
                  id="password_confirmation"
                  type="password"
                  label="אימות סיסמא חדשה"
                  placeholder="אשר סיסמה חדשה"
                  {...passwordForm.register("password_confirmation")}
                  error={
                    passwordForm.formState.errors.password_confirmation
                      ?.message || fieldErrors?.password_confirmation?.[0]
                  }
                  isRTL={true}
                />

                <SubmitButton
                  isSubmitting={false}
                  isValid={
                    !!isPasswordFormFilled && passwordForm.formState.isValid
                  }
                  label={isRTL ? "עדכון" : "Update"}
                />
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
