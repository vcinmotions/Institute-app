"use client";
import React, { useState, useEffect } from 'react';
import ModalCard from '@/components/common/ModalCard';
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface EnquiryDatatableProps {
  onClose: () => void;
  enquiryId: string | null;
}

export default function EnquiryDetails({ onClose, enquiryId, }: EnquiryDatatableProps) {  

    const { enquiries, loading } = useSelector((state: RootState) => state.enquiry);
    console.log("get Enquiry data in tmeline", enquiries); 

    const fineEnquiryById = enquiries.find((data) => data.id === enquiryId);

    console.log("get Enquiry data in tmeline bt Id", fineEnquiryById); 

  return (
    <ModalCard title="Follow-Up " oncloseModal={onClose}>
      <div>
      {/* <PageBreadcrumb pageTitle="Blank Page" /> */}
      <div className="h-max rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-center">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Musharof
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Chowdhury
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                randomuser@pimjo.com
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                +09 363 398 46
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Bio
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Team Manager
              </p>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
    </ModalCard>
  );
}
