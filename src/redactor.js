const traverse = require('traverse')
const redactorPii = require('redact-pii')({salutation: null, valediction: null, name: null, digits: null})
const _ = require('lodash')

const PATH_DESCRIPTIONS = [
  // google
  ['request_body', 'originalRequest', 'data', 'inputs', '*', 'rawInputs', '*', 'query'],
  ['request_body', 'originalRequest', 'data', 'inputs', '*', 'arguments', '*', 'rawText'],
  ['request_body', 'originalRequest', 'data', 'inputs', '*', 'arguments', '*', 'textValue'],
  ['request_body', 'result', 'resolvedQuery'],
  ['request_body', 'result', 'parameters', '*'],
  ['request_body', 'result', 'contexts', '*', 'parameters', '*'],

  // facebook
  ['entry', '*', 'messaging', '*', 'message', 'text'],

  // generic
  ['text'],

  // line
  ['message', 'text']
]

const redactor = {
  redact: function(obj) {
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
    _.each(matchedPaths, function(path) {
      const value = _.get(cloned, path)
      if (value && _.isString(value)) {
        _.set(cloned, path, redactorPii.redact(value))
      }
    })
    return cloned
  }
}

module.exports = redactor;
