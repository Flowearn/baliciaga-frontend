#!/bin/bash

# Deploy script for Baliciaga frontend to dev environment

# Build the project
echo "Building frontend for dev environment..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "Build failed - dist directory not found"
    exit 1
fi

# Create S3 bucket if it doesn't exist
BUCKET_NAME="baliciaga-frontend-dev"
REGION="ap-southeast-1"

echo "Checking if S3 bucket exists..."
if ! aws s3 ls "s3://${BUCKET_NAME}" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "S3 bucket ${BUCKET_NAME} already exists"
else
    echo "Creating S3 bucket ${BUCKET_NAME}..."
    aws s3 mb "s3://${BUCKET_NAME}" --region ${REGION}
    
    # Enable static website hosting
    aws s3 website "s3://${BUCKET_NAME}" --index-document index.html --error-document index.html
    
    # Set bucket policy for public read access
    cat > /tmp/bucket-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
        }
    ]
}
EOF
    
    aws s3api put-bucket-policy --bucket ${BUCKET_NAME} --policy file:///tmp/bucket-policy.json
    rm /tmp/bucket-policy.json
fi

# Upload files to S3
echo "Uploading files to S3..."
aws s3 sync dist/ "s3://${BUCKET_NAME}/" --delete --region ${REGION}

# Get the website URL
WEBSITE_URL="http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"

echo ""
echo "✅ Deployment complete!"
echo "🌐 Website URL: ${WEBSITE_URL}"
echo ""