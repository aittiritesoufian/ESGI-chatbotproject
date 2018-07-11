var builder = require('botbuilder');
var restify = require('restify');
var SpaceXAPI = require('SpaceX-API-Wrapper');
var https = require('https');

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
				session.beginDialog(Message.address, '/')
			}
		})
	}
});
//Menu items
var menuItems = {
	"Next Launch" :{
		item: "next"
	},
	"Last Launch" :{
		item: "last"
	},
	"Last Launch with image" :{
		item: "last2"
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
	        var adaptativeCard = {
                "type": "message",
                "text": "Numéro de lancement : "+data.flight_number+" Mission: "+data.mission_name,
                "attachments": [
                    {
                      "contentType": "application/vnd.microsoft.card.adaptive",
                      "content": {
                        "type": "AdaptiveCard",
                        "version": "1.0",
                        "body": [
                          {
                            "type": "TextBlock",
                            "text": (data.details ? data.details : "< pas d'information >"),
                            "size": "large"
                          },
                          {
                            "type": "TextBlock",
                            "text": "Date de lancement : "+(data.launch_date_local ? data.launch_date_local : "< pas d'information >")
                          },
                          {
                            "type": "TextBlock",
                            "text": "Site de lancement : "+(data.launch_site.site_name_long ? data.launch_site.site_name_long : "< pas d'information >"),
                            "separation": "none"
                          }
                        ],
                        "actions": [
                          {
                            "type": "Action.OpenUrl",
                            "url": (data.links.article_link ? data.links.article_link : "< pas d'information >"),
                            "title": "Learn More"
                          }
                        ]
                      }
                    }
                  ]
                
            }
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
            var adaptativeCard = {
                "type": "message",
                "text": "Numéro de lancement : "+data.flight_number,
                "attachments": [
                    {
                      "contentType": "application/vnd.microsoft.card.adaptive",
                      "content": {
                        "type": "AdaptiveCard",
                        "version": "1.0",
                        "body": [
                          {
                            "type": "TextBlock",
                            "text": data.details,
                            "size": "large"
                          },
                          {
                            "type": "TextBlock",
                            "text": "Date de lancement : "+data.launch_date_local,
                          },
                          {
                            "type": "TextBlock",
                            "text": "Site de lancement : "+data.launch_site.site_name_long,
                            "separation": "none"
                          }
                        ],
                        "actions": [
                          {
                            "type": "Action.OpenUrl",
                            "url": data.links.article_link,
                            "title": "Learn More"
                          }
                        ]
                      }
                    }
                  ]
                
            }
            session.endDialogWithResult(adaptativeCard);
          });

        }).on("error", (err) => {
          session.endDialogWithResult("Error: " + err.message);
        });
    }
]);
bot.dialog('last2', [
    function(session){
        https.get('https://api.spacexdata.com/v2/launches/latest', (resp) => {
          var data = '';

          resp.on('data', (chunk) => {
            data += chunk;
          });

          resp.on('end', () => {
            data = JSON.parse(data);
            var adaptativeCard = {
                "type": "message",
                "text": "Numéro de lancement : "+data.flight_number,
                "attachments": [
                    {
                      "contentType": "application/vnd.microsoft.card.adaptive",
                      "content": {
                        "type": "AdaptiveCard",
                        "version": "1.0",
                        "body": [
							{
								"type": "Container",
								"items": [
									{
										"type": "TextBlock",
										"text": "",
										"weight": "bolder",
										"size": "medium"
									},
									{
										"type": "ColumnSet",
										"columns": [
											{
												"type": "Column",
												"width": "auto",
												"items": [
													{
														"type": "Image",
														"url": data.links.mission_patch_small,
														"size": "large",
													}
												]
											},
											{
												"type": "Column",
												"width": "stretch",
												"items": [
													{
														"type": "TextBlock",
														"text": "Numéro de lancement : "+data.flight_number,
														"weight": "bolder",
														"wrap": true
													},
													{
														"type": "TextBlock",
														"text": "Mission: "+data.mission_name,
														"wrap": true
													},
													{
														"type": "TextBlock",
														"text": "Année de lancement: "+data.launch_year,
														"wrap": true
													}
												]
											}
										]
									}
								]
							},
							{
								"type": "Container",
								"items": [
									{
										"type": "TextBlock",
										"text": data.details,
										"wrap": true
									},
									{
										"type": "FactSet",
										"facts": [
											{
												"title": "Date de lancement : ",
												"value": data.launch_date_local
											},
											{
												"title": "Site de lancement : ",
												"value": data.launch_site.site_name_long
											},
											{
												"title": "Rocket :",
												"value": data.rocket.rocket_name
											}
										]
									}
								]
							}
						],
						"actions": [
							{
                            "type": "Action.OpenUrl",
                            "url": data.links.article_link,
                            "title": "Learn More"
                          }
						]
                      }
                    }
                  ]
                
            }
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