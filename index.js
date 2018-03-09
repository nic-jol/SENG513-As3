// SERVER

//Express initializes app to be a function handler that you can supply to an HTTP server
var app = require('express')();    // Run right away; import and run
var server = require('http').Server(app);   // the server

// pass HTTP server to initialize a new instance of socket.io
var io = require('socket.io')(server);    // running with server just created

const port = 3000;    // Port constant used throughout

// Users object
var allUsers = {};   // store all the user names & colors
 //key = username; value = color

const colors = ["Aqua", "Blue", "Blue Violet", "Brown", "Coral", "CornflowerBlue", "Crimson", "DarkGoldenRod", "DarkGrey", "DarkGreen", "DarkMagenta", "DeepPink", "Fuschia", "Gold", "LightGreen"]; // 15 elem
const name1 = ["crazy", "docile", "mellow", "hyper", "chipper", "goofy", "haughty", "envious", "cute", "hungry"]; //10 elem
const name2 = ["Squirrel", "Hippo", "Bobcat", "Rhinocerous", "Ibex", "Axolotl", "Dingo", "Hyena", "Capybara", "RockHyrax"];  // 10 elem


//make the server listen on port 3000
server.listen(port, function(){
    console.log('Server running on port ' + port);
});



//When they request this on our server, send index.html
app.get('/', function(req, res){
    // Capital F - not deprecated
    res.sendFile(__dirname + '/index.html');
});

// Listen on the connection event for incoming sockets and I log it to the console
/*
io.on('connection', function(socket){
    
  socket.on('chat message', function(msg){
    // Add time stamp

    // Add nickname
    
      
    io.emit('chat message', msg);
    
  });
});
*/
// Event: connection
io.on('connection', function(socket) {
    console.log("user connected");
    
    let user = {name:"", color:""};

    // Check cookies for username and color
    if (false) {

    } 
    // Or randomly generate
    else {
        // Generate name
        let num1 = Math.round(Math.random() * 9);
        let num2 = Math.round(Math.random() * 9);

        console.log("Num1: " + num1);
        console.log("Num2: " + num2);

        let genName = "" + name1[num1] + name2[num2];

        // Generate color
        let num3 = Math.round(Math.random() * 14);

        console.log("Num3: " + num3);

        let genColor = colors[num3];

        // Add to this instance's object
        user["name"] = genName;
        user["color"] = genColor;

        // Add name to global users array
        allUsers[genName] = genColor;

        //console.log(genName);
        //console.log(genColor);
        console.log("New User: ");
        console.log(user);
        //console.log(allUsers);


        // Create cookie

    }


    socket.on('message', (msg) => {
        // timestamp
        let fullDate = Date().split(" ");
        let withSeconds = fullDate[4].split(':');
        let rightTime = withSeconds[0] + ":" + withSeconds[1];

        // Parse message
    
    
        // Change nickname or change in color requested/nick <new nickname>
        let possibleRequest = msg.split(" ");

        if (possibleRequest[0].trim() == "/nick") {
            console.log("change name request");
            let oldname = user["name"];
            // Todo: check array length
            user["name"] = possibleRequest[1].trim();
            console.log(user);

            io.emit('message', (rightTime + " " + oldname + " changed their name to " + user["name"]) + ".");
        }
        else if (possibleRequest[0].trim() == "/nickcolor") {
            console.log("change color request");
            user["color"] = possibleRequest[1].trim();
            console.log(user);

            // TODO: separate self and others
            io.emit('message', (rightTime + " " + user["name"] + " changed color."));
        } 
        else {
            console.log(`message ${msg}`);
            io.emit('message', (rightTime + " " + user["name"]+ ": " + msg));
        }
    });

    socket.on('disconnect', () => {
        console.log("user disconnected");

        // use io since server - emitting from server (io)
        io.emit('message', 'user disconnected');
    })
    
});
    
/*    
    // Send to all
    console.log('a user connected');
    
    // Create object for each user
    
    socket.on('disconnect', function(){
        // Send to all
        console.log('user disconnected');
    });
});
*/
