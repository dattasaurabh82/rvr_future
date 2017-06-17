var express = require('express');
var https = require('https');
var fs = require('fs');
// var fs = require('fs-extra'); //for ubuntu server
var bodyParser = require('body-parser');
var shell = require('shelljs');


var port = 3000;
var PORT = process.env.PORT || 5000;
var HOST = process.env.HOST || '';

var req_counter = 0;
var folder_path;

var inputwebm;
var outputmp4;
var server_response = "video conversion error";

var inputFileName = "raw.webm";
var outputFileName = "raw.mp4";

var app = express();
var server = app.listen(port);


app.use(express.static('public'));
// We have to increase the file intake capacity of the parser
// as our bs64 string is huge
app.use(bodyParser.json({type: 'application/*+json', limit: '200mb'}));
app.use(bodyParser.urlencoded({limit: '200mb', extended: true}));

app.enable('trust proxy');

var vidFileCounter = 0;

app.post('/vid_sent/', function(req, res){
  console.log("recording");
  // To create the folders once only on subsequent post requests
  var folder_path = "";
  // create folders according to clients IP
  var folder_name = String(getClientIP(req.ip)).split('.').join('_');
  folder_path = "./public/data/" + folder_name;
  var training_video_folderPath = folder_path + "/TrainingVideo";

  // console.log(folder_path);
  // if the main client folder doesn't exist create one
  if (!fs.existsSync(folder_path)){
    fs.mkdirSync(folder_path);
     // fs.mkdirsSync(folder_path);// for ubuntu server
    console.log("made " + folder_path);
  }else{
    console.log("folder: " + folder_path + " exists");
  }
  // if the sub folder doesn't exist create one
  if(!fs.existsSync(training_video_folderPath)){
    fs.mkdirSync(training_video_folderPath);
    // fs.mkdirsSync(training_video_folderPath);// for ubuntu server
    console.log("made client's future folder " + "\" " + training_video_folderPath + " \"");
  }
  // else{
  //   console.log("folder: " + training_video_folderPath + " exists");
  //   console.log("removing any old file");
  //   // delete content in the subfolder that has been there
  //   // if there is no contenet a 'rm' command doesn't hurt
  //   rmv_content_path = training_video_folderPath.replace("./", "");
  //   shell.rm(rmv_content_path + '/*');
  // }

  vidFileCounter = vidFileCounter + 1;

  console.log("saving the file");
  // get the data write the buffer to the file in the dedicated folder 
  var vid_object = req.body;
  // console.log(vid_object.data);
  var buff = new Buffer(vid_object.data, 'base64');
  fs.writeFileSync(training_video_folderPath + '/raw' + vidFileCounter + '.webm', buff);
  console.log('video saved in folder: ' + training_video_folderPath + '/');
  console.log('converting from raw' + vidFileCounter + '.webm to raw' + vidFileCounter + '.mp4');
  //format paths for conversion of webm file to mp4
  var inputwebm = training_video_folderPath + '/raw' + vidFileCounter +'.webm';
  inputwebm = inputwebm.replace(".", "");
  var outputmp4 = training_video_folderPath + '/raw' + vidFileCounter + '.mp4';
  outputmp4 = outputmp4.replace(".", "");
  // server_response = ""; // this is modified accordingly in th enext function
  formatConverter(inputwebm, outputmp4);
  console.log(server_response);
  res.send(server_response);
});

function formatConverter(inputwebm, outputmp4){
  // convert webm to mp4 with ffmpeg
  var ffmpeg_cmd = "sudo ffmpeg -i \"" + __dirname + inputwebm + "\" -qscale 0 \"" + __dirname + outputmp4 + "\"";
  // var ffmpegOutPut = shell.exec(ffmpeg_cmd, {silent:true}).stdout;
  shell.exec(ffmpeg_cmd, {silent:true});

  //check the mp4 file exists .. 
  //then conversion was successful 
  var mpFilePath = "." + outputmp4;
  if (fs.existsSync(mpFilePath)) {
    console.log('converted raw.webm to raw.mp4');
    // After conversion rm webm file
    inputwebm = inputwebm.slice(1, inputwebm.length);
    shell.rm(inputwebm);
    console.log("Removed webm file");
    server_response = "ok video rcvd";
  }else{
    console.log('There was an conversion error');
    server_response = "video conversion error";
  }
  return server_response;
}

