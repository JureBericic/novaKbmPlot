const parse = require('csv-parse');
const fs = require('fs');

const data = [];

const parser = parse({
    delimiter: ';',
    from_line: 2
});

function parseAmount(amount) {
    if (amount === "") {
        return 0;
    }

    return parseFloat(amount.replace(',', '.'));
}

fs
    // read file
    .createReadStream('./data/promet_test.csv')
    // parse csv
    .pipe(parser)
    // transform each line into needed form
    .on('data', (line) => data.push({
        date: new Date(line[4].split('.').reverse().join('-')),
        amount: parseAmount(line[5]) - parseAmount(line[6]),
        currency: line[7],
    }))
    // print data at the end
    .on('end', () => {console.table(data)});
