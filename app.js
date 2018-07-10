var builder = require('botbuilder');
var restify = require('restify');
const SpaceXAPI = require('SpaceX-API-Wrapper');

let SpaceX = new SpaceXAPI();

//server
var server = restify.createServer();
server.listen(process.env.PORT || 3978, function(){
    console.log("%s listening to %s", server.name, server.url);
})

//Connector
var connector = new builder.ChatConnector({
    appId : process.env.MICROSOFT_APP_ID,
    appPassword : process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

var inMemoryStorage = new builder.MemoryBotStorage();
var bot = new builder.UniversalBot(connector, [
	function(session){
		session.send('Hello je suis le bot SpaceX');
		session.beginDialog('menu');
	}
]).set('storage', inMemoryStorage);

bot.on('conversationUpdate', function(message){
	if(message.memberAdded) {
		message.memberAdded.forEach(function(identity){
			if(identity.id === message.address.bot.id){
				session.beginDialog(Message.address, '/')
			}
		})
	}
});
//Menu items
var menuItems = {
	"Action1" :{
		item: "dialog1"
	},
	"Action2" :{
		item: "aboutDialog"
	},
	"Action3" :{
		item: "dialog3"
	},
	"Action4" :{
		item: "dialog4"
	},
}

bot.dialog('menu', [
	// Step1
	function(session){
		builder.Prompts.choice(session,
			'Voilà ce que je peux faire pour toi :)',
			menuItems,
			{ listStyle: 3})
	},
	//Step 2
	function(session, result) {
		var choice = result.response.entity;
		session.beginDialog(menuItems[choice].item);
	}
]);

function typing(){
	session.sendTyping();
}

bot.dialog('aboutDialog', [
	function(session) {
		SpaceX.getCompanyInfo(function(err, data){
		    session.send(JSON.stringify(data));
		});
	}
]);

function buildAboutCard(data, session) {
	var adaptiveCard = new builder.Message(session).addAttachment({
		contentType : 'application/vnd.microsoft.card.adaptive',
		content:{
			type: 'adaptiveCard',
			body: [
				{
					type : 'Container',
					Items:[
						{
							type: '',
							text: '',
							weight: '',
							size: ''
						}
					]
				}
			]
		}
	});
}