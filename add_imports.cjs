const fs = require('fs');
let file = fs.readFileSync('src/components/pages.tsx', 'utf-8');

if (!file.includes('Clock,')) {
    file = file.replace('CalendarDays,', 'CalendarDays,\n  Clock,\n  LineChart,');
    fs.writeFileSync('src/components/pages.tsx', file, 'utf-8');
    console.log('Added Clock and LineChart imports');
} else {
    console.log('Imports already present');
}
