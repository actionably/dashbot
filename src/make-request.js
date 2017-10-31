'use strict';

const fetch = require('isomorphic-fetch')
const redactor = require('./redactor')

module.exports = function (data, printErrors, redact) {
  let body = data.json
  if (body && redact) {
    body = redactor.redact(body)
  }
  const p = fetch(data.uri, {
    method: data.method,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (printErrors) {
    return p
  } else {
    p.catch(function(err) {
      // ignore
    });
  }
}
