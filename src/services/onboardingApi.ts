import { apiConnection } from "@/services/apiConnection";
import { CustomAxiosResponse } from "@/types";

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
