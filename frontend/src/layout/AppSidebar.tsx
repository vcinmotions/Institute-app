"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  UserIcon,
  ShootingStarIcon,
  AlertIcon,
  AngleDownIcon,
  AngleUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  AudioIcon,
  BoltIcon,
  ChatIcon,
  DocsIcon,
  EnvelopeIcon,
  FileIcon,
  GroupIcon,
  InfoIcon,
  LockIcon,
  MailIcon,
  MoreDotIcon,
  PaperPlaneIcon,
  PlusIcon,
  PencilIcon,
  TaskIcon,
  TimeIcon,
  TrashBinIcon,
  VideoIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[];
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  group?: string;
};

const navItems: NavItem[] = [
  // --- OVERVIEW ---
  {
    group: "Overview",
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
    roles: ["ADMIN", "FRONT_DESK", "ACCOUNTANT", "FACULTY", "VIEW_ONLY"],
  },
  {
    group: "Overview",
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/dashboard/calendar",
    roles: [],
  },
  // {
  //   group: "Overview",
  //   icon: <EnvelopeIcon />,
  //   name: "Profile",
  //   path: "/dashboard/profile",
  //   roles: ["ADMIN", "FRONT_DESK", "ACCOUNTANT", "FACULTY"],
  // },

  // --- ADMISSIONS & CRM ---
  {
    group: "Admissions & CRM",
    icon: <UserIcon />,
    name: "Enquiry",
    path: "/dashboard/enquiry",
    roles: ["ADMIN", "FRONT_DESK"],
    subItems: [
      { name: "Enquiry List", path: "/dashboard/enquiry" },
      { name: "Create Enquiry", path: "/dashboard/enquiry/create" },
    ],
  },
  {
    group: "Admissions & CRM",
    icon: <UserIcon />,
    name: "Admission",
    path: "/dashboard/admission",
    roles: ["ADMIN"],
  },
  {
    group: "Admissions & CRM",
    icon: <LockIcon />,
    name: "Admission Config",
    path: "/dashboard/admission-config",
    roles: ["ADMIN", "FRONT_DESK"],
  },

  // --- ACADEMICS ---
  {
    group: "Academics",
    icon: <DocsIcon />,
    name: "Students",
    path: "/dashboard/student",
    roles: ["ADMIN", "FRONT_DESK"],
  },
  {
    group: "Academics",
    icon: <ShootingStarIcon />,
    name: "Student Course",
    path: "/dashboard/student-course",
    roles: ["ADMIN", "FRONT_DESK", "FACULTY"],
  },
  {
    group: "Academics",
    icon: <TaskIcon />,
    name: "Batch",
    path: "/dashboard/batch",
    roles: ["ADMIN", "FRONT_DESK"],
  },
  {
    group: "Academics",
    icon: <LockIcon />,
    name: "Course",
    path: "/dashboard/course",
    roles: ["ADMIN", "FRONT_DESK"],
    subItems: [
      { name: "Course List", path: "/dashboard/course" },
      { name: "Create Course", path: "/dashboard/course/create" },
    ],
  },
  {
    group: "Academics",
    icon: <LockIcon />,
    name: "Lab",
    path: "/dashboard/lab",
    roles: ["ADMIN", "FRONT_DESK"],
    subItems: [
      { name: "Lab List", path: "/dashboard/lab" },
      { name: "Create Lab", path: "/dashboard/lab/create" },
    ],
  },
  {
    group: "Academics",
    icon: <PaperPlaneIcon />,
    name: "Faculty",
    path: "/dashboard/faculty",
    roles: ["ADMIN", "FRONT_DESK"],
    subItems: [
      { name: "Faculty List", path: "/dashboard/faculty" },
      { name: "Create Faculty", path: "/dashboard/faculty/create" },
    ],
  },
  {
    group: "Academics",
    icon: <LockIcon />,
    name: "Test",
    path: "/dashboard/test",
    roles: ["ADMIN", "FACULTY"],
    subItems: [
      { name: "Test List", path: "/dashboard/test" },
      { name: "Create Test", path: "/dashboard/test/create" },
    ],
  },
  {
    group: "Academics",
    icon: <LockIcon />,
    name: "Attendance",
    path: "/dashboard/attendance",
    roles: ["ADMIN", "FACULTY"],
  },
  {
    group: "Academics",
    icon: <LockIcon />,
    name: "Task",
    path: "/dashboard/task",
    roles: ["ADMIN", "FRONT_DESK"],
    subItems: [
      { name: "Task List", path: "/dashboard/task" },
      { name: "Create Task", path: "/dashboard/task/create" },
    ],
  },

  // --- FINANCE & INVENTORY ---
  {
    group: "Finance & Inventory",
    icon: <BoltIcon />,
    name: "Payment",
    path: "/dashboard/payment",
    roles: ["ADMIN", "ACCOUNTANT"],
  },
  {
    group: "Finance & Inventory",
    icon: <FileIcon />,
    name: "Receipt Config",
    path: "/dashboard/payment-receipt-config",
    roles: ["ADMIN", "FRONT_DESK"],
  },

  // --- ADMINISTRATION ---
  {
    group: "Administration",
    icon: <UserIcon />,
    name: "Master",
    path: "/dashboard/Source",
    roles: ["ADMIN"],
    subItems: [{ name: "Source Config", path: "/dashboard/source" }],
  },
  {
    group: "Administration",
    icon: <LockIcon />,
    name: "Roles",
    path: "/dashboard/roles",
    roles: ["ADMIN", "FRONT_DESK"],
    subItems: [
      { name: "Roles List", path: "/dashboard/roles" },
      { name: "Create Roles", path: "/dashboard/roles/create" },
    ],
  },
  {
    group: "Administration",
    icon: <UserIcon />,
    name: "Reports",
    path: "/dashboard/reports",
    roles: ["ADMIN"],
  },

  // --- SYSTEM ADMIN ---
  {
    group: "System Admin",
    icon: <GridIcon />,
    name: "Company",
    path: "/master-dashboard",
    roles: ["MASTER_ADMIN"],
    subItems: [
      { name: "Company List", path: "/master-dashboard" },
      { name: "Create Company", path: "/master-dashboard/company" },
    ],
  },
  {
    group: "System Admin",
    icon: <EnvelopeIcon />,
    name: "Settings",
    path: "/master-dashboard/settings",
    roles: ["MASTER_ADMIN"],
  },

  // --- MISC / UI ELEMENTS ---
  {
    group: "Misc Tools",
    name: "Forms",
    icon: <ListIcon />,
    subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
    roles: [],
  },
  {
    group: "Misc Tools",
    name: "Tables",
    icon: <TableIcon />,
    subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
    roles: [],
  },
  {
    group: "Misc Tools",
    name: "Pages",
    icon: <PageIcon />,
    roles: [],
    subItems: [
      { name: "Blank Page", path: "/blank", pro: false },
      { name: "404 Error", path: "/error-404", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);

  const menuItemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const subMenuItemRefs = useRef<Record<string, (HTMLLIElement | null)[]>>({});
  const sidebarScrollRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const userRole = user?.role;
  const isSidebarVisible = isExpanded || isHovered || isMobileOpen;

  const filteredNavItems = useMemo(() => {
    return navItems
      .filter((item) => !item.roles || item.roles.includes(userRole))
      .filter((item) => {
        if (!searchQuery) return true;
        const matchesMainItem = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubItems = item.subItems?.some((sub) =>
          sub.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const matchesGroup = item.group?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesMainItem || matchesSubItems || matchesGroup;
      });
  }, [userRole, searchQuery]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let submenuMatched = false;
    filteredNavItems.forEach((nav, i) => {
      if (nav.subItems) {
        const hasActiveSub = nav.subItems.some((subItem) => isActive(subItem.path));
        if (hasActiveSub || (searchQuery && nav.subItems.some(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase())))) {
          setOpenSubmenu({ type: "main", index: i });
          submenuMatched = true;
        }
      }
    });

    if (!submenuMatched && !searchQuery) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, filteredNavItems, searchQuery]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu, filteredNavItems]);

  useEffect(() => {
    if (!openSubmenu) {
      const container = sidebarScrollRef.current;
      const el = menuItemRefs.current[index];
      if (!container || !el) return;

      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offset = 8;

      if (elRect.bottom > containerRect.bottom) {
        container.scrollBy({ top: elRect.bottom - containerRect.bottom + offset, behavior: "smooth" });
      } else if (elRect.top < containerRect.top) {
        container.scrollBy({ top: elRect.top - containerRect.top - offset, behavior: "smooth" });
      }
    }
  }, [index, openSubmenu]);

  useEffect(() => {
    if (openSubmenu) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      const el = subMenuItemRefs.current[key]?.[subIndex];
      const container = sidebarScrollRef.current;
      if (!container || !el) return;

      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offset = 8;

      if (elRect.bottom > containerRect.bottom) {
        container.scrollBy({ top: elRect.bottom - containerRect.bottom + offset, behavior: "smooth" });
      } else if (elRect.top < containerRect.top) {
        container.scrollBy({ top: elRect.top - containerRect.top - offset, behavior: "smooth" });
      }
    }
  }, [subIndex, openSubmenu]);

  const handleSubmenuToggle = (i: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === i) {
        setSubIndex(0);
        return null;
      }
      setSubIndex(0);
      return { type: menuType, index: i };
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (
      (target.tagName === "INPUT" && e.key !== "ArrowDown" && e.key !== "ArrowUp") ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.isContentEditable
    ) {
      return;
    }

    if (filteredNavItems.length === 0) return;
    const currentItem = filteredNavItems[index];

    if (!openSubmenu) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndex((i) => (i + 1) % filteredNavItems.length);
        setSubIndex(0);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndex((i) => (i - 1 + filteredNavItems.length) % filteredNavItems.length);
        setSubIndex(0);
        return;
      }
      if (e.key === "ArrowRight") {
        if (currentItem?.subItems) {
          e.preventDefault();
          setOpenSubmenu({ type: "main", index });
          setSubIndex(0);
          return;
        }
        if (currentItem?.path) {
          router.push(currentItem.path);
          return;
        }
      }
    }

    if (openSubmenu && currentItem?.subItems) {
      const subs = currentItem.subItems;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSubIndex((i) => (i + 1) % subs.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSubIndex((i) => (i - 1 + subs.length) % subs.length);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const sub = subs[subIndex];
        if (sub?.path) router.push(sub.path);
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "Escape") {
        e.preventDefault();
        if (e.key === "Escape") router.push("/dashboard");
        setOpenSubmenu(null);
        setSubIndex(0);
        return;
      }
    }
  };

  useEffect(() => {
    const listener = (e: KeyboardEvent) => handleKeyDown(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [index, openSubmenu, subIndex, filteredNavItems]);

  useEffect(() => {
    const activeIndex = filteredNavItems.findIndex(
      (item) =>
        item.path === pathname ||
        item.subItems?.some((sub) => sub.path === pathname)
    );

    if (activeIndex !== -1) {
      setIndex(activeIndex);
      const subItems = filteredNavItems[activeIndex].subItems || [];
      const activeSubIndex = subItems.findIndex((sub) => sub.path === pathname);
      setSubIndex(activeSubIndex !== -1 ? activeSubIndex : 0);
    }
  }, [pathname, filteredNavItems]);

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-[2px]">
      {items.map((nav, i) => {
        const isKeyboardSelected = i === index;
        const isSubmenuOpen = openSubmenu?.type === menuType && openSubmenu?.index === i;
        const hasActiveSubItem = nav.subItems?.some((sub) => isActive(sub.path));
        const isCurrentlyActive = nav.path ? isActive(nav.path) : hasActiveSubItem;
        const showGroupHeader = nav.group && nav.group !== items[i - 1]?.group;

        return (
          <React.Fragment key={`${nav.group}-${nav.name}-${i}`}>
            {/* MODULE CATEGORY HEADER */}
            {showGroupHeader && (
              <div
                className={`mt-4 mb-1.5 flex text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ${!isSidebarVisible ? "justify-center" : "justify-start px-2.5"
                  }`}
              >
                {isSidebarVisible ? nav.group : <HorizontaLDots className="w-3 h-3 text-slate-400" />}
              </div>
            )}

            <li ref={(el) => { menuItemRefs.current[i] = el; }}>
              {nav.subItems ? (
                <button
                  type="button"
                  onClick={() => handleSubmenuToggle(i, menuType)}
                  className={`flex h-7.5 w-full items-center gap-2.5 rounded px-2.5 text-[11px] font-medium tracking-wide transition-all outline-none text-left border border-transparent ${isKeyboardSelected || isCurrentlyActive
                    ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200"
                    } ${!isSidebarVisible ? "justify-center" : "justify-start"}`}
                >
                  <span className={`w-4 h-4 shrink-0 transition-colors ${isCurrentlyActive ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}`}>
                    {nav.icon}
                  </span>
                  {isSidebarVisible && <span className="truncate flex-1">{nav.name}</span>}
                  {isSidebarVisible && (
                    <ChevronDownIcon
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-150 ${isSubmenuOpen ? "rotate-180 text-slate-700 dark:text-slate-300" : ""}`}
                    />
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    href={nav.path}
                    className={`flex h-7.5 w-full items-center gap-2.5 rounded px-2.5 text-[11px] font-medium tracking-wide transition-all border border-transparent ${isKeyboardSelected || isCurrentlyActive
                      ? "bg-slate-900 text-white font-semibold shadow-sm dark:bg-slate-100 dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200"
                      } ${!isSidebarVisible ? "justify-center" : "justify-start"}`}
                  >
                    <span className={`w-5 h-5 shrink-0 transition-colors ${isCurrentlyActive && !isKeyboardSelected ? "text-white dark:text-slate-950" : "text-slate-400 dark:text-slate-500"}`}>
                      {nav.icon}
                    </span>
                    {isSidebarVisible && <span className="truncate flex-1">{nav.name}</span>}
                  </Link>
                )
              )}

              {/* ERP Submenu Link Elements */}
              {nav.subItems && isSidebarVisible && (
                <div
                  ref={(el) => { subMenuRefs.current[`${menuType}-${i}`] = el; }}
                  className="overflow-hidden transition-all duration-200 ease-in-out"
                  style={{
                    height: isSubmenuOpen ? `${subMenuHeight[`${menuType}-${i}`] || 0}px` : "0px",
                  }}
                >
                  <ul className="my-[2px] ml-4 pl-3 border-l border-slate-200/80 dark:border-slate-800 flex flex-col gap-[2px]">
                    {nav.subItems.map((subItem, si) => {
                      const key = `${menuType}-${i}`;
                      if (!subMenuItemRefs.current[key]) subMenuItemRefs.current[key] = [];
                      const isSubKeyboard = si === subIndex;
                      const isSubActive = isActive(subItem.path);

                      return (
                        <li
                          key={subItem.name}
                          ref={(el) => {
                            if (!subMenuItemRefs.current[key]) subMenuItemRefs.current[key] = [];
                            subMenuItemRefs.current[key][si] = el;
                          }}
                        >
                          <Link
                            href={subItem.path}
                            className={`flex h-7 w-full items-center px-2 text-[11px] font-medium tracking-wide rounded transition-colors ${isSubKeyboard || isSubActive
                              ? "text-slate-900 font-semibold bg-slate-50 dark:text-slate-100 dark:bg-slate-900"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/30"
                              }`}
                          >
                            <span className="truncate">{subItem.name}</span>
                            <span className="ml-auto flex items-center gap-1 shrink-0">
                              {subItem.new && (
                                <span className="px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 select-none">
                                  new
                                </span>
                              )}
                              {subItem.pro && (
                                <span className="px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 select-none">
                                  pro
                                </span>
                              )}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          </React.Fragment>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-40 mt-14 flex h-[calc(100vh-56px)] flex-col border-r border-slate-200 bg-white px-3 text-slate-900 transition-all duration-200 ease-in-out lg:mt-0 lg:h-screen dark:border-slate-800 dark:bg-slate-950 ${isSidebarVisible ? "w-[240px]" : "w-[68px]"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* BRAND ARCHITECTURE ZONE */}
      <div className={`flex h-14 items-center shrink-0 border-b border-transparent ${!isSidebarVisible ? "lg:justify-center" : "justify-start pl-1.5"}`}>
        <Link href="/dashboard" className="flex items-center">
          {isSidebarVisible ? (
            <>
              <Image className="dark:hidden object-contain" src="/images/logo/logo.svg" alt="Logo" width={115} height={32} unoptimized />
              <Image className="hidden dark:block object-contain" src="/images/logo/logo-dark.svg" alt="Logo" width={115} height={32} unoptimized />
            </>
          ) : (
            <Image src="/images/logo/logo-icon.svg" alt="Logo" width={24} height={24} unoptimized />
          )}
        </Link>
      </div>

      {/* COMPACT ERP SELECTION SEARCH SEARCHWAY */}
      <div className="my-2.5 px-0.5 shrink-0">
        {isSidebarVisible ? (
          <div className="relative flex items-center w-full">
            <span className="absolute left-2.5 text-slate-400 dark:text-slate-500">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick navigation search..."
              className="h-7.5 w-full rounded border border-slate-200 bg-slate-50/60 pl-8 pr-7 text-[11px] font-medium text-slate-700 outline-none transition-all focus:border-slate-300 focus:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:focus:border-slate-700"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px]"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (!isExpanded) setIsHovered(true);
              setTimeout(() => searchInputRef.current?.focus(), 150);
            }}
            className="flex h-7.5 w-full items-center justify-center rounded border border-transparent bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 text-slate-400"
            title="Search Navigation"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* DENSE SCROLLABLE MENU CANVAS */}
      <div ref={sidebarScrollRef} className="no-scrollbar flex flex-col overflow-y-auto flex-1 pr-0.5 pb-4">
        <nav className="mt-1">
          <div className="flex flex-col">
            {filteredNavItems.length > 0 ? (
              renderMenuItems(filteredNavItems, "main")
            ) : (
              <div className="px-2 py-6 text-center text-[11px] font-medium text-slate-400 dark:text-slate-500">
                No matching tracks found
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;