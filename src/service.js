const asyncHooks = require('async_hooks');

/**
 * use async hook to provide access to ctx without coupling services and passing through
 */
class Service {
  constructor() {
    this.store = {};
    this.hooks = asyncHooks.createHook({
      init: (asyncId, type, triggerAsyncId) => {
        if (this.store[triggerAsyncId]) {
          this.store[asyncId] = this.store[triggerAsyncId];
        }
      },
      destroy: (asyncId) => {
        delete this.store[asyncId];
      },
    });
    this.enable();
  }

  async run(fn) {
    this.store[asyncHooks.executionAsyncId()] = {};
    await fn();
  }

  set(key, value) {
    this.store[asyncHooks.executionAsyncId()][key] = value;
  }

  get(key) {
    const state = this.store[asyncHooks.executionAsyncId()];
    if (state) {
      return state[key];
    } else {
      return null;
    }
  }

  enable() {
    this.hooks.enable();
  }

  disable() {
    this.hooks.disable();
  }
}

module.exports = Service;
