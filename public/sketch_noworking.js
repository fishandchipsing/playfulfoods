var vid;
var button;
var snapshots= [];
var img= new Image;


function setup() {
createCanvas(320,240);
background(50);


vid=createCapture(VIDEO);
vid.size(320,240);
//video.hide();

button=createButton('analyze');
button.mousePressed(snap);

}

function draw() {
  var w=80;
  var h=60;
  var x=0;
  var y=0;
  //image(vid,0,0,width,height);
  // for(var i=0;i<snapshots.length;i++){
  //   image(snapshots[i],x,y,w,h)
  //   x=x+w;
  //   if (x>width){
  //     x=0;
  //     y=y+h;
  //   }
  // }
}

function snap(){
  img=vid.loadPixels();
  //console.log(img);
  //console.log(img);
  image(vid,0,0,width,height);

  //var data=img.toDataURL("image/png");
  snapshots.push(vid.loadPixels());
  console.log(img);

}
