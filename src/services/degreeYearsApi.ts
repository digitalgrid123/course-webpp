import { apiConnection } from "@/services/apiConnection";
import { DegreeYearsResponse } from "@/types";
import { CustomAxiosResponse } from "@/types";

export const fetchDegreeYearsApi = () => {
  return apiConnection.auth
    .post("/degree-years-data", {})
    .then((response) => response as unknown as DegreeYearsResponse);
};

export interface OnboardingPayload {
  degree_id: number[];
  year_id: number[];
}

export interface OnboardingResponse extends CustomAxiosResponse<null> {
  status: boolean;
  message: string;
  data: null;
  errors?: Record<string, string[]>;
}

export const submitOnboardingApi = (payload: OnboardingPayload) => {
  return apiConnection.auth
    .post("/onboarding", payload)
    .then((response) => response as unknown as OnboardingResponse);
};
