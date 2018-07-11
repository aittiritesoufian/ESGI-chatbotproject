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
                            "text": (data.details ? data.details : "(pas d'informations)"),
                            "size": "large"
                          },
                          {
                            "type": "TextBlock",
                            "text": "Date de lancement : "+(data.launch_date_local ? data.launch_date_local : "(pas d'informations)")
                          },
                          {
                            "type": "TextBlock",
                            "text": "Site de lancement : "+(data.launch_site.site_name_long ? data.launch_site.site_name_long : "(pas d'informations)"),
                            "separation": "none"
                          }
                        ],
                        "actions": [
                          {
                            "type": "Action.OpenUrl",
                            "url": (data.links.article_link ? data.links.article_link : "(pas d'informations)"),
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
                "text": "",
                "attachmentLayout": "carousel",
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
										"type": "TextBlock",
										"text": "Launch "+(data.launch_success ? "Succes" : "Fail"),
										"color": data.launch_success ? "good" : "attention",
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
											}
										]
									}
								]
							}
						],
						"actions": [
						  {
						    "type": "Action.ShowCard",
						    "title": "Rocket Information",
						    "card": {
						    	"type": "AdaptiveCard",
						    	"body": [
						    		{
										"type": "Container",
										"items": [
											{
												"type": "FactSet",
												"facts": [
													{
														"title": "Rocket name :",
														"value": data.rocket.rocket_type+"/"+data.rocket.rocket_name
													},
													{
														"title": "Core Serial :",
														"value": data.rocket.first_stage.cores[0].core_serial
													},
													{
														"title": "Nombre de vols :",
														"value": data.rocket.first_stage.cores[0].flight
													},
													{
														"title": "Blocks :",
														"value": data.rocket.first_stage.cores[0].block
													}
												]
											}
										]
									}
						    	]
						    }
						  },
						  {
						    "type": "Action.ShowCard",
						    "title": "Payloads",
						    "card": {
						    	"type": "AdaptiveCard",
						    	"body": [
						    		{
										"type": "Container",
										"items": [
											{
												"type": "FactSet",
												"facts": [
													{
														"title": "Payloads ID :",
														"value": data.rocket.second_stage.payloads[0].payload_id
													},
													{
														"title": "CAP Serial :",
														"value": data.rocket.second_stage.payloads[0].cap_serial
													},
													{
														"title": "Customer :",
														"value": data.rocket.second_stage.payloads[0].customers[0]
													}
												]
											}
										]
									}
						    	]
						    }
						  },
						  {
						    "type": "Action.ShowCard",
						    "title": "Reuse",
						    "card": {
						    	"type": "AdaptiveCard",
						    	"body": [
						    		{
										"type": "Container",
										"items": [
											{
												"type": "FactSet",
												"facts": [
													{
														"title": "Core :",
														"value": data.reuse.core ? "Yes" : "No"
													},
													{
														"title": "Side Core 1 :",
														"value": data.reuse.side_core1 ? "Yes" : "No"
													},
													{
														"title": "Side Core 2 :",
														"value": data.reuse.side_core2 ? "Yes" : "No"
													},
													{
														"title": "Fairings :",
														"value": data.reuse.fairings ? "Yes" : "No"
													},
													{
														"title": "Capsule :",
														"value": data.reuse.capsule ? "Yes" : "No"
													},
												]
											}
										]
									}
						    	]
						    }
						  },
                          {
                            "type": "Action.OpenUrl",
                            "url": data.links.video_link,
                            "title": "Launch cast"
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
			  attachments.push({
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
														"url": (item.links.mission_patch_small ? item.links.mission_patch_small : ""),
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
														"text": "Numéro de lancement : "+(item.flight_number ? item.flight_number : "(pas d'informations)"),
														"weight": "bolder",
														"wrap": true
													},
													{
														"type": "TextBlock",
														"text": "Mission: "+(item.mission_name ? item.mission_name : "(pas d'informations)"),
														"wrap": true
													},
													{
														"type": "TextBlock",
														"text": "Année de lancement: "+(item.launch_year ? item.launch_year : "(pas d'informations)"),
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
										"text": (item.details ? item.details : "(pas d'informations)"),
										"wrap": true
									},
									{
										"type": "FactSet",
										"facts": [
											{
												"title": "Date de lancement : ",
												"value": (item.launch_date_local ? item.launch_date_local : "(pas d'informations)")
											},
											{
												"title": "Site de lancement : ",
												"value": (item.launch_site.site_name_long ? item.launch_site.site_name_long : "(pas d'informations)")
											}
										]
									}
								]
							}
						],
						"actions": [
							{
                            "type": "Action.OpenUrl",
                            "url": (item.links.article_link ? item.links.article_link : "(pas d'informations)"),
                            "title": "Learn More"
                          }
						]
                      }
			  });
			});

            var adaptativeCard = {
                "type": "message",
                "text": "Numéro de lancement : "+data.flight_number,
                "attachmentLayout": "carousel",
                "attachments": attachments
                
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