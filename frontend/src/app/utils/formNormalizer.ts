// utils/formNormalizerMap.ts

import {
    titleCase,
    normalizeEmail,
    normalizePhone,
    normalizeToLowercase,
    normalizeNumber,
    normalizeDate,
    collapseSpaces,
} from "./Normalize";

export const fieldNormalizers: Record<string, (v: string) => string> = {
    name: (v) => titleCase(collapseSpaces(v)),

    instituteName: (v) =>
        normalizeToLowercase(),

    email: normalizeEmail,

    contact: normalizePhone,

    zipCode: normalizeNumber,

    fullAddress: collapseSpaces,

    financialStartDate: normalizeDate,
    financialEndDate: normalizeDate,
};