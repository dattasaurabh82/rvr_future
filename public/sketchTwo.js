var capture;

var camResW = 640;
var extraW = 250;
var camResH = 480;
var extraH = 100;
var strainGap = 60;

var portInput;
var submitButton;


var wss_ip;
var wssport = 8081;
var wss_ip = "192.168.1.136";
var old_wss_ip = "192.168.1.136";
var connected = true;

var fontRegular;

// var durationInput;
var video_duration = 2;
var counter = 0;
var imageCount = 5;

var prompt_text = "";
var recording = false;
var recorded = false;
var trainVid = false;
var trainedVid = false;
var convError = false;
var serverError = false;
var deletionComplete = false;
var deletionErr = false;
var imagesSaved = false;
var imagesSavingErr = false;
var predictFuture = false;
var futurePresent = false;
var showFuture = false;
var futureImg;


function preload(){
  fontRegular = loadFont("data/712_serif.ttf");
}

function setup(){
  //creating and centering the canvas
  var cnv = createCanvas(camResW + extraW + strainGap, camResH/2 + extraH);
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);
  cnv.id("stereoCanvas");

  //Attaching the back camera in Android 
  var constraints = {
    audio: false,
    video: {
      facingMode: {
        exact: "environment"
        // exact: "facing" //for front camera
      }
    }
  };
  capture = createCapture(constraints);
  capture.size(camResW, camResH);
  // hide the main cam view from the DOM
  capture.hide();
  
  background(0);
  textFont(fontRegular);
  noCursor();

  portInput = createInput(wss_ip);
  portInput.size(200, 40);
  portInput.id("portInput");
  // document.getElementById("portInput").setAttribute("placeholder", "controller ip");

  submitButton = createButton("");
  submitButton.id("submitButton");

  changeAddress = true;
  connected = false;

  // durationInput = createInput(3);
  // durationInput.size(40, 40);
  // durationInput.id("durationInput");

}



function draw(){
  background(0);
  // stereo viewwss_ip
  image(capture, 0, 0, (camResW + extraW)/2, camResH/2 + extraH);
  image(capture, ((camResW + extraW)/2) + strainGap, 0, (camResW + extraW)/2, camResH/2 + extraH);

  // WSS connection setup from physical controls
  wss_ip = portInput.value();
  // video_duration = durationInput.value();

  if(changeAddress){
    socketSetup(wss_ip);
    changeAddress = false;
  }else{
    if(wss_ip != old_wss_ip){
      changeAddress = true;
      old_wss_ip = wss_ip;
    }
  }

  if(connected){
    fill("#2FA1D6");
  }else{
    fill("#DB5F89");
  }
  noStroke();
  ellipse(10, 10, 10, 10);
  ellipse(((camResW + extraW)/2)+strainGap+10, 10, 10, 10);

  if(testMode && !trainingMode){
    fill(255, 0, 0).strokeWeight(0).textSize(12);
    text("MODE: TEST", 5, 30);
    text("MODE: TEST", ((camResW + extraW)/2)+strainGap+5, 30);

    if(!imagesSaved && !imagesSavingErr && !predictFuture && !deletionComplete && !deletionErr && !serverError){
      prompt_text = "SAVE IMAGES";
      fill(0, 225, 0);
    }

    if (imagesSaved) {
      prompt_text = "IMAGES SAVED";
      fill(25, 105, 200);
    }

    if (imagesSavingErr){
      prompt_text = "ERROR WHILE SAVING";
      fill(255, 50, 20);
    }

    if (predictFuture ) {
      prompt_text = "PREDICT FUTURE";
      fill(105, 105, 100);
    }

    if (serverError){
      prompt_text = "ERROR IN SERVER";
      fill(255, 20, 10);
    }

    if(deletionComplete){
      prompt_text = "DELETED IMAGES";
      fill(25, 105, 100);
    }

    if(deletionErr){
      prompt_text = "ERROR WHILE DELETING";
      fill(255, 50, 20);
    }

    text(prompt_text, 5, 40);
    text(prompt_text, ((camResW + extraW)/2)+strainGap+5, 40);

    if(futurePresent){
      tint(255, 100);
      image(futureImg, 0, 0, (camResW + extraW) + strainGap , camResH/2 + extraH);
    }


  }else if (!testMode && trainingMode){
    fill(255, 0, 0).strokeWeight(0).textSize(12);
    text("MODE: TRAINING", 5, 30);
    text("MODE: TRAINING", ((camResW + extraW)/2)+strainGap+5, 30);

    if(!recording && !recorded && !trainVid && !trainedVid && !convError && !deletionComplete && !deletionErr && !serverError){
      prompt_text = "RECORD VIDEO";
      fill(0, 225, 0);
    }

    if (recording){
      prompt_text = "RECORDING VIDEO";
      fill(255, 105, 0);
    }

    if (recorded){
      prompt_text = "RECORDED VIDEO";
      fill(25, 105, 200);
    }

    if (trainVid){
      prompt_text = "TRAIN VIDEO";
      fill(10, 255, 50);
    }

    if (convError){
      prompt_text = "ERROR IN CONVERSION";
      fill(255, 50, 20);
    }

    if (serverError){
      prompt_text = "ERROR IN SERVER";
      fill(255, 20, 10);
    }

    if (deletionComplete){
      prompt_text = "DELETED ALL FILES";
      fill(255, 120, 10);
    }

    if (deletionErr){
      prompt_text = "ERROR IN DELETION";
      fill(255, 10, 10);
    }

    text(prompt_text, 5, 40);
    text(prompt_text, ((camResW + extraW)/2)+strainGap+5, 40);
  }
}


