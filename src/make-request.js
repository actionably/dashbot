'use strict';

const fetch = require('isomorphic-fetch')
const redactor = require('./redactor')
const _ = require('lodash')

module.exports = async (data, printErrors, redact, timeout = 15000) => {
  let body = data.json
  if (body && redact) {
    let customRedactor = null
    if (_.isObject(redact)) {
      customRedactor = redact
    }
    body = await redactor.redact(body, customRedactor)
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
