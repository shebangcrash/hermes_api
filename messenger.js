const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {writeFile, readFile} = require ('fs/promises')

const msgConfig = require('./config/messenger_config.json')
const port = msgConfig['port'];
app.listen(port);
app.use(bodyParser.json({extended: true}));

console.log('Hermes messenger API listening on localhost:' + port)
dumpConfig(msgConfig);

// let clients know the API is alive (or not)
app.get('/status', (req, res) => {
	res.status(200).json({'status':'alive and well'});
});

// get all messages (either last 30 days, or up to 100 total)
// can optionally specify sender / recipient in req
app.get('/messages', async (req, res) => {
	var messages = await getMessages(msgConfig['msgFile']);
	if (messages) {
		console.log(`found ${messages.length} messages`)
		if (req.query.sender || req.query.recipient) {
			console.log(`limiting messages to sender ${req.query.sender} and recipient ${req.query.recipient}`)
			messages = messages
				.filter((msg) => msg.sender === req.query.sender)
				.filter((msg) => msg.recipient === req.query.recipient);
		}
		if (messages.length <= msgConfig['maxMsgs']) {
			console.log(`fewer than ${msgConfig['maxMsgs']} messages requested; sending them all`)
			res.status(200).send(messages);
		} else {
			// filter all future messages, then all messages from before maxDays ago
			console.log(`over ${msgConfig['maxMsgs']} messages; limiting to last ${msgConfig['maxDays']} days`)
			const dateBoundry = new Date()
			console.log(`filtering messages from date after ${dateBoundry}`)
			messages = messages.filter((msg) => new Date(msg.date) <= dateBoundry);
			dateBoundry.setDate(dateBoundry.getDate() - msgConfig['maxDays']);
			console.log(`filtering messages from date before ${dateBoundry}`)
			messages = messages.filter((msg) => new Date(msg.date) >= dateBoundry);
			res.status(200).send(messages);
		}
	} else {
		res.status(500).send({'error':'could not load messages'});
	}
});

// post a text message from sender A to recipient B
app.post('/messages', async (req, res) => {
	if (!req.body || !req.body.sender || !req.body.recipient || !req.body.msg) {
		res.status(400).send({'error':'please specify sender, recipient, and msg in json request'})
	} else if (req.body.msg.length > msgConfig['maxMsgLength']) {
		res.status(400).send({'error':'please submit a msg smaller than length ' + msgConfig['maxMsgLength']})
	} else {
		// if date is supplied, make sure format matches: 2020-10-31T12:00:00
		if (req.body.date) {
 			const rightFormat = (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(req.body.date));
			if (!rightFormat) {
				res.status(400).send({'error':'please format date as yyyy-mm-ddThh:mm:ss'})
			}
		} else { 
			console.log('no date supplied for incoming message; saving with current time')
			req.body.date = await getLocalDate();
		}
		try {
			var success = await storeMessage(req.body, msgConfig['msgFile']);
			if (success) {
				console.log(`stored message ${JSON.stringify(req.body)}`)
				res.status(201).send();
			} else {
				console.log('storeMessage() did not return success');
				res.status(500).send();
			}
		} catch(err) {
			console.log(err)
			res.status(500).send(err);
		}
	}
});

// open messages persistence layer, read into internal json object
async function getMessages(msgFile) {
	try {
		var messages = await readFile(msgFile);
		if (messages) {
			messages = JSON.parse(messages);
			return messages
		} else {
			console.log('failed to read message file')
			return
		}
	} catch(err) {
		console.log(err)
		return
	}
};

// getMessages, then append incoming message
async function storeMessage(msgReq, msgFile) {
	var messages = await getMessages(msgFile);
	if (messages) {
		messages.push(msgReq);
		msgJson = JSON.stringify(messages);
		await writeFile(msgFile, msgJson);
		return true;
	} else {
		console.log('failed to getMessages()')
		return false;
	}
};

// display app configuration on launch
function dumpConfig(msgConfig) {
	console.log("Running with the following configuration")
	Object.keys(msgConfig).forEach((key) => console.log(key + ': ' + msgConfig[key]))
};

// do terrible things to get a local datetime representation
function getLocalDate() {
	var utcDate = new Date();
	var shift = utcDate.setTime(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60 * 1000));
	var localDateStr = JSON.stringify(new Date(shift));
	var localDate = localDateStr.substring(1,20);
	return localDate;
};
