const AWS = require('aws-sdk');

const cognito = new AWS.CognitoIdentityServiceProvider({
    region: 'ap-southeast-1'
});

const params = {
    AuthFlow: 'USER_SRP_AUTH',
    ClientId: '3n9so3j4rlh21mebhjo39nperk',
    UserPoolId: 'ap-southeast-1_N72jBBIzH',
    AuthParameters: {
        USERNAME: 'troyzhy@gmail.com',
        PASSWORD: 'Zhehkd.12351'
    }
};

cognito.initiateAuth(params, (err, data) => {
    if (err) {
        console.log('Authentication failed:', err.message);
    } else {
        console.log('Authentication successful\!');
        console.log('Session:', data.Session ? 'Present' : 'Not present');
        console.log('ChallengeName:', data.ChallengeName);
    }
});
