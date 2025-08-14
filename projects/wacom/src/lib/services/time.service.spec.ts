import '@angular/compiler';
import assert = require('assert');
import { TimeService } from './time.service';

// Stub DatePipe dependency since difference methods do not rely on it
const service = new TimeService({ transform: () => '' } as any);

function testDifferenceInDays() {
        const start = new Date('2020-01-01T00:00:00Z');
        const end = new Date('2020-01-02T00:00:00Z');
        assert.strictEqual(service.differenceInDays(start, end), 1);
}

function testDSTForward() {
        const start = new Date('2020-03-08T00:00:00-05:00');
        const end = new Date('2020-03-09T00:00:00-04:00');
        assert.strictEqual(service.differenceInHours(start, end), 23);
}

function testDSTBackward() {
        const start = new Date('2020-11-01T00:00:00-04:00');
        const end = new Date('2020-11-02T00:00:00-05:00');
        assert.strictEqual(service.differenceInMinutes(start, end), 25 * 60);
}

testDifferenceInDays();
testDSTForward();
testDSTBackward();

console.log('All tests passed');
