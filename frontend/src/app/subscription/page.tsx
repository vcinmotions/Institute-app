import PortalSubscription from "@/components/subscription/PortalSubscription";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PortalSubscription />
    </Suspense>
  );
}