const chunks = [];

function record(delay) {
  chunks.length = 0;
  let stream = document.querySelector('canvas').captureStream(30),
    recorder = new MediaRecorder(stream);
  recorder.ondataavailable = e => {
    if (e.data.size) {
      chunks.push(e.data);
    }
  };

  recorder.start();
  setTimeout(function() {
    recorder.stop();
    recorder.onstop = exportVideoWithBS64;
  }, delay*1000);
}

function exportVideoWithBS64(e) {
  recording = true;
  recorded = false;
  trainVid = false;
  trainedVid = false;
  convError = false;
  serverError = false;

  var vid_data = {data: ''};
  
  var blob = new Blob(chunks);
  var reader = new window.FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = function() {
    base64data = reader.result;
    // console.log(base64data);
    var cleanBS64VidData = base64data.substr(base64data.indexOf(',')+1);
    vid_data.data = cleanBS64VidData;
    // console.log(vid_data);

    //------------ SEND THE VIDEO DATA TO SERVER ------------//
    // console.log("Recorded. Sending now");
    $.ajax({
      type: "POST",
      url: "/vid_sent/",
      data: vid_data,
      success: function(msg){
        if(msg == "ok video rcvd"){
          recording = false;
          recorded = true;
          trainVid = false;
          trainedVid = false;
          convError = false;
          serverError = false;
          //DELAY 
          setTimeout(function() {
            // After set falg for prompting text for training video
            recording = false;
            recorded = false;
            trainVid = true;
            trainedVid = false;
            convError = false;
            serverError = false;
          }, 5000);
        }else if (mag == "video conversion error"){
          recording = false;
          recorded = false;
          trainVid = false;
          trainedVid = false;
          convError = true;
          serverError = false;
        }
      },
      error: function(data){
        recording = false;
        recorded = false;
        trainVid = false;
        trainedVid = false;
        convError = false;
        serverError = true;
      },
      statusCode: {
        500: function() {
          recording = false;
          recorded = false;
          trainVid = false;
          trainedVid = false;
          convError = false;
          serverError = true;
        },
        503: function(){
          recording = false;
          recorded = false;
          trainVid = false;
          trainedVid = false;
          convError = false;
          serverError = true;
        },
      }
    });
  }
}

