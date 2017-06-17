var capture;

var cp;
var gui;
var f1;
var f2;
var counter = 0;

var socket;
var wss_port = 8080;
var old_wss_port = 8080;
var changePort;
var changeAddress;
var wss_ip = "10.202.217.100";
var old_wss_ip = "10.202.217.100";
var connected = true;

var delay = 2000;

function setup() {
    createCanvas(640, 480);

    capture = createCapture(VIDEO);
    capture.size(640, 480);
    capture.hide();

    //---------- GUI SETUP ---------//
    cp = new Controls();
    gui = new dat.GUI();
    f0 = gui.addFolder('PRE-TRAINING');
    f1 = gui.addFolder('POST-TRAINING');
    f2 = gui.addFolder('WS BUTTON CONTROL PARAMS');
    f0.close();
    f1.open();
    f2.open();
    initGUI();

    changePort = true;
    changeAddress = true;
}

function draw() {
    background(0);
    image(capture, 0, 0);
    // print(cp.Image_count);
    
    // ----------- websocket server setup --------------// 
    wss_port = cp.server_port;
    wss_ip = cp.server_ip;

    if(changePort){
        socketSetup(wss_ip, wss_port);
        changePort = false;
    }else{
        if(wss_port != old_wss_port){
            changePort = true;
            old_wss_port = wss_port;
        }
    }

    if(changeAddress){
        socketSetup(wss_ip, wss_port);
        changeAddress = false;
    }else{
        if(wss_ip != old_wss_ip){
            changeAddress = true;
            old_wss_ip = wss_ip;
        }
    }

    //------------------- *********** ------------------//
}


var speeder ;
var initGUI = function() {
    f0.add(cp, 'Clean_old_video');
    f0.add(cp, 'Video_duration', 1, 30).step(1);
    f0.add(cp, 'Save_video');
    f0.add(cp, 'Train_video');

    f1.add(cp, 'RMV_old_images');
    f1.add(cp, 'Image_count', 1, 10).step(1);
    f1.add(cp, 'Save_images');
    f1.add(cp, 'Predict_future');
    f1.add(cp, 'Show_future');

    f2.add(cp, 'server_ip');
    f2.add(cp, 'server_port');
};



var Controls = function() {
    // ---------- Pre training
    this.Clean_old_video = function(){
        deleteOldVideo(5000);
    };

    this.Video_duration = 3;

    this.Save_video = function(){
        record(this.Video_duration);
    };

    this.Train_video = function(){
        trainModel();
    };

    // ----------- Post training
    this.RMV_old_images = function(){
        cleanData();
    };

    // Default starting images we want to save
    this.Image_count = 4;

    this.Save_images = function() {
        //---------------------------------------------------------------------------
        // saveFrames("filename", "ext", <number of images>, duration, callback(){});
        // --------------------------------------------------------------------------
        // The callback function, if used, doesn't save the files locally but
        // throws an array of image objects with the data like file name, ext 
        // and bs64 string
        saveFrames("frames", "jpg", this.Image_count, 1, function(data){
            // data contains file a list of each image object
            // each image object = {filename, ext, imageData}
            save_frames_server(data);
        });
    };

    this.Predict_future = function(){
        // ask server to train data
        trainImages();
    };

    this.Show_future = function(){
        // fetch the trained image and show
        fetchTrainedImage();
    };

    // ------------ WSS server config
    this.server_port = 8080;
    this.server_ip = "10.202.217.101";

};

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
                if(counter >= cp.Image_count){
                    // window.alert("Saved " + cp.Image_count + " images in server");
                    
                    document.getElementById("pictureStatus").innerHTML="SAVED " + cp.Image_count + " IMAGES IN SERVER";
                    document.getElementById("pictureStatus").style.color = "#DB5F89";
                    counter = 0;
                    
                    setTimeout(function() {
                        document.getElementById("pictureStatus").innerHTML="PREDICT FUTURE";
                        document.getElementById("pictureStatus").style.color = "#FFCC00";
                    }, delay);
                }
            }else{
                print("didn't get the msg");
                // window.alert("didn't get the msg");
                document.getElementById("pictureStatus").innerHTML="didn't get the msg";
                document.getElementById("pictureStatus").style.color = "#FC3164";
            }
        },
        error: function(data){
            document.getElementById("pictureStatus").innerHTML="INTERNAL ERROR. Check server";
            document.getElementById("pictureStatus").style.color = "#FC3164";
        },
        statusCode: {
            500: function() {
                document.getElementById("pictureStatus").innerHTML="SCRIPT EXHAUSTED. Check server";
                document.getElementById("pictureStatus").style.color = "#FC3164";
            },
            503: function(){
                document.getElementById("pictureStatus").innerHTML="SERVER UNAVAILABLE. Check server";
                document.getElementById("pictureStatus").style.color = "#FC3164";
            },
        }
    });
}

