echo "Requesting messages for a specific sender + recipient"

echo "Please input the sender:"
read sender

echo "Please input the recipient:"
read recipient

curl --location --request GET '127.0.0.1:3000/messages?sender='${sender}'&recipient='${recipient}''
