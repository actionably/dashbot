/* Copyright (c) 2016-2019 Dashbot Inc All rights reserved */
const traverse = require('traverse')
const { AsyncRedactor } = require('redact-pii');
//const redactorPii = require('redact-pii')({salutation: null, valediction: null, name: null, digits: null})
const _ = require('lodash')

const PATH_DESCRIPTIONS = [
  // google
  ['request_body', 'originalRequest', 'data', 'inputs', '*', 'rawInputs', '*', 'query'],
  ['request_body', 'originalRequest', 'data', 'inputs', '*', 'arguments', '*', 'rawText'],
  ['request_body', 'originalRequest', 'data', 'inputs', '*', 'arguments', '*', 'textValue'],
  ['request_body', 'result', 'resolvedQuery'],
  ['request_body', 'result', 'parameters', '*'],
  ['request_body', 'result', 'contexts', '*', 'parameters', '*'],

  //alexa
  ['event', 'request', 'intent', 'slots', '*', 'value'],
  ['event', 'session', 'attributes', '*'],
  ['response', 'sessionAttributes', '*'],

  // facebook
  ['entry', '*', 'messaging', '*', 'message', 'text'],

  // generic
  ['text'],
  ['intent', 'inputs', '*', 'value'],

  // line
  ['message', 'text']
]

const defaultAsyncRedactor = new AsyncRedactor({
  builtInRedactors: {
    digits: {
      enabled: false
    }
  }
});

const redactor = {
  redact: async (obj, customRedactor) => {
    const asyncRedactor = customRedactor || defaultAsyncRedactor
    const paths = traverse(obj).paths()
    const matchedPaths = _.filter(paths, function(path) {
      return _.some(PATH_DESCRIPTIONS, function(pathDesc) {
        if (pathDesc.length !== path.length) {
          return false   
        } else {
          return _.every(pathDesc, function(pathFragment, i) {
            return (pathFragment === '*' || pathFragment === path[i])
          })
        }
      })
    })
    if (!matchedPaths.length) {
      return obj
    }
    const cloned = _.cloneDeep(obj)
    await Promise.all(_.map(matchedPaths, async (path) => {
      const value = _.get(cloned, path)
      if (value && _.isString(value)) {
        const newValue = await asyncRedactor.redactAsync(value)
        _.set(cloned, path, newValue)
      }
    }))
    return cloned
  }
}

module.exports = redactor;
