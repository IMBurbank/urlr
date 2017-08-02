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
    output = {error: true, invalid_url: err};
  }
  
  if (original_url) {
    collection
      .count({})
      .then( collectionLen => {
        collection
          .find( {original_url })
          .toArray()
          .then( results => {
            if (results.length) {
              output = { original_url, short_url: results[0].short_url };
              console.log('Success Output: ', output);
              res.json(output);
            }
            else {
              output = { original_url, short_url: shortUrlBase + shortEndPath(collectionLen) };
              console.log('New Doc Pre-Insert', JSON.stringify(output));
              collection
                .insert(output)
                .then( () => res.json({ original_url: output.original_url, short_url: output.short_url }) );
              console.log('New Doc', output);
            }
          });
      });
  } 
  else res.json(output); 
});

app.get("/:redir", (req, res) => {
  let short_url = shortUrlBase + req.params.redir;
  
  collection
    .find({ short_url })
    .toArray( (err, results) => {
      if (err) throw err;  
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
