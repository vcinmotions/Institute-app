"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

// Make sure your icons are correctly exported from this path
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

// Added 'group' to categorize items in the ERP layout
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[];
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  group?: string;
};

// ERP System Categorization
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
  {
    group: "Overview",
    icon: <EnvelopeIcon />,
    name: "Profile",
    path: "/dashboard/profile",
    roles: ["ADMIN", "FRONT_DESK", "ACCOUNTANT", "FACULTY"],
  },

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
  {
    group: "Finance & Inventory",
    icon: <LockIcon />,
    name: "Stationary",
    path: "/dashboard/stationary",
    roles: [],
    subItems: [
      { name: "Stationary List", path: "/dashboard/stationary" },
      { name: "Create Stationary", path: "/dashboard/stationary/create" },
    ],
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
  // {
  //   group: "Administration",
  //   icon: <LockIcon />,
  //   name: "Activity Logs",
  //   path: "/dashboard/activity",
  //   roles: ["ADMIN", "FRONT_DESK"],
  // },
  // {
  //   group: "Administration",
  //   icon: <LockIcon />,
  //   name: "Notification",
  //   path: "/dashboard/notification",
  //   roles: ["ADMIN", "FRONT_DESK"],
  // },

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

  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const router = useRouter();

  const userRole = user?.role;

  // Replace your current filteredNavItems with this:
  const filteredNavItems = useMemo(() => {
    return navItems.filter((item) => !item.roles || item.roles.includes(userRole));
  }, [userRole]);

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
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ type: "main", index: i });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, filteredNavItems]);

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
  }, [openSubmenu]);

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
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === i
      ) {
        setSubIndex(0);
        return null;
      }
      setSubIndex(0);
      return { type: menuType, index: i };
    });
  };

  useEffect(() => {
    const listener = (e: KeyboardEvent) => handleKeyDown(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [index, openSubmenu, subIndex, filteredNavItems]);

  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;

    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.tagName === "MultiSelect" ||
      target.isContentEditable
    ) {
      return;
    }

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

  const renderMenuItems = (filteredNavItems: NavItem[], menuType: "main" | "others") => (
    // Reduced gap from gap-4 to gap-1 for a denser ERP feel
    <ul className="flex flex-col gap-1">
      {filteredNavItems.map((nav, i) => {
        const isKeyboardSelected = i === index;
        const isSubmenuOpen = openSubmenu?.type === menuType && openSubmenu?.index === i;

        // Dynamically track and insert group titles
        const showGroupHeader = nav.group && nav.group !== filteredNavItems[i - 1]?.group;

        return (
          <React.Fragment key={`${nav.group}-${nav.name}-${i}`}>

            {/* RENDER ERP MODULE CATEGORY HEADER */}
            {showGroupHeader && (
              <div
                className={`mt-4 mb-2 flex text-xs font-semibold uppercase tracking-wider text-gray-400 ${!isExpanded && !isHovered ? "justify-center" : "justify-start px-3"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  nav.group
                ) : (
                  <HorizontaLDots />
                )}
              </div>
            )}

            <li
              ref={(el) => {
                menuItemRefs.current[i] = el;
              }}
            >
              {nav.subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(i, menuType)}
                  className={`menu-item group transition-colors ${isKeyboardSelected || isSubmenuOpen
                    ? "menu-item-active"
                    : "menu-item-inactive"
                    } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                    }`}
                >
                  <span
                    className={`${isSubmenuOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"
                      }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto h-4 w-4 transition-transform duration-200 ${isSubmenuOpen ? "text-brand-500 rotate-180" : ""
                        }`}
                    />
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    href={nav.path}
                    className={`menu-item group transition-colors ${isKeyboardSelected || isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                      }`}
                  >
                    <span
                      className={`${isSubmenuOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"
                        }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text">{nav.name}</span>
                    )}
                  </Link>
                )
              )}

              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${i}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    // Add the "|| 0" right here to ensure valid CSS
                    height: isSubmenuOpen ? `${subMenuHeight[`${menuType}-${i}`] || 0}px` : "0px",
                  }}
                >
                  <ul className="mt-1 ml-9 space-y-1">
                    {nav.subItems.map((subItem, si) => {
                      const key = `${menuType}-${i}`;
                      if (!subMenuItemRefs.current[key]) subMenuItemRefs.current[key] = [];
                      const isSubKeyboard = si === subIndex;

                      return (
                        <li
                          key={subItem.name}
                          ref={(el) => {
                            subMenuItemRefs.current[key][si] = el;
                          }}
                        >
                          <Link
                            href={subItem.path}
                            className={`menu-dropdown-item transition-colors ${isSubKeyboard || isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                              }`}
                          >
                            {subItem.name}
                            <span className="ml-auto flex items-center gap-1">
                              {subItem.new && (
                                <span
                                  className={`menu-dropdown-badge ${isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                    }`}
                                >
                                  new
                                </span>
                              )}
                              {subItem.pro && (
                                <span
                                  className={`menu-dropdown-badge ${isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                    }`}
                                >
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
      className={`fixed top-0 left-0 z-90 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-4 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 dark:border-gray-800 dark:bg-gray-900 ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex py-6 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start pl-2"}`}>
        <Link href="/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
                unoptimized
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
                unoptimized
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
              unoptimized
            />
          )}
        </Link>
      </div>
      <div ref={sidebarScrollRef} className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col">
            {renderMenuItems(filteredNavItems, "main")}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;