function confirmationAlert(img_number){
    if(counter >= img_number){
        window.alert("Saved all images in server");
        counter = 0;
    }
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
                // window.alert("Cleaned old data in server.\nYou can save new images");
                document.getElementById("pictureStatus").innerHTML="DELETED OLD PICTURES";
                //DELAY
                setTimeout(function() {
                    document.getElementById("pictureStatus").innerHTML="TAKE PICTURES";
                    document.getElementById("pictureStatus").style.color = "#FFCC00";
                }, delay);
            }else{
                // window.alert("didn't get the msg");
                document.getElementById("pictureStatus").innerHTML="DID BNOT GET THE RESPONSE";
                document.getElementById("pictureStatus").style.color = "#FFCC00";
            }
        },
        error: function(data){
            document.getElementById("pictureStatus").innerHTML="INTERNAL ERROR. Check server";
            document.getElementById("pictureStatus").style.color = "#FC3164";
        },
        statusCode: {
            500: function() {
              document.getElementById("pictureStatus").innerHTML="SCRIPT EXHAUSTED. Check server";
              document.getElementById("pictureStatus").style.color = "#FC3164";
            },
            503: function(){
                document.getElementById("pictureStatus").innerHTML="SERVER UNAVAILABLE. Check server";
                document.getElementById("pictureStatus").style.color = "#FC3164";
            },
        }
    });
}

function trainImages(){
    //----
}

function fetchTrainedImage(){
    //--
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
            //  // pull the image form th client's folder:
                document.getElementById("futureImg").src="/data/" + clientFolder + "/ClientFuture/future.jpg";
                document.getElementById("pictureStatus").innerHTML="LIKE IT?";
                document.getElementById("pictureStatus").style.color = "#FFCC00";
            }else if (msg == "no picture"){
                // window.alert("OOPs! No Future for you");
                document.getElementById("pictureStatus").innerHTML="OOPS! NO FUTURE FOR YOU";
                document.getElementById("pictureStatus").style.color = "#FC3164";
            }else{
                window.alert("Not in scope yet");
            }
        }
    });
}

const chunks = [];

