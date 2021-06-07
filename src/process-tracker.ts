import { EventEmitter } from 'events';

export class ProcessTracker extends EventEmitter {
  private instances = 0;

  /**
   *
   * @param {Promise<any>} promise
   */
  trackPromise(promise: Promise<any>) {
    this.inc();
    promise.finally(() => this.dec());
  }

  /**
   *
   * @param {() => Promise<T>} fn
   * @returns {() => Promise<T>}
   */
  trackFunctionCall<T, U extends (...args: any[]) => Promise<T>>(fn: U): U {
    return ((...args) => {
      const promise = fn(...args);

      this.trackPromise(promise);

      return promise;
    }) as U;
  }

  /**
   *
   */
  inc() {
    this.instances++;
  }

  /**
   *
   */
  dec() {
    if (this.instances === 0) {
      throw new Error('ProcessTracker: reached negative count');
    }

    this.instances--;
    this.emit('drain');
  }

  /**
   *
   * @returns {number}
   */
  getCount() {
    return this.instances;
  }

  /**
   *
   * @returns {Promise<void>}
   */
  async wait() {
    while (this.getCount()) {
      await new Promise((resolve) => this.once('drain', resolve));
    }
  }
}
