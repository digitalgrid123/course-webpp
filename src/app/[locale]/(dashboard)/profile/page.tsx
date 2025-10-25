"use client";

import ClientLayout from "@/components/layouts/ClientLayout";
import React from "react";

export default function ProfilePage() {
  return (
    <ClientLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-right">
          מרכיבים שלנו
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4 text-right">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם מלא
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                אימייל
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                טלפון
              </label>
              <input
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              שמור שינויים
            </button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
