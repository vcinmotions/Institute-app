// components/RoleGuard.tsx
import { RootState } from "@/store";
import { useSelector } from "react-redux";

export default function RoleGuard({
  roles,
  children,
}: {
  roles: string[];
  children: React.ReactNode;
}) {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user || !roles.includes(user.role)) {
    return <div>You are not authorized to access this page.</div>;
  }

  return <>{children}</>;
}

{
  /* <RoleGuard roles={['ADMIN', 'TEACHER']}>
  <CourseManagement />
</RoleGuard> */
}
