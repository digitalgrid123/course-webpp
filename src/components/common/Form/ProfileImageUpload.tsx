"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { AlertCircle } from "lucide-react";
import { uploadImageApi } from "@/services/uploadApi";

interface ProfileImageUploadProps {
  onUploadComplete: (url: string) => void;
  initialImage?: string;
}

export default function ProfileImageUpload({
  onUploadComplete,
  initialImage,
}: ProfileImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [openCropper, setOpenCropper] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  useEffect(() => {
    if (initialImage) {
      setPreview(initialImage);
    }
  }, [initialImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      setError("אנא בחר קובץ תמונה תקין");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("גודל התמונה חייב להיות קטן מ-5MB");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setOpenCropper(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.onerror = () => setError("נכשל בקריאת הקובץ. נסה שוב.");
    reader.readAsDataURL(file);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

  const getCroppedImage = async (): Promise<File | null> => {
    if (!imageSrc || !croppedAreaPixels) return null;
    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("נכשל ביצירת הקנבס");

      const { width, height, x, y } = croppedAreaPixels;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

      return new Promise<File | null>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(
                new File([blob], "profile-image.jpg", { type: "image/jpeg" })
              );
            } else {
              reject(new Error("נכשל ביצירת תמונה"));
            }
          },
          "image/jpeg",
          0.95
        );
      });
    } catch {
      setError("נכשל בעיבוד התמונה");
      return null;
    }
  };

  const uploadCroppedImage = async () => {
    setProcessing(true);
    setError(null);

    const file = await getCroppedImage();
    setProcessing(false);

    if (!file) {
      setError("נכשל בעיבוד התמונה. נסה שוב.");
      return;
    }

    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setOpenCropper(false);
    setUploading(true);

    try {
      const response = await uploadImageApi(file);

      if (response.status && response.data?.image_path) {
        const baseUrl = process.env.NEXT_PUBLIC_MEDIA_URL ?? "";
        const imageUrl = `${baseUrl}/${response.data.image_path}`;
        onUploadComplete(imageUrl);
        setError(null);
      } else {
        setError(response.message || "תגובה לא תקינה מהשרת");
      }
    } catch {
      setError("העלאה נכשלה. נסה שוב.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleCropperClose = () => {
    setOpenCropper(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-50 flex items-center justify-center">
        {preview ? (
          <Image
            src={preview}
            alt="תמונת פרופיל"
            fill
            className="object-cover"
            unoptimized={preview.startsWith("blob:")}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:text-gray-600 transition"
            onClick={() => inputRef.current?.click()}
          >
            <svg
              className="w-12 h-12 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs">אין תמונה</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <Button
          type="button"
          disabled={uploading || processing}
          variant="secondary"
          className="cursor-pointer rounded-full px-6 py-2 flex items-center gap-2"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </>
          ) : (
            "העלה תמונה"
          )}
        </Button>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <Dialog open={openCropper} onOpenChange={handleCropperClose}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-xl shadow-lg bg-white">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              חתוך את התמונה שלך
            </DialogTitle>
          </DialogHeader>

          <div className="relative w-full h-[400px] bg-gray-900 flex items-center justify-center">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <div className="px-6 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700 font-medium">זום</label>
              <span className="text-sm text-gray-500">{zoom.toFixed(1)}x</span>
            </div>
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={(val) => setZoom(val[0])}
              className="w-full"
            />
          </div>

          <DialogFooter className="px-6 py-4 border-t flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="px-4 py-2 rounded-full"
              onClick={handleCropperClose}
              disabled={uploading || processing}
            >
              ביטול
            </Button>
            <Button
              type="button"
              className="px-4 py-2 rounded-full"
              onClick={uploadCroppedImage}
              disabled={uploading || processing}
            >
              {processing ? "מעבד..." : uploading ? "מעלה..." : "שמור והעלה"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
