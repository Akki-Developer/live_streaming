/*var connection = new WebSocket('ws://localhost:9898'); 
var name = ""; 
 
var loginInput = document.querySelector('#loginInput'); 
var loginBtn = document.querySelector('#loginBtn'); 
var otherUsernameInput = document.querySelector('#otherUsernameInput'); 
var connectToOtherUsernameBtn = document.querySelector('#connectToOtherUsernameBtn'); 
var connectedUser, myConnection;
  
//when a user clicks the login button 
loginBtn.addEventListener("click", function(event){ 
   name = loginInput.value; 
	
   if(name.length > 0){ 
      send({ 
         type: "login", 
         name: name 
      }); 
   } 
	
});

//connection message
connection.onopen = function() {
   console.log('WebSocket Client Connected');
   connection.send('Hi this is web client.');
};

//handle messages from the server 
connection.onmessage = function (message) { 
   console.log("Got message", message.data);
   var data = JSON.parse(message.data); 
	
   switch(data.type) { 
      case "login": 
         onLogin(data.success); 
         break; 
      case "offer": 
         onOffer(data.offer, data.name); 
         break; 
      case "answer": 
         onAnswer(data.answer); 
         break; 
      case "candidate": 
         onCandidate(data.candidate); 
         break; 
      default: 
         break; 
   } 
};
  
//when a user logs in 
function onLogin(success) { 

   if (success === false) { 
      alert("oops...try a different username"); 
   } else { 
      //creating our RTCPeerConnection object 
		
      var configuration = { 
         'iceServers':[{   urls: [ "stun:bn-turn1.xirsys.com" ]}, {   username: "fZZeTx84bSFZFO01LWJOyIbocVRv-GQG1wwvWJzBtZwhKbTd9ef1XwgLwCaHPnQGAAAAAGCPtJhwcmFkY3NlcnZlcg==",   credential: "c9f08894-abe9-11eb-a664-0242ac140004",   urls: [       "turn:bn-turn1.xirsys.com:80?transport=udp",       "turn:bn-turn1.xirsys.com:3478?transport=udp",       "turn:bn-turn1.xirsys.com:80?transport=tcp",       "turn:bn-turn1.xirsys.com:3478?transport=tcp",       "turns:bn-turn1.xirsys.com:443?transport=tcp",       "turns:bn-turn1.xirsys.com:5349?transport=tcp"   ]}]
      }; 
		
      myConnection = new webkitRTCPeerConnection(configuration); 
      console.log("RTCPeerConnection object was created"); 
      console.log("myConnection",myConnection); 
  
      //setup ice handling
      //when the browser finds an ice candidate we send it to another peer 
      myConnection.onicecandidate = function (event) { 
		
         if (event.candidate) { 
            send({ 
               type: "candidate", 
               candidate: event.candidate 
            }); 
         } 
      }; 
   } 
};
  
// connection.onopen = function () { 
//    console.log("Connected"); 
// };
  
connection.onerror = function (err) { 
   console.log("Got error", err); 
};
  
// Alias for sending messages in JSON format 
function send(message) { 

   if (connectedUser) { 
      message.name = connectedUser; 
   } 
	
   connection.send(JSON.stringify(message)); 
};

*/

//our username 
var name; 
var connectedUser;
  
//connecting to our signaling server
var conn = new WebSocket('ws://localhost:9090'); 
  
conn.onopen = function () { 
   console.log("Connected to the signaling server"); 
};
  
//when we got a message from a signaling server 
conn.onmessage = function (msg) { 
   console.log("Got message", msg.data);
	
   var data = JSON.parse(msg.data); 
	
   switch(data.type) { 
      case "login": 
         handleLogin(data.success); 
         break; 
      //when somebody wants to call us 
      case "offer": 
         handleOffer(data.offer, data.name); 
         break; 
      case "answer": 
         handleAnswer(data.answer); 
         break; 
      //when a remote peer sends an ice candidate to us 
      case "candidate": 
         handleCandidate(data.candidate); 
         break; 
      case "leave": 
         handleLeave(); 
         break; 
      default: 
         break; 
   }
};
  
conn.onerror = function (err) { 
   console.log("Got error", err); 
};
  
//alias for sending JSON encoded messages 
function send(message) { 
   //attach the other peer username to our messages 
   if (connectedUser) { 
      message.name = connectedUser; 
   } 
	
   conn.send(JSON.stringify(message)); 
};
  
//****** 
//UI selectors block 
//******
 
var loginPage = document.querySelector('#loginPage'); 
var usernameInput = document.querySelector('#usernameInput'); 
var loginBtn = document.querySelector('#loginBtn'); 

var callPage = document.querySelector('#callPage'); 
var callToUsernameInput = document.querySelector('#callToUsernameInput');
var callBtn = document.querySelector('#callBtn'); 

