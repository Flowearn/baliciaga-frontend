import boto3
import json

client = boto3.client('cognito-idp', region_name='ap-southeast-1')

try:
    response = client.admin_initiate_auth(
        UserPoolId='ap-southeast-1_N72jBBIzH',
        ClientId='3n9so3j4rlh21mebhjo39nperk',
        AuthFlow='ADMIN_NO_SRP_AUTH',
        AuthParameters={
            'USERNAME': 'troyzhy@gmail.com',
            'PASSWORD': 'Zhehkd.12351'
        }
    )
    print("Authentication successful\!")
    print(f"IdToken present: {'IdToken' in response.get('AuthenticationResult', {})}")
except Exception as e:
    print(f"Authentication failed: {str(e)}")
    print(f"Error type: {type(e).__name__}")
