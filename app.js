//server
var server = restify.createServer();
server.listen(process.env.PORT, function(){
    console.log("%s listening to %s", server.name, server.url);
})

//Connector
var connector = new builder.ChatConnector({
    appId : process.env.MICROSOFT_APP_ID,
    appPassword : process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

var inMemoryStorage = new builder.MemoryBotStorage();
var bot = new builder.UniversalBot(connector).set('storage', inMemoryStorage);

//Menu items
var menuItems = {
	"Action1" :{
		item: "dialog1"
	},
	"Action2" :{
		item: "dialog2"
	},
	"Action3" :{
		item: "dialog3"
	},
	"Action4" :{
		item: "dialog4"
	},
}