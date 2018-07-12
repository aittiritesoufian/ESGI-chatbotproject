var builder = require('botbuilder');
var restify = require('restify');
var SpaceXAPI = require('SpaceX-API-Wrapper');
var https = require('https');
require('./spaceXInfo.js')();

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
	if(message.membersAdded) {
		message.membersAdded.forEach(function(identity){
			if(identity.id === message.address.bot.id){
				bot.beginDialog(message.address, '/');
			}
		})
	}
});
//Menu items
var menuItems = {
	"Next Launch" :{
		item: "next"
	},
	"Last Launch with image" :{
		item: "last"
	},
	"Last Launch Carousel" :{
		item: "lastCarousel"
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
	},
    function(session,results) {
        session.send(results);
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

bot.dialog('next', [
    function(session){
        https.get('https://api.spacexdata.com/v2/launches/next', (resp) => {
          let data = '';

          resp.on('data', (chunk) => {
            data += chunk;
          });

          resp.on('end', () => {
            data = JSON.parse(data);
					var adaptativeCard = getInfoSpaceX(data, "next");
            session.endDialogWithResult(adaptativeCard);
          });

        });
    }
]);

bot.dialog('last', [
    function(session){
        https.get('https://api.spacexdata.com/v2/launches/latest', (resp) => {
          var data = '';

          resp.on('data', (chunk) => {
            data += chunk;
          });

          resp.on('end', () => {
            data = JSON.parse(data);
            var adaptativeCard = getInfoSpaceX(data, "latest");
            session.endDialogWithResult(adaptativeCard);
          });

        }).on("error", (err) => {
          session.endDialogWithResult("Error: " + err.message);
        });
    }
]);

bot.dialog('lastCarousel', [
    function(session){
        https.get('https://api.spacexdata.com/v2/launches/upcoming', (resp) => {
          var data = '';

          resp.on('data', (chunk) => {
            data += chunk;
          });

          resp.on('end', () => {
            data = JSON.parse(data);
            var attachments = [];
            data.forEach(function(item){
            	// session.send(JSON.stringify(item));
							attachments.push(carrouselCard(item));
						});

            var adaptativeCard = getInfoSpaceX(data, "carousel", attachments);
            session.endDialogWithResult(adaptativeCard);
          });

        }).on("error", (err) => {
          session.endDialogWithResult("Error: " + err.message);
        });
    }
]);

/*function buildAboutCard(data, session) {
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
}*/