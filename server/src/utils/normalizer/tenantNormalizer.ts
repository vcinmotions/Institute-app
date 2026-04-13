import {
  titleCase,
  normalizeEmail,
  normalizePhone,
  normalizeToLowercase,
  normalizeToUppercase,
  collapseSpaces,
  normalizeNumber,
  normalizeDate,
  normalizeTrim,
} from "../Normalize";

export function normalizeTenantInput(data: any) {
  return {
    name: data.name ? titleCase(data.name) : null,
    instituteName: data.instituteName
      ? normalizeTrim(data.instituteName)
      : null,

    email: data.email ? normalizeEmail(data.email) : null,
    password: data.password ?? null,

    contact: data.contact ? normalizePhone(data.contact) : null,

    country: data.country ?? null,
    state: data.state ?? null,
    city: data.city ?? null,

    zipCode: data.zipCode ? normalizeNumber(data.zipCode) : null,

    fullAddress: data.fullAddress
      ? collapseSpaces(data.fullAddress)
      : null,

    certificateName: data.certificateName
      ? titleCase(data.certificateName)
      : null,

    financialStartDate: data.financialStartDate
      ? normalizeDate(data.financialStartDate)
      : null,

    financialEndDate: data.financialEndDate
      ? normalizeDate(data.financialEndDate)
      : null,
  };
}