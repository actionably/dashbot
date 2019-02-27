'use strict';

const _ = require('lodash')

module.exports = function (userList, path) {
  return function (methodCall) {

    let list
    if(typeof userList === 'function') {
      list = userList(_.get(methodCall, `args.0.json`))
    } else {
      list = userList
    }

    if(!list || list.length === 0) {
      methodCall.proceed()
    }
    const userId = _.get(methodCall, `args.0.json.${path}`)
    if(userId && _.find(list, function(item) { return item === userId })) {
      return
    }

    methodCall.proceed()
  }
}
