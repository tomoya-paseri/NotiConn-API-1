mkdir -p ~/.aws
touch ~/.aws/credentials
echo "[$1]\naws_access_key_id = $AWS_ACCESS_KEY_ID\naws_secret_access_key = $AWS_SECRET_ACCESS_KEY" > ~/.aws/credentials
