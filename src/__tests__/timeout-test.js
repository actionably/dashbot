
const assert = require('assert');
const http = require('http');
const makeRequest = require('../make-request');

describe('makeRequest()', function() {
  it('should receive a response', function(done) {
    this.timeout(2000);

    const server = http.createServer((_, res) => {
      const p = new Promise(function (resolve) {
        setTimeout(function () {
          resolve()
        }, 1000)
      });

      p.then(function () {
        res.end('success')
      }, function () {
      })
    });

    server.listen(9000);

    const p = makeRequest({
      uri: 'http://localhost:9000',
      method: 'POST',
      json: {}
    }, true, false);

    p.then(function (res) {
      assert.equal(res.status, 200)
    }, function(e) {
      throw new Error(e)
    }).then(done, done)
  });

  it('should timeout', function(done) {
    this.timeout(2000);

    const server = http.createServer((_, res) => {
      const p = new Promise(function (resolve) {
        setTimeout(function () {
          resolve()
        }, 1000)
      });

      p.then(function () {
        res.end('success')
      }, function () {
        res.end('fail')
      })
    });

    server.listen(9001);

    const p = makeRequest({
      uri: 'http://localhost:9001',
      method: 'POST',
      json: {}
    }, true, false, 999);

    p.then(function (res) {
      throw new Error(res.status)
    }, function(e) {
      assert.ok(e.message.includes('timeout'))
    }).then(done, done)
  });

});