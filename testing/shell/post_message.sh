echo "Please input the sender:"
read sender

echo "Please input the recipient:"
read recipient

echo "Please input the message:"
read msg

echo "Do you want to schedule this message for a future date? y/n"
read yn

case $yn in
	[yY]* ) getdate=true;;
	[nN]* ) getdate=false;;
esac

if [ $getdate = true ]; then
	echo "Please input the date to send the message in the format yyyy-mm-ddThh:mm:ss"
	read date
	curl --location --request POST '127.0.0.1:3000/messages' \
	--header 'Content-Type: application/json' \
	-d '{
	    "date": "'"${date}"'",
	    "sender": "'"${sender}"'",
	    "recipient": "'"${recipient}"'",
	    "msg": "'"${msg}"'"
		}'
else
	curl --location --request POST '127.0.0.1:3000/messages' \
	--header 'Content-Type: application/json' \
	-d '{
	    "sender": "'"${sender}"'",
	    "recipient": "'"${recipient}"'",
	    "msg": "'"${msg}"'"
		}'
fi

