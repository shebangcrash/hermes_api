# Hermes API
The Hermes API allows external resources to submit and retrieve short messages.

A configuration file defines several constraints for the API (see next section).

A message consists of a sender, recipient, and msg field. A date field can also be
supplied to eventually allow for messages to be queued, retrieved, and sent at a future date.
If no date is supplied, the current time is stored alongside the incoming message.

Querying messages will return a total number of messages up to maxMsgs. If the
total number of messages found is greater than maxMsgs, all messages within the last
maxDays will be returned instead. A specific sender and recipient can also be 
supplied, limiting the messages returned to those users.


### Setup and Execution:
The Hermes API can be started by running the following command in the root
level of the project:
```
npm install
node messenger.js
```
If running locally, the host is "127.0.0.1" or "localhost"

---
## Configuration
Several configuration options can be altered in config/messenger_config.json

### Default options:
```
{
  "port": 3000,
  "persistenceMode": "local",
  "maxMsgs": 100,
  "maxDays": 30,
  "maxMsgLength": 120
  "msgFile": "messages/messages.json",
}
```
| Key | Description |
| --- | ----------- |
| port | The port where the application can be reached |
| persistenceMode | Allow future implementation of database backend, instead of local json file |
| maxMsgs | The maximum number of messages that can be returned |
| maxDays | The maximum number of days messages are returned for, if total message count is less than maxMsgs |
| maxMsgLength | The maximum length of message that will be accepted by the API |
| msgFile | The filename where messages are stored and retrieved in "local" persistenceMode |

---
## Testing
Testing resources are located in testing/postman and testing/shell.

A Postman collection and environment have been included to facilitate exploration
and testing of the API. 

There are also .sh files for each request. These query the user for all necessary 
parameters and then execute the API request via curl.
Note: the shell scripts are all pointed to the default host/port of 127.0.0.1:3000 

See the Endpoints section below for specifics.

---
## Endpoints
default host/port is "127.0.0.1:3000"

#### GET Status
| HTTP Method | URL |
| ----------- | --- |
| GET         | {{host}}/status |

| Response Code | Description                   |
| ------------- | ----------------------------- |
| 200           | Application is alive and well	|


#### GET Messages
| HTTP Method | URL               |
| ----------- | ----------------- |
| GET         | {{host}}/messages |

| Query Parameters (Optional) | type   |
| --------------------------- | ------ |
| sender                      | string |
| recipient                   | string |

| Response Code | Description                     |
| ------------- | ------------------------------- |
| 200           | Successfully retrieved messages |
| 500           | Failed to retrieve messages     |


#### POST Messages
| HTTP Method | URL               |
| ----------- | ----------------- |
| POST        | {{host}}/messages |

| Body Parameters (Required) | type   |
| -------------------------- | ------ |
| sender                     | string |
| recipient                  | string |
| msg                        | string |

| Body Parameters (Optional) | type   |
| -------------------------- | -----  |
| date                       | string |

| Response Code | Description                                                            |
| ------------- | ---------------------------------------------------------------------- |
| 201           | Successfully retrieved messages                                        |
| 400           | Message does not contain all necessary fields (sender, recipient, msg) |
| 400           | Message exceeds maxMsgLength                                           |
| 400           | Message date format incorrect (should be yyyy-mm-ddThh:mm:ss)          |
| 500           | Failed to store incoming message                                       |

#### Example POST requests:
```
{
	"date": "2021-09-30T12:00:00",
	"sender": "calvin",
	"recipient": "hobbes",
	"msg": "things are never quite as scary when you've got a best friend"
}
{
	"date": "1939-08-25T00:00:00",
	"sender": "dorothy",
	"recipient": "toto",
	"msg": "toto, i have a feeling we're not in Kansas anymore"
}
{
	"sender": "hamlet",
	"recipient": "also hamlet",
	"msg": "to be, or not to be"
}

```

---
## Future Improvements
-Database backend support
-Additional endpoint for future messages