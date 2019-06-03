const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");

mongoose.Promise = global.Promise;

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/Mydb")
  .then(
    () => {
      console.log("@@@ Connect Success @@@");
    },
    () => {
      console.log("!!! Fail to connect !!!");
    }
  );
var app = express();
app.use(bodyparser.json());

var Schema = mongoose.Schema;

var dataSchema = new Schema({
  id: { require: true, type: String, unique: true },
  temp: { require: true, type: String },
  humi: { require: true, type: String },
  water: { require: true, type: String },
  gas: { require: true, type: String },
  dust: {
    d1_0: {
      require: true,
      type: String
    },
    d2_5: {
      require: true,
      type: String
    },
    d10_0: {
      require: true,
      type: String
    }
  },
  date: { require: true, type: String }
});

var data = mongoose.model("data", dataSchema);

app.listen(4567);

app.post("/post", (req, res) => {
  data.find().then(doc => {
    let time = req.body.DevEUI_uplink.Time;
    let posT = time.search("T");
    let hex2str = hex_to_ascii(req.body.DevEUI_uplink.payload_hex);
    let buf = new data({
      id: doc.length,
      temp: hex2str.slice(0, hex2str.search("T")),
      humi: hex2str.slice(hex2str.search("T") + 1, hex2str.search("H")),
      water: hex2str.slice(hex2str.search("H") + 1, hex2str.search("W")),
      gas: hex2str.slice(hex2str.search("W") + 1, hex2str.search("G")),
      dust: {
        d1_0: hex2str.slice(hex2str.search("G") + 1, hex2str.search("D1_0")),
        d2_5: hex2str.slice(hex2str.search("D1_0") + 4, hex2str.search("D2_5")),
        d10_0: hex2str.slice(
          hex2str.search("D2_5") + 4,
          hex2str.search("D10_0")
        )
      },
      date:
        time.slice(posT - 2, posT) +
        time.slice(posT - 5, posT - 3) +
        time.slice(posT - 8, posT - 6) +
        time.slice(posT + 1, posT + 3) +
        time.slice(posT + 4, posT + 6) +
        time.slice(posT + 7, posT + 9)
    });
    buf.save().then(
      doc => {
        res.send("save to db\n" + doc);
      },
      e => {
        res.status(400).send("can not save to database\n" + e);
      }
    );
  });
});
app.get('/getlte/:input', function(req,res){
    stdDB.find({id:{$lte:req.params.input}}).then(function(docs){
        res.send(docs)
    }, function(err){
        res.status(404).send(err)
    })
})

app.get('/getbtw/:min/:max', function(req,res){
    stdDB.finf({id:{$gte:req.params.min, $lte:req.params.max}}).then(function(docs){
        res.RTCDtmfSender(docs)
    }, function(err){
        res.send(err)
    })
})


app.get("/getall", (req, res) => {
  data.find().then(doc => {
    res.send(doc);
  });
});
app.get("/getlast", (req, res) => {
  data.find().then(doc => {
    res.send(doc[Object.keys(doc).length - 1]);
  });
});
app.get("/drop/:kuy", (req, res) => {
  data.remove(
    {},
    doc => {
      res.send(doc);
    },
    err => {
      res.send(err);
    }
  );
});
function hex_to_ascii(str1) {
  var hex = str1.toString();
  var str = "";
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }

  return str;
}