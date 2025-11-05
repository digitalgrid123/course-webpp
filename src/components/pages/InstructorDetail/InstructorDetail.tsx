"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Breadcrumb from "@/components/common/Breadcrumb/Breadcrumb";

import { InstructorLoading } from "./components/InstructorLoading/InstructorLoading";
import { ErrorState } from "./components/ErrorState/ErrorState";
import { NoDataState } from "./components/NoDataState/NoDataState";
import { TeacherSidebar } from "./components/TeacherSidebar/TeacherSidebar";
import { MobileTeacherCard } from "./components/MobileTeacherCard/MobileTeacherCard";
import { TeacherHeader } from "./components/TeacherHeader/TeacherHeader";
import { TeacherTabs } from "./components/TeacherTabs/TeacherTabs";
import { TeacherBottomSheet } from "./components/TeacherBottomSheet/TeacherBottomSheet";
import { useHtmlUtils } from "../../../../hooks/useHtmlUtils";
import { useTeacherData } from "../../../../hooks/useTeacherData";

interface InstructorDetailProps {
  id: string;
}

const InstructorDetail: React.FC<InstructorDetailProps> = ({ id }) => {
  const [activeTab, setActiveTab] = useState("courses");
  const router = useRouter();
  const { stripHtml } = useHtmlUtils();

  const {
    teacher,
    loading,
    error,
    isBottomSheetOpen,
    openBottomSheet,
    closeBottomSheet,
    handleBackdropClick,
  } = useTeacherData(id);

  // Show toast notification when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 5000,
        position: "top-right",
      });
    }
  }, [error]);

  const handleBackNavigation = () => {
    router.back();
  };

  if (loading) {
    return <InstructorLoading />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!teacher) {
    return <NoDataState />;
  }

  const strippedBio = teacher.bio ? stripHtml(teacher.bio) : "";

  return (
    <div
      className="min-h-screen bg-white px-4 sm:px-6 md:px-8 lg:px-12 pt-6 pb-32 sm:pb-0 sm:py-8 md:py-10"
      dir="rtl"
    >
      <Breadcrumb
        items={[{ label: "ראשי" }, { label: "מרצים" }, { label: teacher.name }]}
        onBack={handleBackNavigation}
      />

      <div className="sm:py-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <MobileTeacherCard teacher={teacher} onMoreInfo={openBottomSheet} />

            <TeacherHeader teacher={teacher} strippedBio={strippedBio} />

            <TeacherTabs
              activeTab={activeTab}
              teacher={teacher}
              onTabChange={setActiveTab}
            />
          </div>
          <TeacherSidebar teacher={teacher} />
        </div>
      </div>

      <TeacherBottomSheet
        isOpen={isBottomSheetOpen}
        teacher={teacher}
        onClose={closeBottomSheet}
        onBackdropClick={handleBackdropClick}
      />
    </div>
  );
};

export default InstructorDetail;
