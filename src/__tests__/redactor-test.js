'use strict'

const assert = require('assert')
const assertObject = require('assert-object')

const GOOGLE_EXAMPLE_IN = {
  'dashbot_timestamp': 1509389508277,
  'request_body': {
    'originalRequest': {
      'source': 'google',
      'version': '2',
      'data': {
        'isInSandbox': true,
        'surface': {
          'capabilities': [
            {
              'name': 'actions.capability.AUDIO_OUTPUT'
            }
          ]
        },
        'inputs': [
          {
            'rawInputs': [
              {
                'query': '1111111111111111',
                'inputType': 'VOICE'
              }
            ],
            'arguments': [
              {
                'rawText': '1111111111111111',
                'textValue': '1111111111111111',
                'name': 'text'
              }
            ],
            'intent': 'actions.intent.TEXT'
          }
        ],
        'user': {
          'locale': 'en-US',
          'userId': 'ABwppHGgPBN4EyaYddw4yEQjZV-eGsXEMCBs9UPwFw3gY1RbVH_fTkjtBUrl_DX1YLS8ZabzKF7wdel58A'
        },
        'conversation': {
          'conversationId': '1509389503392',
          'type': 'ACTIVE',
          'conversationToken': '[\'_actions_on_google_\',\'defaultwelcomeintent-followup\']'
        },
        'availableSurfaces': [
          {
            'capabilities': [
              {
                'name': 'actions.capability.AUDIO_OUTPUT'
              },
              {
                'name': 'actions.capability.SCREEN_OUTPUT'
              }
            ]
          }
        ]
      }
    },
    'id': 'afbb42e0-33d7-40e1-a15c-b61e01cf1dec',
    'timestamp': '2017-10-30T18:51:48.219Z',
    'lang': 'en-us',
    'result': {
      'source': 'agent',
      'resolvedQuery': '1111111111111111',
      'speech': '',
      'action': 'input.number',
      'actionIncomplete': false,
      'parameters': {
        'number': '1111111111111111'
      },
      'contexts': [
        {
          'name': '_actions_on_google_',
          'parameters': {
            'number': '1111111111111111',
            'number.original': '1111111111111111'
          },
          'lifespan': 99
        },
        {
          'name': 'google_assistant_input_type_voice',
          'parameters': {
            'number': '1111111111111111',
            'number.original': '1111111111111111'
          },
          'lifespan': 0
        },
        {
          'name': 'actions_capability_audio_output',
          'parameters': {
            'number': '1111111111111111',
            'number.original': '1111111111111111'
          },
          'lifespan': 0
        },
        {
          'name': 'defaultwelcomeintent-followup',
          'parameters': {
            'number': '1111111111111111',
            'number.original': '1111111111111111'
          },
          'lifespan': 1
        }
      ],
      'metadata': {
        'matchedParameters': [
          {
            'dataType': '@sys.number',
            'name': 'number',
            'value': '$number',
            'isList': false
          }
        ],
        'intentName': 'input.number',
        'intentId': '3131ff84-d308-4b87-83cb-89253b106b3a',
        'webhookUsed': 'true',
        'webhookForSlotFillingUsed': 'false',
        'nluResponseTime': 39
      },
      'fulfillment': {
        'speech': '',
        'messages': [
          {
            'type': 0,
            'speech': ''
          }
        ]
      },
      'score': 1
    },
    'status': {
      'code': 200,
      'errorType': 'success'
    },
    'sessionId': '1509389503392'
  }
}

