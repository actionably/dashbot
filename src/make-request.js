'use strict';

const fetch = require('isomorphic-fetch')
const redactor = require('./redactor')

module.exports = function (data, printErrors, redact, timeout = 15000) {
  let body = data.json
  if (body && redact) {
    body = redactor.redact(body)
  }
  const p = fetch(data.uri, {
    method: data.method,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: timeout
  })

  if (printErrors) {
    return p.then(function(response) {
      if (response.status === 400) {
        return response.text().then(function(text)  {
          console.log('validation error: ', text)
          return response
        })
      }
      return response
    })
  } else {
    p.catch(function(err) {
      // ignore
    });
  }
}
