import { apiConnection } from "@/services/apiConnection";

export interface UploadImageResponse {
  status: boolean;
  message: string;
  data?: {
    image_path?: string;
  };
  errors?: string[] | null;
}

// Return the whole Axios response as UploadImageResponse
export const uploadImageApi = async (
  file: File
): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiConnection.auth.post<UploadImageResponse>(
    "/image-upload",
    formData
  );

  // Cast the AxiosResponse to UploadImageResponse
  return response as unknown as UploadImageResponse;
};
