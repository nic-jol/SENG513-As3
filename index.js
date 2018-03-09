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

const colors = ["Aqua", "Blue", "BlueViolet", "Brown", "Coral", "CornflowerBlue", "Crimson", "DarkGoldenRod", "DarkGrey", "DarkGreen", "DarkMagenta", "DeepPink", "Gold", "LightGreen"]; // 14 elem
const name1 = ["crazy", "docile", "mellow", "hyper", "chipper", "goofy", "haughty", "envious", "cute", "hungry"]; //10 elem
const name2 = ["Squirrel", "Hippo", "Bobcat", "Rhinocerous", "Ibex", "Axolotl", "Dingo", "Hyena", "Capybara", "RockHyrax"];  // 10 elem
//const name1 = ["crazy", "docile"]; //10 elem
//const name2 = ["Squirrel", "Hippo"];  // 10 elem


//make the server listen on port 3000
server.listen(port, function () {
    console.log('Server running on port ' + port);
});



//When they request this on our server, send index.html
app.get('/', function (req, res) {
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
io.on('connection', function (socket) {
    console.log("user connected");

    let user = { name: "", color: "" };

    // Check cookies for username and color
    if (false) {

    }
    // Or randomly generate
    else {
        // Generate name
        let genName = "";

        do {   // Make sure it isn't aldready in allUsers
            let num1 = Math.round(Math.random() * 9);
            let num2 = Math.round(Math.random() * 9);

            //console.log("Num1: " + num1);
            //console.log("Num2: " + num2);

            genName = "" + name1[num1] + name2[num2];
            console.log(genName);
            console.log(allUsers);
        } while (genName in allUsers);

        // Generate color
        let num3 = Math.round(Math.random() * 13);

        //console.log("Num3: " + num3);

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

    // Update user list
    updateUserList();

    socket.on('message', (msg) => {
        // timestamp
        let fullDate = Date().split(" ");
        let withSeconds = fullDate[4].split(':');
        let rightTime = withSeconds[0] + ":" + withSeconds[1];

        // Change nickname or change in color requested/nick <new nickname>
        let possibleRequest = msg.split(" ");

        if (possibleRequest[0].trim() == "/nick") {
            console.log("change name request");
            let oldname = user["name"];

            if ((possibleRequest.length > 1) && !(possibleRequest[1].trim() in allUsers)) { // Make sure there is a name to change it to and that there isn't already a user with that name
                user["name"] = possibleRequest[1].trim();
                console.log(user);

                io.emit('message', ("<li>" + rightTime + " " + oldname + " changed their name to " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + "." + "</li>"));

                // TODO: remove old name from list and add to allUsers
                // Add name to global users array
                allUsers[user["name"]] = user["color"];

                // Remove other instance
                delete allUsers[oldname];               

                // Update user list
                updateUserList();
            }
            else {
                io.emit('message', ("<li>" + rightTime + " " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + "'s name change not successful" + "</li>"));
            }

        }
        else if (possibleRequest[0].trim() == "/nickcolor") {
            console.log("change color request");
            if ((possibleRequest.length > 1) && (possibleRequest[1].length == 6) && (all0ToF(possibleRequest[1]))) {
                user["color"] = "#" + possibleRequest[1].trim();
                console.log(user);

                // TODO: separate self and others
                io.emit('message', ("<li>" + rightTime + " " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + " changed color." + "</li>"));
            }
            else {
                io.emit('message', ("<li>" + rightTime + " " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + "'s color change not successful" + "</li>"));
            }

        }
        else {
            console.log(`message ${msg}`);
            io.emit('message', ("<li>" + rightTime + " " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + ": " + msg + "</li>"));
        }
    });

    socket.on('disconnect', () => {
        // timestamp
        let fullDate = Date().split(" ");
        let withSeconds = fullDate[4].split(':');
        let rightTime = withSeconds[0] + ":" + withSeconds[1];

        // Remove nickname from allUsers
        delete allUsers[user["name"]]; 

        // Update user list
        updateUserList();

        // Better message
        console.log("user disconnected");
        io.emit('message', ("<li>" + rightTime + " " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + " has left the chat room." + "</li>"));
    })

});

function all0ToF(str) {
    str = str.toLowerCase();
    for (let i = 0; i < 6; i++) {
        let letterCode = str.charCodeAt(i);

        if ((letterCode < 48) || (letterCode > 57 && letterCode < 97) || (letterCode > 102)) {
            return false;
        }
    }

    return true;
}

// Update user list
function updateUserList() {
    let strUsers = "";
    for (let key in allUsers) {
        strUsers = strUsers + "<li>" + key + "</li> ";
    }
    console.log(strUsers);
    io.emit('updateUsers', strUsers);
}


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