var hangUpBtn = document.querySelector('#hangUpBtn');
  
var localVideo = document.querySelector('#localVideo'); 
var remoteVideo = document.querySelector('#remoteVideo'); 

var yourConn; 
var stream;
  
callPage.style.display = "none";

// Login when the user clicks the button 
loginBtn.addEventListener("click", function (event) { 
   name = usernameInput.value;
	
   if (name.length > 0) { 
      send({ 
         type: "login", 
         name: name 
      }); 
   }
	
});
  
function handleLogin(success) { 
   if (success === false) { 
      alert("Ooops...try a different username"); 
   } else { 
      loginPage.style.display = "none"; 
      callPage.style.display = "block";
		
      //********************** 
      //Starting a peer connection 
      //********************** 
		
      //getting local video stream 
      navigator.webkitGetUserMedia({ video: true, audio: true }, function (myStream) { 
         stream = myStream; 
			
         //displaying local video stream on the page 
         // localVideo.src = window.URL.createObjectURL(stream);
			//insert stream into the video tag
         if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Not adding `{ audio: true }` since we only want video now
            navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
                //video.src = window.URL.createObjectURL(stream);
                localVideo.srcObject = stream;
                localVideo.play();
            });
         }

         //using Google public stun server 
         var configuration = { 
            "iceServers": [{
               urls: [ "stun:bn-turn1.xirsys.com" ]
            }, {
               username: "ms0DTnyLVa0BG-JY46E55oxL8dP2WOJYzmq8DB02mBKlV0YyFfPrHdHtCcISh7_HAAAAAGEjSO5ha2tp",
               credential: "9faabcd6-03e0-11ec-a017-0242ac140004",
               urls: [
                   "turn:bn-turn1.xirsys.com:80?transport=udp",
                   "turn:bn-turn1.xirsys.com:3478?transport=udp",
                   "turn:bn-turn1.xirsys.com:80?transport=tcp",
                   "turn:bn-turn1.xirsys.com:3478?transport=tcp",
                   "turns:bn-turn1.xirsys.com:443?transport=tcp",
                   "turns:bn-turn1.xirsys.com:5349?transport=tcp"
               ]
            }]
         }; 
			
         yourConn = new webkitRTCPeerConnection(configuration); 
			
         // setup stream listening 
         yourConn.addStream(stream); 
			
         //when a remote user adds stream to the peer connection, we display it 
         yourConn.onaddstream = function (e) { 
            // remoteVideo.src = window.URL.createObjectURL(e.stream); 
            if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
               // Not adding `{ audio: true }` since we only want video now
               navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
                   //video.src = window.URL.createObjectURL(stream);
                   remoteVideo.srcObject = stream;
                   remoteVideo.play();
               });
            }
         };
			
         // Setup ice handling 
         yourConn.onicecandidate = function (event) { 
            if (event.candidate) { 
               send({ 
                  type: "candidate", 
                  candidate: event.candidate 
               }); 
            } 
         };  
			
      }, function (error) { 
         console.log(error); 
      }); 
		
   } 
};
  
//initiating a call 
callBtn.addEventListener("click", function () { 
   var callToUsername = callToUsernameInput.value;
	
   if (callToUsername.length > 0) { 
	
      connectedUser = callToUsername;
		
      // create an offer 
      yourConn.createOffer(function (offer) { 
         send({ 
            type: "offer", 
            offer: offer 
         }); 
			
         yourConn.setLocalDescription(offer); 
      }, function (error) { 
         alert("Error when creating an offer"); 
      });
		
   } 
});
  
//when somebody sends us an offer 
function handleOffer(offer, name) { 
   connectedUser = name; 
   yourConn.setRemoteDescription(new RTCSessionDescription(offer));
	
   //create an answer to an offer 
   yourConn.createAnswer(function (answer) { 
      yourConn.setLocalDescription(answer); 
		
      send({ 
         type: "answer", 
         answer: answer 
      }); 
		
   }, function (error) { 
      alert("Error when creating an answer"); 
   }); 
};
  
//when we got an answer from a remote user
function handleAnswer(answer) { 
   yourConn.setRemoteDescription(new RTCSessionDescription(answer)); 
};
  
//when we got an ice candidate from a remote user 
function handleCandidate(candidate) { 
   yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
};
   
//hang up 
hangUpBtn.addEventListener("click", function () { 

   send({ 
      type: "leave" 
   });  
	
   handleLeave(); 
});
  
function handleLeave() { 
   connectedUser = null; 
   remoteVideo.src = null; 
	
   yourConn.close(); 
   yourConn.onicecandidate = null; 
   yourConn.onaddstream = null; 
};