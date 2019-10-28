const parse = require('csv-parse/lib/sync');
const fs = require('fs');


function parseAmount(amount) {
    return amount !== "" ? parseFloat(amount.replace('.', '').replace(',', '.')) : 0;
}

function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}


const records = parse(  // parse csv file
    fs.readFileSync(
        './data/promet.csv',
        { encoding: 'utf-8' }
    ),
    {
        delimiter: ';',
        from_line: 2,
        relax_column_count: true  // lines without 'NAMEN' filled, are one column too short...
    }
).map(r => ({  // map columns into useful data
    date: new Date(r[4].split('.').reverse().join('-')),
    amount: parseAmount(r[5]) - parseAmount(r[6]),
    currency: r[7]
}))
.reverse()  // last transactions are first in the file, want it around
.reduce(  // aggregate data by months
    (acc, curr) => {
        let currentStatistics = acc[acc.length - 1];
        if (!currentStatistics) {
            // create first entry
            currentStatistics = {
                year: curr.date.getFullYear(),
                month: curr.date.getMonth(),
                start: 0,
                end: 0,
                min: 0,
                max: 0,
                total: 0
            };
            acc.push(currentStatistics);
        } else if (currentStatistics.month !== curr.date.getMonth() || currentStatistics.year !== curr.date.getFullYear()) {
            // create new entry
            currentStatistics = {
                year: curr.date.getFullYear(),
                month: curr.date.getMonth(),
                end: 0,
                start: currentStatistics.end,
                end: currentStatistics.end,
                min: currentStatistics.end,
                max: currentStatistics.end,
                total: 0
            };
            acc.push(currentStatistics);
        }
        // update entry
        currentStatistics.end += curr.amount;
        currentStatistics.min = currentStatistics.end < currentStatistics.min ? currentStatistics.end : currentStatistics.min;
        currentStatistics.max = currentStatistics.end > currentStatistics.max ? currentStatistics.end : currentStatistics.max;
        currentStatistics.total += curr.amount;

        return acc;
    },
    []
).map(s => {  // round all numbers because of floating point arithmetics
    s.start = round(s.start, 2);
    s.end = round(s.end, 2);
    s.min = round(s.min, 2);
    s.max = round(s.max, 2);
    s.total = round(s.total, 2);
    
    return s;
});

console.table(records);