const REDACTED_GOOGLE_IN = {
  'dashbot_timestamp': 1509389508277,
  'request_body': {
    'originalRequest': {
      'source': 'google',
      'version': '2',
      'data': {
        'isInSandbox': true,
        'surface': {
          'capabilities': [
            {
              'name': 'actions.capability.AUDIO_OUTPUT'
            }
          ]
        },
        'inputs': [
          {
            'rawInputs': [
              {
                'query': 'CREDIT_CARD_NUMBER',
                'inputType': 'VOICE'
              }
            ],
            'arguments': [
              {
                'rawText': 'CREDIT_CARD_NUMBER',
                'textValue': 'CREDIT_CARD_NUMBER',
                'name': 'text'
              }
            ],
            'intent': 'actions.intent.TEXT'
          }
        ],
        'user': {
          'locale': 'en-US',
          'userId': 'ABwppHGgPBN4EyaYddw4yEQjZV-eGsXEMCBs9UPwFw3gY1RbVH_fTkjtBUrl_DX1YLS8ZabzKF7wdel58A'
        },
        'conversation': {
          'conversationId': '1509389503392',
          'type': 'ACTIVE',
          'conversationToken': '[\'_actions_on_google_\',\'defaultwelcomeintent-followup\']'
        },
        'availableSurfaces': [
          {
            'capabilities': [
              {
                'name': 'actions.capability.AUDIO_OUTPUT'
              },
              {
                'name': 'actions.capability.SCREEN_OUTPUT'
              }
            ]
          }
        ]
      }
    },
    'id': 'afbb42e0-33d7-40e1-a15c-b61e01cf1dec',
    'timestamp': '2017-10-30T18:51:48.219Z',
    'lang': 'en-us',
    'result': {
      'source': 'agent',
      'resolvedQuery': 'CREDIT_CARD_NUMBER',
      'speech': '',
      'action': 'input.number',
      'actionIncomplete': false,
      'parameters': {
        'number': 'CREDIT_CARD_NUMBER'
      },
      'contexts': [
        {
          'name': '_actions_on_google_',
          'parameters': {
            'number': 'CREDIT_CARD_NUMBER',
            'number.original': 'CREDIT_CARD_NUMBER'
          },
          'lifespan': 99
        },
        {
          'name': 'google_assistant_input_type_voice',
          'parameters': {
            'number': 'CREDIT_CARD_NUMBER',
            'number.original': 'CREDIT_CARD_NUMBER'
          },
          'lifespan': 0
        },
        {
          'name': 'actions_capability_audio_output',
          'parameters': {
            'number': 'CREDIT_CARD_NUMBER',
            'number.original': 'CREDIT_CARD_NUMBER'
          },
          'lifespan': 0
        },
        {
          'name': 'defaultwelcomeintent-followup',
          'parameters': {
            'number': 'CREDIT_CARD_NUMBER',
            'number.original': 'CREDIT_CARD_NUMBER'
          },
          'lifespan': 1
        }
      ],
      'metadata': {
        'matchedParameters': [
          {
            'dataType': '@sys.number',
            'name': 'number',
            'value': '$number',
            'isList': false
          }
        ],
        'intentName': 'input.number',
        'intentId': '3131ff84-d308-4b87-83cb-89253b106b3a',
        'webhookUsed': 'true',
        'webhookForSlotFillingUsed': 'false',
        'nluResponseTime': 39
      },
      'fulfillment': {
        'speech': '',
        'messages': [
          {
            'type': 0,
            'speech': ''
          }
        ]
      },
      'score': 1
    },
    'status': {
      'code': 200,
      'errorType': 'success'
    },
    'sessionId': '1509389503392'
  }
}

