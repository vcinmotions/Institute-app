import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from "react";
import { useDispatch } from "react-redux";
import ShowEncryptedPassword from "../form/form-elements/ShowPasswordModal";

type FacultyDataTableProps = {
  company: any[];
  loading: boolean;
};

export default function CompanyDataTable({
  company,
}: FacultyDataTableProps) {

  const dispatch = useDispatch();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
 
  const handleShowPassword = (item: string) => {
    setSelectedId(item);
    setPassword(item);
  };

  const handleCloseShowPassword = () => {
    setSelectedId(null);
    setPassword(null);
  };

  console.log("get All Query To search in faculty Table:", company);
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="max-h-[500px] min-w-[1102px] overflow-y-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="dark:bg-gray-dark sticky top-0 z-30 border-b border-gray-100 bg-white dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Institute Name
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Username
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Published Date
                </TableCell>

                {/* <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  View Password
                </TableCell> */}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {company && company.length > 0 ? (
                company.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-5 py-4 text-start sm:px-6">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                            {item.name}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            Company
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.email}
                    </TableCell>

                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        //weekday: "long",
                        year: "numeric",
                        month: "short", //month: "long"
                        day: "numeric",
                      })}
                    </TableCell>

                    {/* <TableCell className="px-4 py-3 text-start">
                      <Button
                        onClick={() =>
                          handleShowPassword(item.originalPassword)
                        }
                        size="sm"
                        className="rounded bg-gray-800 px-5 py-2 text-sm text-white transition hover:bg-gray-900"
                      >
                        Show Password
                      </Button>
                    </TableCell> */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No Company found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {selectedId !== null && password !== null && (
        <ShowEncryptedPassword
          onCloseModal={handleCloseShowPassword}
          encryptedPassword={password}
        />
      )}
    </div>
  );
}
