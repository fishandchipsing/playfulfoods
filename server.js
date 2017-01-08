var express = require('express');
var multer = require('multer');
var fs = require('fs');

var vision = require('@google-cloud/vision')({
    projectId: 'image-to-recipe',
    keyFilename: 'auth/Image_to_recipe_f07606bd92d1.json'
});

var request = require("request");
var limdu = require('limdu');

var app = express();

var port = process.env.PORT || 8080;

var server = app.listen(3000, function(){
  console.log('Our app is running on http://localhost:' + port);
});

app.use(express.static('public'));


// First, define our base classifier type (a multi-label classifier based on winnow):
var TextClassifier = limdu.classifiers.multilabel.BinaryRelevance.bind(0, {
    binaryClassifierType: limdu.classifiers.Winnow.bind(0, {retrain_count: 10})
});

// Now define our feature extractor - a function that takes a sample and adds features to a given features set:
var WordExtractor = function(input, features) {
    input.split(" ").forEach(function(word) {
        features[word]=1;
    });
};

// Initialize a classifier with the base classifier type and the feature extractor:
var intentClassifier = new limdu.classifiers.EnhancedClassifier({
    classifierType: TextClassifier,
    featureExtractor: WordExtractor
});

// Train and test:
intentClassifier.trainBatch([
    {input: "meat", output: "cow"},
    {input: "hamburger", output: "cow"},
    {input: "sausage", output: "cow"},
    {input: "hand", output: "cow"},
    {input: "arm", output: "cow"},
    {input: "banana", output:  "monkey"},
    ]);

//console.dir(intentClassifier.classify("meat"));  // ['apl','bnn']



var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './public/uploads');
    },
    filename: function(req, file, callback) {
        callback(null, 'userPhoto.jpg');
    }
});

var upload = multer({
    storage: storage
}).single('userPhoto');



console.log("Running");

// vision.detectFaces('./public/uploads/portrait.jpg', function(err, faces) {
//   //console.log(faces);
// });


var fpp = require('face-plus-plus');
fs = require('fs');
fpp.setServer('cn');
fpp.setApiKey('0ef14fa726ce34d820c5a44e57fef470');
fpp.setApiSecret('4Y9YXOMSDvqu1Ompn9NSpNwWQFHs1hYD');



var readFood = function(callback) {

    vision.detectLabels('./public/uploads/userPhoto.jpg', {
        verbose: true
    }, function(err, labels) {
        var d=[];

        for (var i = 0; i < labels.length; i++) {
          d.push(labels[i].desc);
        }
        console.log(labels);
        console.log(d);
        var desc = labels[0].desc;
        //console.log(desc);
        callback(desc);
    });

}

var analyzeImage = function(callback) {

    var parameters = {
        attribute: 'gender,age',
        img: {
            value: fs.readFileSync('./public/uploads/userPhoto.jpg'),
            meta: {
                filename: 'portrait.jpg'
            }
        }
    };

    // fpp.post('detection/detect', parameters, function(err, res) {
    //     if (err) {
    //         console.log('there was an error');
    //         console.log(err);
    //         callback(err);
    //     } else {
    //         console.log('thinking');
    //         try {
    //             console.log(res.face[0].attribute);
    //             console.log(res.face.length);
    //             callback(JSON.stringify(res.face));
    //         } catch (e) {
    //             console.log("there is no face");
    //             console.log(e);
    //             callback("there is no face");
    //         }
    //     }
    //
    // });
}


var getId = function(key, callback) {

    var options = {
        method: 'GET',
        url: 'http://www.freesound.org/apiv2/search/text/',
        qs: {
            query: key
        },
        headers: {
            authorization: 'Token 9bE1W4G33uOMoCJGQE4ilrbXY1GXhP4vkvCavVnR'
        }
    };

    request(options, function(error, response, body) {
        if (error) throw new Error(error);
        //var id=body.results[0].id;
        var result = JSON.parse(body);
        //console.log(result);

        var seed = Math.floor(Math.random() * result.results.length);
        var id = result.results[seed].id;
        callback(id);

        //console.log(id);
    });

}

var getSound = function(id, callback) {

    var options = {
        method: 'GET',
        url: 'http://www.freesound.org/apiv2/sounds/' + id + '/',
        headers: {
            'postman-token': '8276026c-6f2c-b0b4-fe22-6e94449c3801',
            'cache-control': 'no-cache',
            authorization: 'Token 9bE1W4G33uOMoCJGQE4ilrbXY1GXhP4vkvCavVnR'
        }
    };

    request(options, function(error, response, body) {
        if (error) throw new Error(error);
        var result = JSON.parse(body);
        var prev = result.previews['preview-lq-ogg'];
        //console.log(prev);
        callback(prev);
    });

}



app.post('/api/photo', function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            return res.end("Error uploading file.");
            console.log(err);
        } else {
            readFood(function(label) {
                var interpret=intentClassifier.classify(label)[0];
                console.log("what you see is ",label);
                console.log("what i understand is ",interpret);
                getId(interpret, function(soundId) {
                    console.log("the id is ",soundId);
                    getSound(soundId, function(soundPrev) {
                        console.log("Here you can hear the sound", soundPrev);
                        res.end(soundPrev);
                    });
                });
            });
        }
    });
});
