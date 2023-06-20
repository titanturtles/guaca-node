const http = require('http');
const path = require('path');
const busboy = require('busboy');
const fs = require('fs');

//==============================
//guaca node
//1) register as a node to the guaca client
//  (1) ip, port
//  (2) token, id
//  (3) compacity: RAM, SSD, CPU
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
