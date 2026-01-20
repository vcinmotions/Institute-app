export type LeadStatus = "HOT" | "WARM" | "COLD" | "WON" | "LOST" | "HOLD";

export class Enquiry {
  id?: string;
  name!: string;
  contact!: string;
  email?: string;
  age?: number | null;
  dob?: Date | null;
  gender?: "male" | "female" | "other" | null;
  location?: string | null;
  city?: string | null;
  source?: string | null;
  alternateContact?: string | null;
  referedBy?: string | null;
  clientAdminId!: string;
  srNo?: number;
  isConverted?: boolean;
  leadStatus?: LeadStatus;
  createdAt?: Date;

  constructor(params: Partial<Enquiry>) {
    Object.assign(this, params);
  }

  /**
   * Domain rule: Calculate age from DOB
   */
  static calculateAge(dob?: Date | null): number | null {
    if (!dob) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age -= 1;
    }

    return age;
  }

  /**
   * Domain rule: check if this enquiry belongs to a user
   */
  canBeViewedBy(clientAdminId: string): boolean {
    return this.clientAdminId === clientAdminId;
  }

  // Domain rule: Can mark as LOST
  canBeMarkedLost(): boolean {
    return this.leadStatus !== "LOST";
  }

  // Domain action: mark as lost
  markLost(): void {
    if (!this.canBeMarkedLost()) {
      throw new Error("Enquiry is already LOST");
    }
    this.leadStatus = "LOST";
  }

  // ...existing fields
  canBeConverted(): boolean {
    return this.leadStatus !== "WON" && !this.isConverted;
  }

  convert(): void {
    if (!this.canBeConverted()) {
      throw new Error("Cannot convert this enquiry");
    }
    this.isConverted = true;
  }

  canBeHeld(): boolean {
    // You typically can't hold an enquiry that is already WON or LOST
    return this.leadStatus !== "WON" && this.leadStatus !== "LOST";
  }

  /**
   * Domain action: mark as HOLD
   */
  markHold(): void {
    if (!this.canBeHeld()) {
      throw new Error("Cannot hold this enquiry");
    }
    this.leadStatus = "HOLD";
  }
}
