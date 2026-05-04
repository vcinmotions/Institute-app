import { Metadata } from "next";
import RoleProtected from "@/components/auth/RoleProtected";
import PaymentReceiptConfigPage from "../../(ui-elements)/payment-receipt-config/page";


export const metadata: Metadata = {
  title: "Payment-receipt-config",
};

export default function PaymentReceiptConfig() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
      <PaymentReceiptConfigPage />
    </RoleProtected>
  );
}
