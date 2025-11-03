"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import ProfileImageUpload from "@/components/common/Form/ProfileImageUpload";
import FormInputField from "@/components/common/Form/FormInput";
import SubmitButton from "@/components/common/Button/SubmitButton";

const profileSchema = z.object({
  profile_image: z.string().optional(),
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z
  .object({
    current_password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    new_password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface SettingsProps {
  isRTL?: boolean;
  t?: (key: string) => string;
}

const Settings = ({ isRTL = true }: SettingsProps) => {
  const [loading, setLoading] = React.useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      profile_image: "",
      username: "",
      email: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      profileForm.setValue("profile_image", userData.profile_image || "");
      profileForm.setValue(
        "username",
        `${userData.first_name || ""} ${userData.last_name || ""}`
      );
      profileForm.setValue("email", userData.email || "");
    }
  }, [profileForm]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      console.log("Profile data:", data);
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setLoading(true);
    try {
      console.log("Password data:", data);
    } catch (error) {
      console.error("Password update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
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
                    initialImage={profileForm.getValues("profile_image")}
                    onUploadComplete={(url) =>
                      profileForm.setValue("profile_image", url)
                    }
                  />

                  <FormInputField
                    id="username"
                    type="text"
                    label={isRTL ? "שם משתמש" : "Username"}
                    placeholder=""
                    {...profileForm.register("username")}
                    error={profileForm.formState.errors.username?.message}
                    isRTL={isRTL}
                  />

                  <FormInputField
                    id="email"
                    type="email"
                    label={isRTL ? "אימייל" : "Email"}
                    placeholder=""
                    {...profileForm.register("email")}
                    error={profileForm.formState.errors.email?.message}
                    isRTL={isRTL}
                  />

                  <SubmitButton
                    isSubmitting={loading || profileForm.formState.isSubmitting}
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
                    id="current_password"
                    type="password"
                    label=""
                    placeholder="סיסמא נוכחית"
                    {...passwordForm.register("current_password")}
                    error={
                      passwordForm.formState.errors.current_password?.message
                    }
                    isRTL={isRTL}
                  />

                  <FormInputField
                    id="new_password"
                    type="password"
                    label={isRTL ? "סיסמא חדשה" : "New password"}
                    placeholder={
                      isRTL ? "הזן סיסמא חדשה" : "Input your new password"
                    }
                    {...passwordForm.register("new_password")}
                    error={passwordForm.formState.errors.new_password?.message}
                    isRTL={isRTL}
                  />

                  <FormInputField
                    id="confirm_password"
                    type="password"
                    label={isRTL ? "אימות סיסמא חדש" : "Confirm new password"}
                    placeholder={
                      isRTL
                        ? "הזן שוב את הסיסמא החדשה"
                        : "Input again your new password"
                    }
                    {...passwordForm.register("confirm_password")}
                    error={
                      passwordForm.formState.errors.confirm_password?.message
                    }
                    isRTL={isRTL}
                  />

                  <SubmitButton
                    isSubmitting={
                      loading || passwordForm.formState.isSubmitting
                    }
                    isValid={passwordForm.formState.isValid}
                    label={isRTL ? "עדכון" : "Update"}
                  />
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
