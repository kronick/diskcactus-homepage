var SLIDER_CONFIG = {
    "autospeed": 1000,
    "swipespeed": 300,
    "interval": 5000,
    "gaptime": 50,
}

$(document).ready(function() {
    resizeVideos();
    buildAndSizeSliders();
});

$(window).on("resize", function() {
    resizeVideos();
    buildAndSizeSliders();
});

function resizeVideos() {
    $(".fullVideo").each(function(idx, vid) {
        var aspect = $(vid).width() / $(vid).height();
        $(vid).width($(window).width());
        $(vid).height($(window).width() / aspect);
    })
}

function buildAndSizeSliders() {
    $(".slider").each(function(idx, slider) {
        var items = $(slider).find(".item");

        // Calculate max width/height of the slider box for centering images later on
        var max_width = $(slider).width();
        var max_height = 0;
        items.each(function(idx, el) {
            max_height = Math.max(max_width / $(el).data("width") * $(el).data("height"), max_height);
        }) 

        var frame = $(slider).find(".frame")[0];
        if(frame == undefined) { 
            // Create frame div for cropping and placing
            var frame_el = $("<div class='frame'></div>");
            $(slider).append(frame_el);
            frame_el.width(max_width);
            frame_el.height(max_height);

            items.each(function(idx, el) {
                $(el).appendTo(frame_el);
                if(idx == 0) {
                    // Center and make active
                    var scale = $(slider).width() / $(el).data("width");
                    $(el).css({y: (frame_el.height() - ($(el).data("height") * scale)) / 2})
                    $(el).addClass("active");
                }
            });

            // Count the number of elements, create nav dots for each
            var nav_el = $("<div class='nav'></div>");
            for(var i=0; i<items.length; i++) {
                nav_el.append("<span class='dot" + (i == 0 ? " active" : "") + "'>•</span>");
            }
            $(slider).append(nav_el);

            startSliderAnimation(slider);

            // Make each nav dot clickable
            $(slider).find(".nav > .dot").on("click", function() {
                var slider_el = $(this).parents(".slider");
                if(slider_el.hasClass("animating")) return;

                // Find this dot's position in the parent nav el
                var dots = slider_el.find(".nav .dot");
                for(var i=0; i<dots.length; i++) {
                    if(dots[i] == this) {
                        goToSliderItem(slider_el, i, SLIDER_CONFIG.swipespeed);
                        pauseSliderAnimation(slider_el);
                        console.log("Going to " + i)
                        return;
                    }
                }
            });

            // Pause slider if an item is clicked
            $(slider).find(".frame").on("click", function() {
                pauseSliderAnimation(slider);
            })

            // Add swipe events to the frame
            $(slider).find(".frame").swipe({
                swipe: function(event, direction, distance, duration) {
                    var slider_el = $(this).parents(".slider");
                    if(slider_el.hasClass("animating")) return;

                    if(direction == "left") {
                        pauseSliderAnimation(slider_el);
                        goToSliderItem(slider_el, "+1", SLIDER_CONFIG.swipespeed);
                    }
                    else if(direction == "right") {
                        pauseSliderAnimation(slider_el);
                        goToSliderItem(slider_el, "-1", SLIDER_CONFIG.swipespeed);
                    }

                    return true;
                },
                threshold: 15,
                allowPageScroll: "auto",
            });

            // Add left/right nav regions
            frame_el.append("<div class='leftedge'><span class='dot'>👈</span></div>");
            frame_el.append("<div class='rightedge'><span class='dot'>👉</span></div>");
            $(slider).find(".leftedge").on("click", function() {
                if($(slider).hasClass("animating")) return;
                pauseSliderAnimation(slider);
                goToSliderItem(slider, "-1", SLIDER_CONFIG.swipespeed);
            });
            $(slider).find(".rightedge").on("click", function() {
                if($(slider).hasClass("animating")) return;
                pauseSliderAnimation(slider);
                goToSliderItem(slider, "+1", SLIDER_CONFIG.swipespeed);
            });

        }
        else {
            // Just resize the frame
            $(frame).width(max_width);
            $(frame).height(max_height);
        }
        
    })
}

function startSliderAnimation(el) {
    // Don't do this if there is already an interval timer running on this slider
    if($(el).data("interval") != undefined) return;

    var interval = window.setInterval(function() {
        if(!$(el).hasClass("paused"))
            goToSliderItem(el, "+1");
    }, SLIDER_CONFIG.interval);

    $(el).data("interval", interval);
}

function pauseSliderAnimation(el) {
    $(el).addClass("paused");
}

function goToSliderItem(el, idx, speed) {
    if(typeof(speed) === 'undefined') speed = SLIDER_CONFIG.autospeed;

    var currentIdx = getCurrentSliderItem(el);
    var items = $(el).find(".item");

    // Accept relative values
    if(idx[0] == "-")
        idx = currentIdx - parseInt(idx.substring(1, idx.length), 10);
    else if(idx[0] == "+")
        idx = currentIdx + parseInt(idx.substring(1, idx.length), 10)

    var overflow = underflow = false;
    if(idx >= items.length) {
        idx %= items.length;
        overflow = true;
    }
    while(idx < 0) {
        idx = items.length + idx;
        underflow = true;
    }
    
    if(idx == currentIdx) return;

    var newItem = $(items[idx]);
    var oldItem = $(items[currentIdx]);

    // Slide left or right
    $(el).addClass("animating");
    if((idx > currentIdx || overflow) && !underflow) {
        oldItem.transition({x: "-" + $(el).width() + "px"}, speed);
        newItem.css({x: "+" + $(el).width() + "px"});
    }
    else {
        oldItem.transition({x: "+" + $(el).width() + "px"}, speed);
        newItem.css({x: "-" + $(el).width() + "px"});
    }
    // Set next item y-height
    var scale = $(el).width() / newItem.data("width");
    newItem.css({y: ($($(el).find(".frame")[0]).height() - (newItem.data("height") * scale)) / 2})

    newItem.show();

    newItem.delay(SLIDER_CONFIG.gaptime).transition({x: 0}, speed, function() {
        // Update visibility after animation is complete
        $(this).siblings().removeClass("active");
        $(this).addClass("active");
        oldItem.hide();

        // Update nav dots
        var dots = $(el).find(".nav > .dot");
        dots.removeClass("active");
        $(dots[idx]).addClass("active");
        
        $(el).removeClass("animating");
    });

}

function getCurrentSliderItem(el) {
    // Loop through current slider container, find children items, stop at first one that has class="active"
    var items = $(el).find(".item");
    for(var i=0; i<items.length; i++) {
        if($(items[i]).hasClass("active")) {
            return i;
        }
    }
    return -1;
}
