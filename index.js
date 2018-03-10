// SERVER
/*
    Name: Nicole Lefebvre
    ID: 10055118
    Tutorial: B03
*/

//Express initializes app to be a function handler that you can supply to an HTTP server
var app = require('express')();    // Run right away; import and run
var server = require('http').Server(app);   // the server

// pass HTTP server to initialize a new instance of socket.io
var io = require('socket.io')(server);    // running with server just created

const port = 3000;    // Port constant used throughout

// Users object
var allUsers = {};   // store all the user names & colors    //key = username; value = color
let allMessages = [];    // Store all messages for when others later join


const colors = ["Aqua", "Blue", "Brown", "BurlyWood", "Chartreuse", "Coral", "CornflowerBlue", "Crimson", "DarkGoldenRod", "DarkGrey", "DarkGreen", "DarkOliveGreen", "DarkOrange", "DeepPink", "Gold", "LightGreen", "LightPink", "LightSeaGreen", "Maroon", "MidnightBlue", "OrangeRed", "Red"]; // 22 elem
const name1 = ["crazy", "docile", "mellow", "hyper", "chipper", "goofy", "haughty", "envious", "cute", "hungry"]; //10 elem
const name2 = ["Squirrel", "Hippo", "Bobcat", "Rhinocerous", "Ibex", "Axolotl", "Dingo", "Hyena", "Capybara", "RockHyrax"];  // 10 elem


//make the server listen on port 3000
server.listen(port, function () {
    console.log('Server running on port ' + port);
});


//When they request this on our server, send index.html
app.get('/', function (req, res) {
    // Capital F - not deprecated
    res.sendFile(__dirname + '/index.html');
});

