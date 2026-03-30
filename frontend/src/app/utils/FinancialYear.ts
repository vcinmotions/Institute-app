function generateFinancialYear() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0 = Jan

    let startYear;
    let endYear;

    if (month >= 3) {
        // April or later
        startYear = year;
        endYear = year + 1;
    } else {
        startYear = year - 1;
        endYear = year;
    }

    return {
        name: `${startYear}-${endYear}`,
        startDate: new Date(`${startYear}-04-01`),
        endDate: new Date(`${endYear}-03-31`)
    };
}