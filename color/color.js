emoji_files = [
            "img/emoji/vibes.png",
            "img/emoji/star.png",
            "img/emoji/rainbow.png",
            "img/emoji/rainbow.png",
            "img/emoji/rainbow.png",
            "img/emoji/rainbow.png",
            "img/emoji/palm.png",
            "img/emoji/palm.png",
            "img/emoji/disk.png",
            "img/emoji/disk.png",
            "img/emoji/cherryblossom.png",
            "img/emoji/candy.png",
            "img/emoji/cactus.png",
            "img/emoji/cactus.png",
            "img/emoji/cactus.png",
            "img/emoji/artist.png",
            "img/emoji/artist.png",
            "img/emoji/artist.png",
        ];
        
        
var Particle = function(width, height) {
    this.x = randRange(0, width);
    this.y = randRange(0, height);
    this.src = randEl(emoji_files);
    this.range = randRange(500,2000);
    this.el = $("<img></img>");
    this.el.attr("src", this.src)
    this.el.css("left", this.x);
    this.el.css("top", this.y); 
    var w = $(window).width();
    this.el.css("width", (randRange(0.02, 0.1) * w) + "px");
    this.el.css("opacity", 0);
    this.el.css({"rotate": randRange(-10,10) + "deg"});
    
    var thisthis = this;
    window.setTimeout(function() {    
        thisthis.el.transition({"opacity": 0.5}, randRange(400,1000));
        }, randRange(400, 2000));
}

var particles = [];
$(document).ready(function() {
    var confettiContainer = $("#emojiconfetti");
    
    var n_particles = $(window).width() / 20;
    for(var i=0; i<n_particles; i++) {
        var p = new Particle(confettiContainer.width(), confettiContainer.height() * 2);
        particles.push(p);
        confettiContainer.append(p.el);
    }
    
    $(window).on("scroll", onScroll);
})


var ticking = false;
var lastScrollY = 0;

/*
function onResize () {
updateElements(win.pageYOffset);
}
*/

function onScroll (evt) {
    if(!ticking) {
        ticking = true;
        requestAnimFrame(updateElements);
        lastScrollY = $(document).scrollTop();
    }
    return false;
}

function updateElements() {
    var relativeY = (1.0 * lastScrollY) / ($("body").height() - $(window).height());
    for(var i=0; i<particles.length; i++) {
        //particles[i].el.velocity({"translateY": -relativeY * particles[i].range + "px"}, {duration: 0, easing: "linear"});
        //particles[i].el.css({"top": -relativeY * particles[i].range + particles[i].y + "px"});
        particles[i].el.css({"y": -relativeY * particles[i].range + "px"});
    }
    
    ticking = false;
}


// UTILITIES
// ---------

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function randRange(low, high) {
    return Math.random() * (high-low) + low;
}

function randEl(array) {
    return array[Math.floor(randRange(0, array.length))];
}