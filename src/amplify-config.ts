import { ResourcesConfig } from '@aws-amplify/core';

const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-1_gaX6b4Idb',
      userPoolClientId: '1q1g3dq456j4jgg2iqvt15o55i',
    },
  },
};

export default amplifyConfig; 