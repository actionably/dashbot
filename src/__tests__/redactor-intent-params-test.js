/* Copyright (c) 2016-2019 Dashbot Inc All rights reserved */
const assertObject = require('assert-object')
const redactor = require('../redactor')
const { AsyncRedactor } = require('redact-pii');
const _ = require('lodash')

describe('Redactor of intent params', function() {
  it('should redact zip in session and sessionAttributes alexa', async () => {
    const data = _.cloneDeep(require('./data/alexa-with-session-attributes-outgoing'))
    const redacted = await redactor.redact(data)
    const expectedRedacted = _.cloneDeep(require('./data/alexa-with-session-attributes-outgoing-redacted'))
    assertObject.equal(redacted, expectedRedacted)
  })
  it('should redact zip in intent params alexa', async () => {
    const data = _.cloneDeep(require('./data/alexa-with-intent-params'))
    const redacted = await redactor.redact(data)
    const expectedRedacted = _.cloneDeep(require('./data/alexa-with-intent-params-redacted'))
    assertObject.equal(redacted, expectedRedacted)
  })
  it('should redact phone in intent params generic', async () => {
    const data = _.cloneDeep(require('./data/generic-with-intent-params'))
    const redacted = await redactor.redact(data)
    const expectedRedacted = _.cloneDeep(require('./data/generic-with-intent-params-redacted'))
    assertObject.equal(redacted, expectedRedacted)
  })
  it('should redact phone and digits with custom redactor', async () => {
    const data = _.cloneDeep(require('./data/generic-with-intent-params'))
    const customRedactor = new AsyncRedactor();
    const redacted = await redactor.redact(data, customRedactor)
    const expectedRedacted = _.cloneDeep(require('./data/generic-with-intent-params-redacted'))
    _.set(expectedRedacted, 'intent.inputs[2].value', 'DIGITS')
    assertObject.equal(redacted, expectedRedacted)
  })
})