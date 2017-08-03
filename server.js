// app entry point

const express = require('express'),
      { MongoClient } = require('mongodb'),
      { URL } = require('url');

const app = express(),
      collectionName = 'urlr',
      dbUrl = 'mongodb://guest:default@ds129143.mlab.com:29143/fcc-apis',
      shortUrlBase = 'https://urlr.glitch.me/';

let collection, db, listener;


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

app.get("/new/:url*", async (req, res) => {
  let original_url;
  
  try {
    original_url = new URL(req.params.url + req.params[0]);
    original_url = original_url.toString();   
    
    const collectionLen = await collection.count({});
    const results = await collection.find({ original_url }).toArray();
    const output = results.length ?
      { original_url, short_url: results[0].short_url } :
      { original_url, short_url: shortUrlBase + shortEndPath(collectionLen) };

    if (!results.length) collection.insert(Object.assign({}, output));
    console.log('Successful Request: ', output);
    res.json(output);
  }
  catch(err) {
    console.error('Failed URL Input Attempt: ', err);
    res.json({ error: true, invalid_url: err.input });
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
