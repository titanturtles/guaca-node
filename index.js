const http = require('http');
const path = require('path');
const busboy = require('busboy');
const fs = require('fs');
const uid = require('uid');
const jwt = require('jsonwebtoken');
const prompt = require('prompt-sync')();

//==============================
//guaca node
//1) register as a node to the guaca client
//  (1) ip, port
//  (2) token, id
//  (3) compacity: RAM, SSD, CPU
//  (4) also, this registration needs to be a thing that regularly verify the health of the node as well.
//2) file upload server
//  (1) zip files can be uploaded
//  (2) meta info of the file
//    (2.1) name
//    (2.2) readme
//    (2.3) required hardware: RAM, SSD, CPU, internet
//    (2.4) verification checksum
//4) status
//  (0) each instance needs to have uid
//    (0.1) instance ready
//    (0.2) instacne started
//    (0.3) instance stopped
//    (0.4) instance suspended
//    (0.5) instance cleaned and recycled
//    (0.6) instance timer, start time and time left
//  (1) ready mode: 
//    (1.1) uploaded zip file
//    (1.2) 2 copies of unzipped file that are not running, has compacity of running
//  (2) uploading
//  (3) uploaded (verified)
//  (4) uploaded, unzipped 
//  (5) ready, no compacity of running
//  (6) suspending
//  (7) stopping
//  (8) stopped
//  (9) stopped and cleaned

// 1) register a node to the guaca client
// 1.1) read config file
function read_config(update_flag) {
  fs.readFile('./config.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    // 1.2) update config file if needed

    console.log(data);
    config_json = JSON.parse(data);
    let change_flag = false;
    if (!config_json['node-info'].uid && update_flag) {
      config_json['node-info'].uid = uid.uid();
      console.log('config_json.node-info.uid', config_json['node-info'].uid);
      change_flag = true;
    }
    if (!config_json['node-info']['access-token'] && update_flag) {
      let token = jwt.sign({ _id: config_json.uid }, 'SuperSecret');
      config_json['node-info']['access-token'] = token;
      console.log('config_json.node-info.access-token', config_json['node-info']['access-token']);
      change_flag = true;
    }

    if (!config_json['node-info']['ip'] && update_flag) {
      const ip = prompt('What is the external IP address?');
      config_json['node-info']['ip'] = ip;
      console.log('config_json.node-info.ip', config_json['node-info']['ip']);
      change_flag = true;
    }
    if (!config_json['node-info']['api-port'] && update_flag) {
      const port = prompt('What is the external Port for api connection?');
      config_json['node-info']['api-port'] = port;
      console.log('config_json.node-info.api-port', config_json['node-info']['api-port']);
      change_flag = true;
    }
    if (!config_json['node-info']['RAM(MB)'] && update_flag) {
      const ram = prompt('What is the amount of RAM allowed to be used by the node (in MB)?');
      config_json['node-info']['RAM(MB)'] = ram;
      console.log('config_json.node-info.RAM(MB)', config_json['node-info']['RAM(MB)']);
      change_flag = true;
    }
    if (!config_json['node-info']['SSD(MB)'] && update_flag) {
      const ssd = prompt('What is the amount of SSD space allowed to be used by the node (in MB)?');
      config_json['node-info']['SSD(MB)'] = ssd;
      console.log('config_json.node-info.SSD(MB)', config_json['node-info']['SSD(MB)']);
      change_flag = true;
    }
    if (!config_json['node-info']['CPU Cores'] && update_flag) {
      const cpus = prompt('What is the number of CPU Cores allowed to be used by the node?');
      config_json['node-info']['CPU Cores'] = cpus;
      console.log('config_json.node-info.CPU Cores', config_json['node-info']['CPU Cores']);
      change_flag = true;
    }

    if (change_flag) {
      let config_txt = JSON.stringify(config_json, null, 4);
      fs.writeFile('./config.json', config_txt, (err) => {
        if (err) console.log(err);
        console.log("Successfully Written to File.");
      });
    }

  });
}

let update_flag = true;
read_config(update_flag);


http.createServer((req, res) => {
  if (req.method === 'POST') {
    console.log('POST request');
    const bb = busboy({ headers: req.headers });
    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
    

      const saveTo = path.join('./uploads/', filename);
      console.log("saving to", saveTo);
      file.pipe(fs.createWriteStream(saveTo));

    });
    bb.on('field', (name, val, info) => {
        console.log(`Field [${name}]: value: %j`, val);
      });
    bb.on('close', () => {
      console.log('Done parsing form!');
      res.writeHead(200, { Connection: 'close', Location: '/' });
      res.end();
    });
    req.pipe(bb);
    return;
  } else if (req.method === 'GET') {
    res.writeHead(200, { Connection: 'close' });
    res.end(`
      <html>
        <head></head>
        <body>
          <form method="POST" enctype="multipart/form-data">
            <input type="file" name="filefield"><br />
            <input type="text" name="textfield"><br />
            <input type="submit">
          </form>
        </body>
      </html>
    `);
  }
}).listen(4000, () => {
  console.log('Listening to port 4000 for requests');
});