// Event: connection
io.on('connection', function (socket) {
    console.log("user connected");

    let user = { name: "", color: "" };

    // Check cookies for username and color
    socket.emit('getCookies', '');

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
                //console.log(user);

                // Just sender
                socket.emit('message', ("<li><b>" + rightTime + " You have successfully changed your name from " + oldname + " to " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + "." + "</b></li>"));

                // All but sender
                let newMsg = ("<li>" + rightTime + " " + oldname + " changed their name to " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + "." + "</li>");

                allMessages.push(newMsg);// Add to all messages
                socket.broadcast.emit('message', newMsg);   // Send to everyone else

                // Add name to global users array
                allUsers[user["name"]] = user["color"];

                // Remove other instance
                delete allUsers[oldname];

                // Update user list
                updateUserList();

                // Create cookie
                let cookieStr = "current=name:" + user["name"] + ":color:" + user["color"];
                socket.emit('setCookies', cookieStr);

                // Display username
                socket.emit('displayUsername', ("You are " + user["name"]));
            }
            else {
                // Just sender
                socket.emit('message', ("<li><b>" + rightTime + " Your attempt to change your name was unsuccessful." + "</b></li>"));
                console.log("Request failed");
            }

        }
        else if (possibleRequest[0].trim() == "/nickcolor") {
            console.log("change color request");
            if ((possibleRequest.length > 1) && (possibleRequest[1].length == 6) && (all0ToF(possibleRequest[1]))) {
                user["color"] = "#" + possibleRequest[1].trim();

                // Just sender
                socket.emit('message', ("<li><b>" + rightTime + " Color change was successful, " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + "." + "</b></li>"));

                // All but sender
                let newMsg = ("<li>" + rightTime + " " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + " changed color." + "</li>");

                allMessages.push(newMsg);// Add to all messages
                socket.broadcast.emit('message', newMsg);   // Send to everyone else

                // Create cookie
                let cookieStr = "current=name:" + user["name"] + ":color:" + user["color"];
                socket.emit('setCookies', cookieStr);
            }
            else {
                // Just sender
                socket.emit('message', ("<li><b>" + rightTime + " Your attempt to change the color of your name was unsuccessful." + "</b></li>"));

                console.log("Request failed");
            }

        }
        else {
            if (msg != "user connected") {
                // Just sender
                socket.emit('message', ("<li><b>" + rightTime + " " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + ": " + msg + "</b></li>"));

                // All but sender
                let newMsg = ("<li>" + rightTime + " " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + ": " + msg + "</li>");

                allMessages.push(newMsg);   // Add to all messages
                socket.broadcast.emit('message', newMsg);
            }
        }
    });

    socket.on('loadAllMsgs', () => {
        // timestamp
        let fullDate = Date().split(" ");
        let withSeconds = fullDate[4].split(':');
        let rightTime = withSeconds[0] + ":" + withSeconds[1];

        for (let i = 0; i < (allMessages.length - 1); i++) {
            // Just to sender
            socket.emit('message', allMessages[i]);
        }
        // Show that they connected too
        socket.emit('message', ("<li><b>" + rightTime + " You have joined the chat room as " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + "</b></li>"));
    });

    socket.on('getCookies', (cookies) => {
        console.log("Got Cookie: " + cookies);
        cookies = cookies.split(":");
        user["name"] = cookies[1];
        user["color"] = cookies[3];
        console.log("set name and color: " + user["name"] + user["color"]);

        if ((user["name"] == "") || (user["color"] == "")) {
            // Or randomly generate
            // Generate name
            let genName = "";

            do {   // Make sure it isn't aldready in allUsers
                let num1 = Math.round(Math.random() * 9);
                let num2 = Math.round(Math.random() * 9);

                genName = "" + name1[num1] + name2[num2];

            } while (genName in allUsers);

            // Generate color
            let num3 = Math.round(Math.random() * 21);

            let genColor = colors[num3];

            // Add to this instance's object
            user["name"] = genName;
            user["color"] = genColor;

            // Add name to global users array
            allUsers[genName] = genColor;

            console.log("New User: " + user["name"]);

            // Create cookie
            let cookieStr = "current=name:" + user["name"] + ":color:" + user["color"];
            socket.emit('setCookies', cookieStr);
        }
        else {
            allUsers[user["name"]] = user["color"];
        }

        // Update user list
        updateUserList();

        // Display username
        socket.emit('displayUsername', ("You are " + user["name"]));

        // timestamp
        let fullDate = Date().split(" ");
        let withSeconds = fullDate[4].split(':');
        let rightTime = withSeconds[0] + ":" + withSeconds[1];

        for (let i = 0; i < (allMessages.length - 1); i++) {
            // Just to sender
            socket.emit('message', allMessages[i]);
        }
        // Show that they connected too
        socket.emit('message', ("<li><b>" + rightTime + " You have joined the chat room as " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + "</b></li>"));

        // All but sender
        let newMsg = ("<li>" + rightTime + " " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + " has entered the chat room." + "</li>");

        allMessages.push(newMsg);   // Add to all messages
        socket.broadcast.emit('message', newMsg);    // Send to everyone
    });

    socket.on('disconnect', () => {
        // timestamp
        let fullDate = Date().split(" ");
        let withSeconds = fullDate[4].split(':');
        let rightTime = withSeconds[0] + ":" + withSeconds[1];

        console.log("user " + user["name"] + " disconnected");

        // Remove nickname from allUsers
        delete allUsers[user["name"]];

        // Update user list
        updateUserList();

        // Update everyone
        let newMsg = ("<li>" + rightTime + " " + "<span style=\"color: " + user["color"] + ";\">" + user["name"] + "</span>" + " has left the chat room." + "</li>");

        allMessages.push(newMsg);   // Add to all messages
        io.emit('message', newMsg);
    })

});

// Make sure all digits for color entered are hexadecimal in range
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

// Update user list for each client
function updateUserList() {
    console.log("display users");
    let strUsers = "";
    for (let key in allUsers) {
        strUsers = strUsers + "<li>" + key + "</li> ";
    }
    console.log(strUsers);
    io.emit('updateUsers', strUsers);
}
