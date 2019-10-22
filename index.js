const parse = require('csv-parse');


const parser = parse({delimiter: ':'});

const output = [];

parser.on('readable', function() {
    let record;
    while (record = parser.read()) {
        output.push(record);
    }
});

parser.on('error', function(err) {
    console.log(err);
});

parser.on('end', function() {
    console.table(output);
});

parser.write("root:x:0:0:root:/root:/bin/bash\n");
parser.write("someone:x:1022:1022::/home/someone:/bin/bash\n");

parser.end();
