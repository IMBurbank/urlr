// app entry point

const express = require('express'),
      { MongoClient } = require('mongodb'),
      { URL } = require('url');

const app = express(),
      collectionName = 'urlr',
      dbUrl = 'mongodb://guest:default@ds129143.mlab.com:29143/fcc-apis',
      shortUrlBase = 'https://urlr.glitch.me/';

let collection, db, listener, original_url, output, short_url;


const shortEndPath = function createShortEndPath(collectionLen) {
  const baseCode = 'a'.charCodeAt(0),
        cycleLen = 26,
        cycleMin = 10;
  
  return collectionLen < cycleLen * cycleMin ? 
    String.fromCharCode(baseCode + ~~(collectionLen / cycleMin)) + collectionLen % cycleMin : 
    'z' + (collectionLen - cycleLen * (cycleMin - 1));
}


app.use(express.static('public'));

app.get("/", (req, res) => res.sendFile(__dirname + '/views/index.html'));

app.get("/new/:url*", (req, res) => {
  let original_url = '',
      short_url = '';
  
  try {
    original_url = new URL(req.params.url + req.params[0]);
    original_url = original_url.toString();
  }
  catch(err) {
    console.log('Failed URL Input Attempt: ', err);
    res.json({ error: true, invalid_url: err.input });
  }
  
  if (original_url) {
    collection
      .count({})
      .then( collectionLen => {
        collection
          .find({ original_url })
          .toArray()
          .then( results => {
            if (results.length) {
              output = { original_url, short_url: results[0].short_url };
              console.log('Serving url from db: ', output);
              res.json(output);
            }
            else {
              output = { original_url, short_url: shortUrlBase + shortEndPath(collectionLen) };
              collection
                .insert(output)
                .then( () => res.json({ original_url: output.original_url, short_url: output.short_url }) )
                .catch( err => console.error(err) );
              console.log('Serving new url: ', output);
            }
          })
          .catch( err => console.error(err) );
      })
      .catch( err => console.error(err) );
  } 
});

app.get("/:redir*", (req, res) => {
  let short_url = shortUrlBase + req.params.redir + req.params[0];
  
  collection
    .find({ short_url })
    .toArray( (err, results) => {
      if (err) console.error(err);  
      if (results.length) res.redirect(results[0].original_url);
      else res.json({ error: true, invalid_short_url: short_url });
    });
  console.log('Redirect Request: ', short_url);
});


MongoClient.connect(dbUrl, (err, database) => {
  if (err) throw err;

  db = database;
  collection = db.collection(collectionName); 
  
  listener = app.listen(process.env.PORT, () => {
    console.log('Your app is listening on port ' + listener.address().port);
  });
});
