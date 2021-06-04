// PLUGIN BELOW
(function($) {
    var opts = null;
    var contexts=[];
    var running=false;
    $.fn.redraw = function(){
        contexts.forEach(context => {
            context.beginPath();
            context.stroke();
        });
	}
	$.fn.setColor = function(color,size){
        opts.color = color;
        opts.brushSize = size;
        // $('#bgcanvas').style.borderBottomColor="coral";
	}
    $.fn.ribbon = function(options) {
        opts = $.extend({}, $.fn.ribbon.defaults, options);
        var canvas,container,brush,painters,unpainters,timers,mouseX,mouseY;
        return this.each(function() {
            //start functionality
            container = $(this).parent();
            canvas = this;
            // context = this.getContext('2d');
            contexts.push(this.getContext('2d'))
            
            canvas.style.cursor = 'crosshair';
            $(this).attr("width",opts.screenWidth).attr("height",opts.screenHeight);
            painters = [];
            unpainters = [];
            timers = [];
            brush = init(this.context);

            canvas.addEventListener('mousedown', onCanvasMouseDown, false);
            canvas.addEventListener("touchstart",onCanvasMouseDown1, false)

            // window.addEventListener('resize', onWindowResize, false);
            // onWindowResize(null);
		});
        function init() {
            mouseX = opts.screenWidth / 2;
            mouseY = opts.screenHeight / 2;
            for(var i = 0; i < opts.strokes; i++) {
                var ease = Math.random() * 0.05 + opts.easing;
                painters.push({
                    dx : opts.screenWidth / 2,
                    dy : opts.screenHeight / 2,
                    ax : 0,
                    ay : 0,
                    div : 0.1,
                    ease : ease
                });
            }
		}
		function update(context) {
			var i;
			context.lineWidth = opts.brushSize;
            if (!(opts.color[0] == 0 && opts.color[0] == 0 && opts.color[0] == 0)){
                context.globalAlpha = 0.05;
            }else{
                context.globalAlpha = 1;
            }
			context.strokeStyle = "rgba(" + opts.color[0] + ", " + opts.color[1] + ", " + opts.color[2] + ", " + opts.brushPressure + ")";

			for( i = 0; i < painters.length; i++) {
				context.beginPath();
				var dx = painters[i].dx;
				var dy = painters[i].dy;
				context.moveTo(dx, dy);
				var dx1 = painters[i].ax = (painters[i].ax + (painters[i].dx - mouseX) * painters[i].div) * painters[i].ease;
				painters[i].dx -= dx1;
				var dx2 = painters[i].dx;
				var dy1 = painters[i].ay = (painters[i].ay + (painters[i].dy - mouseY) * painters[i].div) * painters[i].ease;
				painters[i].dy -= dy1;
				var dy2 = painters[i].dy;
				context.lineTo(dx2, dy2);
				context.stroke();
			}
		}
        function destroy() {
			clearInterval(this.interval);
			running=false;
		}
        function  getMousePos(canvas, evt) {
            var rect = canvas.getBoundingClientRect(), // abs. size of element
                scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
                scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
        
            return {
                x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
                y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
            }
        }
        function strokestart(event) {
			if(!running){
				running=true;
			}
			var newCord = getMousePos(canvas,event);
			mouseX = newCord.x;
            mouseY = newCord.y;
			var i = 0, paintersLen = painters.length;
            for(i; i < paintersLen; i++) {
                painters[i].dx = mouseX;
                painters[i].dy = mouseY;
            }
        }
        function strokeEnd() {
            destroy();
        }

        function onCanvasMouseMove1(event) {
            event.preventDefault();
            onCanvasMouseMove(event.touches[0]);
        }

        function onCanvasMouseMove(event) {
            
			var newCord = getMousePos(canvas,event);
			mouseX = newCord.x;
			mouseY = newCord.y;
            
            id=parseInt(event.target.id.substring(5))
            
			update(contexts[id]);
        }
        // function onWindowResize() {
        //     opts.screenWidth = window.innerWidth;
        //     opts.screenHeight = window.innerHeight;
        // }
        function onCanvasMouseOut(event) {
            onCanvasMouseUp();
        }
        function onCanvasMouseUp(event) {
			strokeEnd();

            canvas.removeEventListener('mousemove', onCanvasMouseMove, false);
            canvas.removeEventListener('mouseup', onCanvasMouseUp, false);
            canvas.removeEventListener('mouseout', onCanvasMouseOut, false);

            canvas.removeEventListener("touchmove", onCanvasMouseMove1, false);
            canvas.removeEventListener('touchend', onCanvasMouseOut, false);
            canvas.removeEventListener('touchcancel', onCanvasMouseOut, false);
        }
        function onCanvasMouseDown1(event) {
            event.preventDefault();
            onCanvasMouseDown(event.touches[0]);
        }
        function onCanvasMouseDown(event) {
            strokestart(event);

            canvas.addEventListener('mouseup', onCanvasMouseUp, false);
            canvas.addEventListener('mouseout', onCanvasMouseOut, false);
            canvas.addEventListener('mousemove', onCanvasMouseMove, false);

            canvas.addEventListener("touchmove", onCanvasMouseMove1, false);
            canvas.addEventListener('touchend', onCanvasMouseOut, false);
            canvas.addEventListener('touchcancel', onCanvasMouseOut, false);
		}
    };
    $.fn.ribbon.defaults = {
        canvas : null,
        context : null,
        container : null,
        userAgent : $.browser,
        screenWidth : $(window).width(),
        screenHeight : $(window).height(),
        duration : 6000, // how long to keep the line there
        fadesteps : 10, // how many steps to fade the lines out by, reduce to optimize
        strokes : 15, // how many strokes to draw
        refreshRate : 30, // set this higher if performace is an issue directly affects easing
        easing : 0.7, // kind of "how loopy" higher= bigger loops
        brushSize : 4, // pixel width
        brushPressure : 1, // 1 by default but originally variable setting from wacom and touch device sensitivity
        color : [0, 50, 0], // color val RGB 0-255, 0-255, 0-255
        backgroundColor : [255, 255, 255], // color val RGB 0-255, 0-255, 0-25
        brush : null,
        mouseX : 0,
        mouseY : 0,
        i : 0
    };
})(jQuery);