function deleteOldVideo(delay){
  var flag = {};
  flag.status = "cleanVid";
  // print(flag);
  $.ajax({
    type: "POST",
    url: "/clean_video/", // particular endpoint
    data: flag,
    success: function(msg){
      if(msg == "ok cleaned video"){
        recording = false;
        recorded = false;
        trainVid = false;
        trainedVid = false;
        convError = false;
        deletionComplete = true;
        deletionErr = false;
        serverError = false;
        //DELAY
        setTimeout(function() {
          recording = false;
          recorded = false;
          trainVid = false;
          trainedVid = false;
          convError = false;
          deletionComplete = false;
          deletionErr = false;
          serverError = false;
        }, delay);
      }else{
        recording = false;
        recorded = false;
        trainVid = false;
        trainedVid = false;
        convError = false;
        deletionComplete = false;
        deletionErr = true;
        serverError = false;
      }
    },
    error: function(data){
      recording = false;
      recorded = false;
      trainVid = false;
      trainedVid = false;
      convError = false;
      deletionComplete = false;
      deletionErr = false;
      serverError = true;
    },
    statusCode: {
      500: function() {
        recording = false;
        recorded = false;
        trainVid = false;
        trainedVid = false;
        convError = false;
        deletionComplete = false;
        deletionErr = false;
        serverError = true;
      },
      503: function(){
        recording = false;
        recorded = false;
        trainVid = false;
        trainedVid = false;
        convError = false;
        deletionComplete = false;
        deletionErr = false;
        serverError = true;
      },
    }
  });
}

function trainModel(){

}

function save_frames_server(data){
  // print(data);
  for (var i = 0; i < data.length; i ++){
      b64_creation(data[i]);
  }
}

function b64_creation(img_data){
  // print(img_data);
  // 
  // ------------ CLEAN IMAGE DATA --------------//
  // Get the imagedata of bs64 string 
  var raw_bs6_data = img_data.imageData;
  // Remove the headers from 'data..' till '..base64,'
  var sliced_bs6_data = raw_bs6_data.replace(/^data:image\/octet-stream;base64,/,'');
  //put it back in the image object. 
  // console.log(sliced_bs6_data);
  img_data.imageData = sliced_bs6_data;

  //------------ SEND THE IMAGE DATA ------------//
  $.ajax({
    type: "POST",
    url: "/img_sent/", // particular endpoint
    data: img_data,
    success: function(msg){
      if(msg == "ok saved"){
        print(msg);
        counter = counter + 1;
        if(counter >= imageCount){
          imagesSaved = true;
          imagesSavingErr = false;
          predictFuture = false;
          serverError = false;
          deletionComplete = false;
          deletionErr = false;
          counter = 0;
          //DELAY
          setTimeout(function() {
            imagesSaved = false;
            imagesSavingErr = false;
            predictFuture = true;
            serverError = false;
            deletionComplete = false;
            deletionErr = false;
          }, 5000);
        }
      }else{
        print("didn't get the msg");
        imagesSaved = false;
        imagesSavingErr = true;
        predictFuture = false;
        serverError = false;
        deletionComplete = false;
        deletionErr = false;
      }
    },
    error: function(data){
        imagesSaved = false;
        imagesSavingErr = false;
        predictFuture = false;
        serverError = true;
        deletionComplete = false;
        deletionErr = false;
    },
    statusCode: {
      500: function() {
        imagesSaved = false;
        imagesSavingErr = false;
        predictFuture = false;
        serverError = true;
        deletionComplete = false;
        deletionErr = false;
      },
      503: function(){
        imagesSaved = false;
        imagesSavingErr = false;
        predictFuture = false;
        serverError = true;
        deletionComplete = false;
        deletionErr = false;
      },
    }
  });
}

