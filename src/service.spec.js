const assert = require('assert');
const util = require('util');
const Service = require('./service');

const setTimeoutAsync = util.promisify(setTimeout);

console.log(Service);

describe('Service', () => {
  let service;

  afterEach(() => {
    service.disable();
  });

  it('handles concurrent processes', async () => {
    service = new Service();

    const proc = (id) => async (resolve, reject) => {
      // ensure each proc is a different executionAsyncId
      await setTimeoutAsync(0);
      await service.run(async () => {
        try {
          const value = { id };
          service.set('key', value);
          await setTimeoutAsync(0);
          const value1 = service.get('key');
          assert.strictEqual(value, value1, `${id} === ${value1 && value1.id}`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    };

    const a = new Promise(proc('a'));
    const b = new Promise(proc('b'));
    const c = new Promise(proc('c'));

    await Promise.all([a, b, c]);
  });

  it('can handle promises created out of the execution stack', async () => {
    service = new Service();

    const p = Promise.resolve();

    await service.run(async () => {
      service.set('foo');

      await p.then(() => {
        assert.strictEqual('foo', service.get());
      });
    });
  });
});
