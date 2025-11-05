// hooks/useTeacherData.ts
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchTeacherDetail,
  clearTeacherDetail,
} from "@/store/slices/teacherSlice";

export const useTeacherData = (id: string) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const { teacher, loading, error } = useSelector(
    (state: RootState) => state.teacher.detail
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchTeacherDetail(parseInt(id)));
    }

    return () => {
      dispatch(clearTeacherDetail());
    };
  }, [id, dispatch]);

  const openBottomSheet = () => setIsBottomSheetOpen(true);
  const closeBottomSheet = () => setIsBottomSheetOpen(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeBottomSheet();
    }
  };

  return {
    teacher,
    loading,
    error,
    isBottomSheetOpen,
    openBottomSheet,
    closeBottomSheet,
    handleBackdropClick,
  };
};