function record(delay) {
    // console.log(delay*1000);
    print("recording");
    document.getElementById("vidStatus").innerHTML="RECORDING VIDEO...";
    document.getElementById("vidStatus").style.color = "#DB5F89";
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
    document.getElementById("vidStatus").innerHTML="EXPORTING VIDEO";
    document.getElementById("vidStatus").style.color = "#DB5F89";
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
                    // window.alert("Saved video in server");
                    print("video saved in server.");
                    document.getElementById("vidStatus").innerHTML="VIDEO SAVED IN SERVER";
                    document.getElementById("vidStatus").style.color = "#2FA1D6";
                    //DELAY 
                    setTimeout(function() {
                        document.getElementById("vidStatus").innerHTML="TRAIN VIDEO";
                        document.getElementById("vidStatus").style.color = "#FFCC00";
                    }, 5000);
                }else if (mag == "video conversion error"){
                    print("there was a conversion error");
                    document.getElementById("vidStatus").innerHTML="VIDEO CONVERSION ERROR. Check server";
                    document.getElementById("vidStatus").style.color = "#FC3164";
                }
            },
            error: function(data){
                document.getElementById("vidStatus").innerHTML="INTERNAL ERROR. Check server";
                document.getElementById("vidStatus").style.color = "#FC3164";
            },
            statusCode: {
                500: function() {
                  document.getElementById("vidStatus").innerHTML="SCRIPT EXHAUSTED. Check server";
                  document.getElementById("vidStatus").style.color = "#FC3164";
                },
                503: function(){
                    document.getElementById("vidStatus").innerHTML="SERVER UNAVAILABLE. Check server";
                    document.getElementById("vidStatus").style.color = "#FC3164";
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
                    document.getElementById("vidStatus").innerHTML="DELETED OLD VIDEO";
                    //DELAY
                    setTimeout(function() {
                        document.getElementById("vidStatus").innerHTML="RECORD VIDEO";
                        document.getElementById("vidStatus").style.color = "#FFCC00";
                    }, delay);
                }else{
                    
                    document.getElementById("vidStatus").innerHTML="THERE WAS AN ERROR IN DELETION";
                    document.getElementById("vidStatus").style.color = "#FC3164";
                }
            },
            error: function(data){
            document.getElementById("vidStatus").innerHTML="INTERNAL ERROR. Check server";
            document.getElementById("vidStatus").style.color = "#FC3164";
            },
            statusCode: {
                500: function() {
                  document.getElementById("vidStatus").innerHTML="SCRIPT EXHAUSTED. Check server";
                  document.getElementById("vidStatus").style.color = "#FC3164";
                },
                503: function(){
                    document.getElementById("vidStatus").innerHTML="SERVER UNAVAILABLE. Check server";
                    document.getElementById("vidStatus").style.color = "#FC3164";
                },
            }
        });
}

function trainModel(){

}


function socketSetup(wss_ip, wss_port){
    socket = new WebSocket("wss://"+ wss_ip +":" + wss_port);
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
 
function showData(result) {
    if(connected){
        // when the server returns, show the result:
        var server_dump = JSON.parse(result.data);
        // console.log(server_dump);

        switchMode = server_dump.buttonTraining;

        if(switchMode == "LOW"){
            trainingMode = false;
            testMode = true;
            //trainingStatus div invisible
            document.getElementById("trainingStatus").style.visibility = "hidden";
            //testStatus div visible
            document.getElementById("testStatus").style.visibility = "visible";

            f0.close();
            f1.open();
            f2.open();
        }else if (switchMode == "HIGH"){
            trainingMode = true;
            testMode = false;
            //trainingStatus div visible
            document.getElementById("trainingStatus").style.visibility = "visible";
            //testStatus div invisible
            document.getElementById("testStatus").style.visibility = "hidden";

            f0.open();
            f1.close();
            f2.open();
        }

        if(server_dump == "Connection confirmed"){
            document.getElementById("notConnected").style.visibility = "hidden";
            document.getElementById("connected").style.visibility = "visible";
            console.log(server_dump);
        }
            

        if(testMode && !trainingMode && server_dump.buttonThree == "HIGH"){
            // -- clean data
            console.log("clean data");
            cleanData();
        }else if (!testMode && trainingMode && server_dump.buttonThree == "HIGH"){
            console.log("delete old video");
            deleteOldVideo(5000);
        }

        if(testMode && !trainingMode && server_dump.buttonFour == "HIGH"){
            // -- take pictures
            console.log("take pictures");

            saveFrames("frames", "jpg", cp.Image_count, 1, function(data){
                save_frames_server(data);
            });
        }else if (!testMode && trainingMode && server_dump.buttonFour == "HIGH"){
            //save video 
            record(cp.Video_duration);
        }

        if(testMode && !trainingMode && server_dump.buttonTwo == "HIGH"){
            // -- train model
            console.log("generate picture against model");
            trainImages();
        }else if (!testMode && trainingMode && server_dump.buttonTwo == "HIGH"){
            console.log("Train model");
            trainModel();
        }

        if(testMode && !trainingMode && server_dump.buttonOne == "HIGH"){
            // -- show future
            console.log("show future");
            fetchTrainedImage();
        }
    }
}

function closeSocket(){
    connected = false;
    console.log("something happened. Refresh the ports");
    document.getElementById("notConnected").style.visibility = "visible";
    document.getElementById("connected").style.visibility = "hidden";
}









