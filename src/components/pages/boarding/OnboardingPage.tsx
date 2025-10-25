"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ProgressIndicators } from "./components/ProgressIndicators";
import { DegreeSelection } from "./components/DegreeSelection";
import { YearSelection } from "./components/YearSelection";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/store";
import {
  fetchDegreeYears,
  clearDegreeYearsErrors,
} from "@/store/slices/degreeYearsSlice";
import {
  submitOnboarding,
  clearOnboardingErrors,
} from "@/store/slices/onboardingSlice";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const t = useTranslations("Onboarding");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    degrees,
    loading: degreeLoading,
    error: degreeError,
    successMessage: degreeSuccess,
  } = useSelector((state: RootState) => state.degreeYears);

  const {
    loading: onboardingLoading,
    error: onboardingError,
    successMessage: onboardingSuccess,
  } = useSelector((state: RootState) => state.onboarding);

  const [step, setStep] = useState(1);
  const [selectedDegreeId, setSelectedDegreeId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");

  useEffect(() => {
    dispatch(fetchDegreeYears());
    return () => {
      dispatch(clearDegreeYearsErrors());
      dispatch(clearOnboardingErrors());
    };
  }, [dispatch]);

  useEffect(() => {
    if (degreeError) toast.error(degreeError);
    if (degreeSuccess) toast.success(degreeSuccess);
  }, [degreeError, degreeSuccess]);

  useEffect(() => {
    if (onboardingError) toast.error(onboardingError);
    if (onboardingSuccess) {
      toast.success(onboardingSuccess);
      document.cookie = "isLogged=true; path=/";
      router.push("/dashboard");
    }
  }, [onboardingError, onboardingSuccess, router]);

  const toggleDegree = (id: string) => {
    setSelectedDegreeId((prev) => (prev === id ? "" : id));
  };

  const handleNextStep = async () => {
    if (step === 1) {
      setStep(2);
    } else {
      const payload = {
        degree_id: [parseInt(selectedDegreeId)],
        year_id: [parseInt(selectedYearId)],
      };

      dispatch(submitOnboarding(payload));
    }
  };

  const isLastStep = step === 2;
  const buttonText = isLastStep ? t("finish_continue") : t("continue");
  const isButtonDisabled = step === 1 ? !selectedDegreeId : !selectedYearId;
  const stepTitle = step === 1 ? t("select_degree") : t("select_year");

  if (degreeLoading && !degrees) {
    return (
      <div
        className="min-h-screen bg-snow-white flex justify-center items-center p-8"
        dir="rtl"
      >
        <div className="w-full max-w-5xl flex flex-col gap-8">
          <div className="flex justify-center gap-4">
            <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-8 w-64 bg-gray-200 mx-auto rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 p-6 border-2 border-gray-100 rounded-xl animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!degrees) {
    return (
      <div
        className="min-h-screen bg-snow-white flex justify-center items-center p-8"
        dir="rtl"
      >
        <div>No degrees available</div>
      </div>
    );
  }

  const selectedDegree = degrees.find(
    (degree) => degree.id.toString() === selectedDegreeId
  );
  const years = selectedDegree ? selectedDegree.years : [];

  return (
    <div
      className="min-h-screen bg-snow-white flex justify-center p-8"
      dir="rtl"
    >
      <div className="w-full max-w-5xl flex flex-col justify-between">
        <div className="flex flex-col gap-11">
          <ProgressIndicators
            currentStep={step}
            onStepClick={(clickedStep) => {
              if (clickedStep === 2 && !selectedDegreeId) return;
              setStep(clickedStep);
            }}
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800">
            {stepTitle}
          </h1>
        </div>

        {step === 1 && (
          <DegreeSelection
            degrees={degrees}
            selectedDegreeId={selectedDegreeId}
            onToggle={toggleDegree}
            t={t}
          />
        )}
        {step === 2 && (
          <YearSelection
            years={years ?? []}
            selectedYearId={selectedYearId}
            onSelect={setSelectedYearId}
            t={t}
          />
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={handleNextStep}
            disabled={isButtonDisabled || onboardingLoading}
            className="bg-gradient-to-r from-amber-gold to-amber 
              disabled:from-gray-300 disabled:to-gray-300 
              disabled:cursor-not-allowed 
              text-white font-semibold px-12 py-4 rounded-full 
              transition-all duration-200 
              shadow-glow-amber
              disabled:shadow-disabled
              flex items-center gap-2"
          >
            {onboardingLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{t("loading")}</span>
              </>
            ) : (
              buttonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
