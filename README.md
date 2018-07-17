# Process Tracker

Helps to track running background tasks and prevents process from quiting until everything finishes.


### Example

```ts
import { ProcessTracker } from '@splytech-io/process-tracker';

const processTracker = new ProcessTracker();



// - option 1

processTracker.trackPromise(startBackgroundProcess1());
processTracker.trackPromise(startBackgroundProcess2());
/* ... */
processTracker.trackPromise(startBackgroundProcess10());



// - option 2

async function somFunction() {
  processTracker.inc();
  await startAnotherBackgroundProcess();
  processTracker.dec();
}


processTracker.wait().then(() => {
  // called when all background processes finish - safe to quit
});



```


## API

### new ProcessTracker();
returns an instance of `ProcessTracker` which extends `EventEmitter`

#### inc(): void;
increments internal process counter

#### dec(): void;
decrements internal process counter. Emits `drain` event.

**WARNING!** throws an error if internal counter equals to 0 before calling `dec()`

#### trackPromise(promise: Promise<any>): void;
increments internal process counter and decrements it when promise is fullfiled

#### getCount(): number;
returns internal process counter

#### wait(): Promise<void>;
returns a promise which is resolved when counter becomes 0

### Events

#### drain
emitted when internal counter is decremented