const GOOGLE_EXAMPLE_OUT = {
  'dashbot_timestamp': 1509403000747,
  'request_body': {
    'originalRequest': {
      'source': 'google',
      'version': '2',
      'data': {
        'isInSandbox': true,
        'surface': {
          'capabilities': [
            {
              'name': 'actions.capability.AUDIO_OUTPUT'
            }
          ]
        },
        'inputs': [
          {
            'rawInputs': [
              {
                'query': '2222222222222222',
                'inputType': 'VOICE'
              }
            ],
            'arguments': [
              {
                'rawText': '2222222222222222',
                'textValue': '2222222222222222',
                'name': 'text'
              }
            ],
            'intent': 'actions.intent.TEXT'
          }
        ],
        'user': {
          'locale': 'en-US',
          'userId': 'ABwppHGgPBN4EyaYddw4yEQjZV-eGsXEMCBs9UPwFw3gY1RbVH_fTkjtBUrl_DX1YLS8ZabzKF7wdel58A'
        },
        'conversation': {
          'conversationId': '1509402994514',
          'type': 'ACTIVE',
          'conversationToken': '[\'_actions_on_google_\',\'defaultwelcomeintent-followup\']'
        },
        'availableSurfaces': [
          {
            'capabilities': [
              {
                'name': 'actions.capability.AUDIO_OUTPUT'
              },
              {
                'name': 'actions.capability.SCREEN_OUTPUT'
              }
            ]
          }
        ]
      }
    },
    'id': '5776e22222222222222225-6cf1-454f-8545-e043348219ad',
    'timestamp': '2017-10-30T22:36:40.495Z',
    'lang': 'en-us',
    'result': {
      'source': 'agent',
      'resolvedQuery': '2222222222222222',
      'speech': '',
      'action': 'input.number',
      'actionIncomplete': false,
      'parameters': {
        'number': '2222222222222222'
      },
      'contexts': [
        {
          'name': '_actions_on_google_',
          'parameters': {
            'number': '2222222222222222',
            'number.original': '2222222222222222'
          },
          'lifespan': 99
        },
        {
          'name': 'google_assistant_input_type_voice',
          'parameters': {
            'number': '2222222222222222',
            'number.original': '2222222222222222'
          },
          'lifespan': 0
        },
        {
          'name': 'actions_capability_audio_output',
          'parameters': {
            'number': '2222222222222222',
            'number.original': '2222222222222222'
          },
          'lifespan': 0
        },
        {
          'name': 'defaultwelcomeintent-followup',
          'parameters': {
            'number': '2222222222222222',
            'number.original': '2222222222222222'
          },
          'lifespan': 1
        }
      ],
      'metadata': {
        'matchedParameters': [
          {
            'dataType': '@sys.number',
            'name': 'number',
            'value': '$number',
            'isList': false
          }
        ],
        'intentName': 'input.number',
        'intentId': '3131ff84-d308-4b87-83cb-89253b106b3a',
        'webhookUsed': 'true',
        'webhookForSlotFillingUsed': 'false',
        'nluResponseTime': 53
      },
      'fulfillment': {
        'speech': '',
        'messages': [
          {
            'type': 0,
            'speech': ''
          }
        ]
      },
      'score': 1
    },
    'status': {
      'code': 200,
      'errorType': 'success'
    },
    'sessionId': '1509402994514'
  },
  'message': {
    'speech': 'You said a 2222222222222222',
    'contextOut': [],
    'data': {
      'google': {
        'expectUserResponse': false,
        'isSsml': false,
        'noInputPrompts': []
      }
    }
  }
}

const REDACTED_GOOGLE_OUT = {
  'dashbot_timestamp': 1509403000747,
  'request_body': {
    'originalRequest': {
      'source': 'google',
      'version': '2',
      'data': {
        'isInSandbox': true,
        'surface': {
          'capabilities': [
            {
              'name': 'actions.capability.AUDIO_OUTPUT'
            }
          ]
        },
        'inputs': [
          {
            'rawInputs': [
              {
                'query': 'CREDIT_CARD_NUMBER',
                'inputType': 'VOICE'
              }
            ],
            'arguments': [
              {
                'rawText': 'CREDIT_CARD_NUMBER',
                'textValue': 'CREDIT_CARD_NUMBER',
                'name': 'text'
              }
            ],
            'intent': 'actions.intent.TEXT'
          }
        ],
        'user': {
          'locale': 'en-US',
          'userId': 'ABwppHGgPBN4EyaYddw4yEQjZV-eGsXEMCBs9UPwFw3gY1RbVH_fTkjtBUrl_DX1YLS8ZabzKF7wdel58A'
        },
        'conversation': {
          'conversationId': '1509402994514',
          'type': 'ACTIVE',
          'conversationToken': '[\'_actions_on_google_\',\'defaultwelcomeintent-followup\']'
        },
        'availableSurfaces': [
          {
            'capabilities': [
              {
                'name': 'actions.capability.AUDIO_OUTPUT'
              },
              {
                'name': 'actions.capability.SCREEN_OUTPUT'
              }
            ]
          }
        ]
      }
    },
    'id': '5776e22222222222222225-6cf1-454f-8545-e043348219ad',
    'timestamp': '2017-10-30T22:36:40.495Z',
    'lang': 'en-us',
    'result': {
      'source': 'agent',
      'resolvedQuery': 'CREDIT_CARD_NUMBER',
      'speech': '',
      'action': 'input.number',
      'actionIncomplete': false,
      'parameters': {
        'number': 'CREDIT_CARD_NUMBER'
      },
      'contexts': [
        {
          'name': '_actions_on_google_',
          'parameters': {
            'number': 'CREDIT_CARD_NUMBER',
            'number.original': 'CREDIT_CARD_NUMBER'
          },
          'lifespan': 99
        },
        {
          'name': 'google_assistant_input_type_voice',
          'parameters': {
            'number': 'CREDIT_CARD_NUMBER',
            'number.original': 'CREDIT_CARD_NUMBER'
          },
          'lifespan': 0
        },
        {
          'name': 'actions_capability_audio_output',
          'parameters': {
            'number': 'CREDIT_CARD_NUMBER',
            'number.original': 'CREDIT_CARD_NUMBER'
          },
          'lifespan': 0
        },
        {
          'name': 'defaultwelcomeintent-followup',
          'parameters': {
            'number': 'CREDIT_CARD_NUMBER',
            'number.original': 'CREDIT_CARD_NUMBER'
          },
          'lifespan': 1
        }
      ],
      'metadata': {
        'matchedParameters': [
          {
            'dataType': '@sys.number',
            'name': 'number',
            'value': '$number',
            'isList': false
          }
        ],
        'intentName': 'input.number',
        'intentId': '3131ff84-d308-4b87-83cb-89253b106b3a',
        'webhookUsed': 'true',
        'webhookForSlotFillingUsed': 'false',
        'nluResponseTime': 53
      },
      'fulfillment': {
        'speech': '',
        'messages': [
          {
            'type': 0,
            'speech': ''
          }
        ]
      },
      'score': 1
    },
    'status': {
      'code': 200,
      'errorType': 'success'
    },
    'sessionId': '1509402994514'
  },
  'message': {
    'speech': 'You said a 2222222222222222',
    'contextOut': [],
    'data': {
      'google': {
        'expectUserResponse': false,
        'isSsml': false,
        'noInputPrompts': []
      }
    }
  }
}

