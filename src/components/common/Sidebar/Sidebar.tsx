"use client";

import React, { useState } from "react";
import { Settings, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import { SearchIcon, CartIcon, LearningIcon } from "@/lib/CustomIcons";
import { useTranslations } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/store/slices/authSlice";
import { Modal } from "../Modal/Modal";
import { RootState } from "@/store";

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem = "dashboard",
  onItemClick,
}) => {
  const t = useTranslations("Sidebar");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  // Access the cart's totalItems from the Redux store
  const cartItemsCount = useSelector(
    (state: RootState) => state.cart.totalItems
  );

  const menuItems = [
    { id: "dashboard", label: t("courses"), icon: SearchIcon },
    { id: "myCourses", label: t("myCourses"), icon: LearningIcon },
    { id: "cart", label: t("cart"), icon: CartIcon },
  ];

  const handleItemClick = (itemId: string) => {
    if (onItemClick) onItemClick(itemId);
    setIsMobileOpen(false);
  };

  const handleSettingsClick = () => {
    if (onItemClick) onItemClick("settings"); // Trigger navigation via ClientLayout
    setIsMobileOpen(false);
  };

  const confirmLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-center py-8">
        <Image
          src={"/assets/images/icons/universitylogo.png"}
          width={74}
          height={100}
          alt="university-logo"
          loading="lazy"
        />
      </div>
      <nav className="flex-1 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 mb-4 rounded-xl transition-colors ${
                isActive
                  ? "bg-indigo-100 text-black font-semibold"
                  : "text-white font-medium"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" isActive={isActive} />
                {item.id === "cart" && cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="text-base">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-4 pb-6 space-y-2.5">
        <button
          onClick={handleSettingsClick}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activeItem === "settings"
              ? "bg-indigo-100 text-black font-semibold"
              : "text-white font-medium"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-base font-medium">{t("settings")}</span>
        </button>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 rounded-lg transition-colors"
          onClick={() => setIsLogoutModalOpen(true)}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-base font-medium">{t("logout")}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-orange-500 text-white p-2 rounded-lg"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-40 w-64 bg-linear-(--gradient-amber) shadow-(--shadow-orange-soft) flex flex-col transform transition-transform duration-300 ease-in-out rounded-tl-20 rounded-bl-20 ${
          isMobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <SidebarContent />
      </aside>
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      >
        <h2 className="text-lg font-semibold mb-4">{t("confirmLogout")}</h2>
        <p className="mb-6">{t("areYouSureLogout")}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsLogoutModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-gray-200"
          >
            {t("cancel")}
          </button>
          <button
            onClick={confirmLogout}
            className="px-4 py-2 rounded-lg bg-amber-gold text-white"
          >
            {t("logout")}
          </button>
        </div>
      </Modal>
    </>
  );
};
