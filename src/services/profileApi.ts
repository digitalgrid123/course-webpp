import { apiConnection } from "@/services/apiConnection";
import { UpdateProfileRequest, UpdateProfileResponse } from "@/types";

export const updateProfileApi = (data: UpdateProfileRequest) => {
  return apiConnection.auth
    .post("/update-profile", data)
    .then((response) => response as unknown as UpdateProfileResponse);
};
