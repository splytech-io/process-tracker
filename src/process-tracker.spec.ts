import { expect } from 'chai';
import { ProcessTracker } from './process-tracker';

describe('ProcessTracker', () => {
  it('should return 0 count', async () => {
    const processTracker = new ProcessTracker();

    expect(processTracker.getCount()).to.equals(0);
  });
  it('should return inc count', async () => {
    const processTracker = new ProcessTracker();

    processTracker.inc();

    expect(processTracker.getCount()).to.equals(1);
  });
  it('should return inc and dec', async () => {
    const processTracker = new ProcessTracker();

    processTracker.inc();
    processTracker.dec();

    expect(processTracker.getCount()).to.equals(0);
  });
  it('should throw if reached negative count', async () => {
    const processTracker = new ProcessTracker();

    expect(() => {
      processTracker.dec();
    }).to.throw();
  });
  it('should not lock if count is 0', async () => {
    const processTracker = new ProcessTracker();

    await processTracker.wait();
  });
  it('should lock if count is gt 0', async () => {
    const processTracker = new ProcessTracker();

    processTracker.inc();

    setTimeout(() => {
      processTracker.dec();
    }, 50);

    const before = Date.now();
    await processTracker.wait();
    const after = Date.now();

    const diff = after - before;

    expect(diff).to.be.gte(50);
  });
  it('should lock when tracking promise', async () => {
    const processTracker = new ProcessTracker();

    processTracker.trackPromise(new Promise((resolve) => {
      setTimeout(resolve, 50);
    }));

    const before = Date.now();
    await processTracker.wait();
    const after = Date.now();

    const diff = after - before;

    expect(diff).to.be.gte(50);
  });
  it('should unlock when promise gets rejected', async () => {
    const processTracker = new ProcessTracker();

    processTracker.trackPromise(new Promise((_, reject) => {
      setTimeout(reject, 50);
    }));

    const before = Date.now();
    await processTracker.wait();
    const after = Date.now();

    const diff = after - before;

    expect(diff).to.be.gte(50);
  });
  it('should track function call', async () => {
    const pt = new ProcessTracker();

    const fn = pt.trackFunctionCall(async (a: number, b: string) => {
      return `${a} + ${b}`;
    });

    const promise = fn(2, 'a');

    expect(pt.getCount()).to.equals(1);

    const r: string = await promise;

    expect(pt.getCount()).to.equals(0);
    expect(r).to.equals('2 + a');
  });
});
