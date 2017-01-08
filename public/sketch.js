var age, race, gender;

var intW = window.innerWidth;
var intH = window.innerHeight;



Webcam.set({
  width:1280,
  height:700,
    // crop_width: screen.width,


    image_format: 'jpeg',
    jpeg_quality: 90,
    upload_name: 'userPhoto'
});

Webcam.attach('#my_camera');

function getUpload(){
  var fd = new FormData(document.querySelector("#inputs"));
  $.ajax({
    url: "/api/photo",
    type: "POST",
    data: fd,
    processData: false,  // tell jQuery not to process the data
    contentType: false   // tell jQuery not to set contentType
  })
  .done(function( data ) {
      console.log( data );
      playSound(data);
  });

  ;

}


function take_snapshot() {
    $('#textIntro').html("Thinking");
    // take snapshot and get image data
    Webcam.snap(function(data_uri) {
        Webcam.upload(data_uri, '/api/photo', function(code, text) {
            // Upload complete!
            // 'code' will be the HTTP response code from the server, e.g. 200
            // 'text' will be the raw response content
            console.log(text);
            playSound(text);
            //var obj=JSON.parse(text);
            // //var p=obj[0].attribute;
            // faces=obj.length;
            // age=p.age.value;
            // race=p.race.value;
            // gender=p.gender.value;
            // //console.log(p.age.value);
            // //console.log(p.race.value);
            // //console.log(p.gender.value);
            // $('.faces').html(faces.toString());
            // $('.age').html(age.toString());
            // $('.gender').html(gender);
            // $('.race').html(race);
            // $('#response').html(text)
        });

        // display results in page
        // document.getElementById('results').innerHTML =
        //     '<img src="' + data_uri + '"/>';
    });


}

function playSound(url) {
    console.log(url)
    $('#textIntro').html("This!");
    //load the audio file for tofu
    var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', url);
    audioElement.setAttribute('autoplay', 'autoplay');
    audioElement.load()
    console.log('loading that wonderful food')

    audioElement.addEventListener("load", function() {
        audioElement.play();

        console.log('playing that wonderful food')
    }, true);
}
