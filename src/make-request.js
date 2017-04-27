'use strict';

var fetch = require('isomorphic-fetch')

module.exports = function (data, printErrors) {
  if (printErrors) {
    return fetch(data.uri, {
      method: data.method,
      body: JSON.stringify(data.json),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } else {
    fetch(data.uri, {
      method: data.method,
      body: JSON.stringify(data.json),
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(function(err) {
      // ignore
    });
  }
}