app.post('/clean_video/', function(req, res){
  var folder_name = String(getClientIP(req.ip)).split('.').join('_');
  var folder_path = "./public/data/" + folder_name;
  var training_video_folderPath = folder_path + "/TrainingVideo";

  if (fs.existsSync(training_video_folderPath)){
    if(req.body.status == 'cleanVid'){
      shell.rm('public/data/' + folder_name + '/TrainingVideo/*');
    }
  }
  res.send('ok cleaned video');
});

app.post('/img_sent/', function(req, res) {
  // console.log(getClientIP(req.ip));

  // To create the folders once only on subsequent post requests
  var folder_path = "";
  req_counter = req_counter + 1;
  if (req_counter <= 1){
    // create folders according to clients IP
    var folder_name = String(getClientIP(req.ip)).split('.').join('_');
    folder_path = "./public/data/" + folder_name;
    // console.log(folder_path);
    
    var client_future_folderPath = folder_path + "/ClientFuture";
    // console.log(client_future_folderPath);

    // if the main image data folder doesn't exist create one
    if (!fs.existsSync(folder_path)){
      fs.mkdirSync(folder_path);
      // fs.mkdirsSync(folder_path); //for ubuntu server
      console.log("made " + folder_path);
    }else{
      console.log("folder: " + folder_path + " exists");
      console.log("saving the file");
    }

    // if the sub folder doesn't exist create one
    if(!fs.existsSync(client_future_folderPath)){
      fs.mkdirSync(client_future_folderPath);
      console.log("made client's future folder " + "\" " + client_future_folderPath + " \"");
    }else{
      console.log("folder: " + client_future_folderPath + " exists");
      // console.log("saving the file");
    }

    req_counter = 0;
  }

  // get the data write teh buffer to the files in the dedicated folder 
  var img_object = req.body;
  // console.log(img_object.filename);
  // console.log(img_object.ext);
  // console.log(img_object.imageData);
  var buff = new Buffer(img_object.imageData, 'base64');
  // fs.writeFileSync('data/' + img_object.filename + '.' +img_object.ext, buff);
  fs.writeFileSync(folder_path + '/' + img_object.filename + '.' +img_object.ext, buff);
  console.log("file_saved in folder");
  res.send('ok saved');
});


app.post('/clean_data/', function(req, res){
  // I'm checking every time folder path and names and not resusing them as 
  // they would be instantaniously different for diff clients and sessions
  // console.log(req.body);
  var folder_name = String(getClientIP(req.ip)).split('.').join('_');
  var folder_path = "./public/data/" + folder_name;
  if (fs.existsSync(folder_path)){
    // if the folder exists
    // and you get a clean command
    if(req.body.status == 'clean'){
      // clean up any older images in the folder
      // shell.rm('-rf', 'data/' + folder_name + '/*');
      shell.rm('public/data/' + folder_name + '/*');
    }
  }
  res.send('ok cleaned');
});


app.post('/show_data/', function(req, res){
  // I'm checking every time folder path and names and not resusing them as 
  // they would be instantaniously different for diff clients and sessions
  var curr_client_folder_name = String(getClientIP(req.ip)).split('.').join('_');
  var curr_client_folder_path = "./public/data/" + curr_client_folder_name;
  var client_future_folderPath = curr_client_folder_path + "/ClientFuture";
  var future_file_name = "future.jpg";
  var future_file_path = client_future_folderPath + "/" + future_file_name;

  // If the sub folder exists
  if (fs.existsSync(client_future_folderPath)){
    // and matches the tag
    if(req.body.status == 'show_future'){
      fs.readdir(client_future_folderPath, function(err, files){
        if(files.length >= 1){
          res.send('ok fetch:' + curr_client_folder_name);
        }else if (files.length < 1){
          res.send('no picture');
        }else{
          res.send('not in scope for more than 1 picture');
        }
      });
    }
  }
});

var rawClientIp = "";
var clinetIp = "";

function getClientIP(req_ip){
  rawClientIp = String(req_ip);
  clinetIp = rawClientIp.replace("::ffff:", "");
  return clinetIp;
}



var secure_options = {
    key  : fs.readFileSync('ssl/key.pem'),
    ca   : fs.readFileSync('ssl/csr.pem'),
    cert : fs.readFileSync('ssl/cert.pem')
};


if (server) {
  console.log(" ");
  console.log("----------------------------------");
  console.log("http  server running at port: " + port);
}

https.createServer(secure_options, app).listen(PORT, HOST, null, function() {
  console.log('https server running on port: %d in %s mode', this.address().port, app.settings.env);
  console.log("with self signed ssl sertficate");
  console.log("----------------------------------");
  console.log(" ");
});