function cleanData(){
  var flag = {};
  flag.status = "clean";
  // print(flag);
  $.ajax({
    type: "POST",
    url: "/clean_data/", // particular endpoint
    data: flag,
    success: function(msg){
      if(msg == "ok cleaned"){
        deletionComplete = true;
        deletionErr = false;
        imagesSaved = false;
        imagesSavingErr = false;
        predictFuture = false;
        serverError = false;
        //DELAY
        setTimeout(function() {
          deletionComplete = false;
          deletionErr = false;
          imagesSaved = false;
          imagesSavingErr = false;
          predictFuture = false;
          serverError = false;
        }, 5000);
      }else{
        deletionComplete = false;
        deletionErr = true;
        imagesSaved = false;
        imagesSavingErr = false;
        predictFuture = false;
        serverError = false;
      }
    },
    error: function(data){
      deletionComplete = false;
      deletionErr = false;
      imagesSaved = false;
      imagesSavingErr = false;
      predictFuture = false;
      serverError = true;
    },
    statusCode: {
      500: function() {
        deletionComplete = false;
        deletionErr = false;
        imagesSaved = false;
        imagesSavingErr = false;
        predictFuture = false;
        serverError = true;
      },
      503: function(){
        deletionComplete = false;
        deletionErr = false;
        imagesSaved = false;
        imagesSavingErr = false;
        predictFuture = false;
        serverError = true;
      },
    }
  });
}

function trainImages(){
    //----
}

function fetchTrainedImage(){
  //--
  futureButtonCounter = futureButtonCounter + 1;
      
  var flag = {};
  flag.status = "show_future";
  // print(flag);
  $.ajax({
    type: "POST",
    url: "/show_data/", // particular endpoint
    data: flag,
    success: function(msg){
      var clientFolder = msg.replace("ok fetch:", "");
      var msgHeader = msg.slice(0, msg.indexOf(":"));

      if (msgHeader == "ok fetch"){
        if (futureButtonCounter == 1){
          futurePresent = true;
          futureImg = loadImage("/data/" + clientFolder + "/ClientFuture/future.jpg");
        }else if (futureButtonCounter == 2){
          //remove the image on second click
          futurePresent = false;
          futureButtonCounter = 0;
        }
      }else if (msg == "no picture"){
        futurePresent = false;
      }else{
        window.alert("Not in scope yet");
      }
    }
  });
}


function getIPport() {
  var person = prompt("port", "");
  return person;
}

function socketSetup(wss_ip){
  socket = new WebSocket("wss://" + wss_ip + ":" + wssport + "/");
  // The socket connection event listeners
  // set them up here
  socket.onopen = openSocket;
  socket.onmessage = showData;
  socket.onerror = closeSocket;
  socket.onclose = closeSocket;
}

function openSocket() {
  connected = true;
  socket.send("Hello server");
}

var switchMode = "LOW";
var trainingMode = false;
var testMode = true;
var futureButtonCounter = 0;

function showData(result){
  if(connected){
    var server_dump = JSON.parse(result.data);

    switchMode = server_dump.buttonTraining;

    if(switchMode == "LOW"){
      trainingMode = false;
      testMode = true;
    }else if (switchMode == "HIGH"){
      trainingMode = true;
      testMode = false;
    }

    if(server_dump == "Connection confirmed"){
      console.log(server_dump);
    }


    if(testMode && !trainingMode && server_dump.buttonOne == "HIGH"){
      // -- clean data
      console.log("clean data");
      cleanData();
    }else if (!testMode && trainingMode && server_dump.buttonOne == "HIGH"){
      console.log("delete old video");
      deleteOldVideo(5000);
    }

    if(testMode && !trainingMode && server_dump.buttonTwo == "HIGH"){
      // -- take pictures
      record_status = false;
      console.log("take pictures");
      saveFrames("frames", "jpg", imageCount, 1, function(data){
        save_frames_server(data);
      });
    }else if (!testMode && trainingMode && server_dump.buttonTwo == "HIGH"){
      //save video 
      record(video_duration);
    }

    if(testMode && !trainingMode && server_dump.buttonThree == "HIGH"){
      // -- train model
      console.log("generate picture against model");
      trainImages();
    }else if (!testMode && trainingMode && server_dump.buttonThree == "HIGH"){
      console.log("Train model");
      trainModel();
    }

    if(testMode && !trainingMode && server_dump.buttonFour == "HIGH"){
      // -- show future
      console.log("show future");
      fetchTrainedImage();
    }

  }
}


function closeSocket(){
  connected = false;
  console.log("something happened. Refresh the ports");
  setTimeout(socketSetup(wss_ip), 1000);
}