const FACEBOOK_IN = {
  'object': 'page',
  'entry': [
    {
      'id': '1761187137541529',
      'time': 1509404264269,
      'messaging': [
        {
          'sender': {
            'id': '967295313370594'
          },
          'recipient': {
            'id': '1761187137541529'
          },
          'timestamp': 1509404263587,
          'message': {
            'mid': 'mid.$cAAZBymTGuo5loMaMo1fb4FEBBGHr',
            'seq': 16231,
            'text': '2222222222222222'
          }
        }
      ]
    }
  ]
}

const REDACTED_FACEBOOK_IN = {
  'object': 'page',
  'entry': [
    {
      'id': '1761187137541529',
      'time': 1509404264269,
      'messaging': [
        {
          'sender': {
            'id': '967295313370594'
          },
          'recipient': {
            'id': '1761187137541529'
          },
          'timestamp': 1509404263587,
          'message': {
            'mid': 'mid.$cAAZBymTGuo5loMaMo1fb4FEBBGHr',
            'seq': 16231,
            'text': 'CREDIT_CARD_NUMBER'
          }
        }
      ]
    }
  ]
}

const GENERIC = {
  text: '1111111111111111',
  userId: '1111111111111111'
}

const REDACTED_GENERIC = {
  text: 'CREDIT_CARD_NUMBER',
  userId: '1111111111111111'
}

const LINE_IN = {
  type: 'message',
  source: {
    type: 'user',
    userId: 'U6qwr653uya19w874238'
  },
  message: {
    type: 'text',
    text: '1111111111111111'
  }
}

const REDACTED_LINE_IN = {
  type: 'message',
  source: {
    type: 'user',
    userId: 'U6qwr653uya19w874238'
  },
  message: {
    type: 'text',
    text: 'CREDIT_CARD_NUMBER'
  }
}

const redactor = require('../redactor')

describe('Redactor', function() {
  describe('.redact()', function() {
    it('should remove credit card from google call', function() {
      const redacted = redactor.redact(GOOGLE_EXAMPLE_IN)
      assertObject.equal(redacted, REDACTED_GOOGLE_IN)
    })
    it('should remove credit card from incoming part of google call', function() {
      const redacted = redactor.redact(GOOGLE_EXAMPLE_OUT)
      assertObject.equal(redacted, REDACTED_GOOGLE_OUT)
    })
    it('should remove credit card from facebook in', function() {
      const redacted = redactor.redact(FACEBOOK_IN)
      assertObject.equal(redacted, REDACTED_FACEBOOK_IN)
    })
    it('should remove credit card from generic in', function() {
      const redacted = redactor.redact(GENERIC)
      assertObject.equal(redacted, REDACTED_GENERIC)
    })
    it('should remove credit card from line in', function() {
      const redacted = redactor.redact(LINE_IN)
      assertObject.equal(redacted, REDACTED_LINE_IN)
    })
  })
})
