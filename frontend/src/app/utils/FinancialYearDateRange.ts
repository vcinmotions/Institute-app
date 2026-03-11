export function getFinancialYear(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (month >= 4) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
}