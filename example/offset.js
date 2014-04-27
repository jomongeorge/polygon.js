var one = require('onecolor');
console.log(one);
var Polygon = require('../polygon');
var Vec2 = require('vec2');
var fc = require('fc');

var hsl = function(h,s,l) {
  return new one.HSL(h, s, l).hex();
};

var p = new Polygon([


  Vec2(-100, -100),
  Vec2(100, -100),
  Vec2(200, -200),
  Vec2(100, 0),


  Vec2(300, 0),
  Vec2(350, -100),
  Vec2(350, -200),
  Vec2(275, -300),
  Vec2(600, -300),

  Vec2(400, -200),
  Vec2(400, -150),


  Vec2(600, -100),
  Vec2(500, 200),
  Vec2(300, 100),


  Vec2(100, 200),
  Vec2(-100, 100),
  Vec2(-100, 0)
]);


var renderPoly = function(polygons, angle, dashed, width) {

  var a = Array.isArray(polygons) ? polygons : [polygons];

  a.forEach(function(poly) {
    poly.simplify && poly.simplify();

    if (!poly.points.length || !poly.point(0)) {
      return;
    }

    ctx.beginPath();
      ctx.moveTo(poly.point(0).x, poly.point(0).y);
      poly.each(function(l, c) {
        ctx.lineTo(c.x, c.y);
      });
    var origWidth = ctx.lineWidth;
    ctx.closePath();
    ctx.lineWidth = width || 1;

    ctx.strokeStyle = hsl(angle, .75, .65);
    ctx.stroke();
    ctx.lineWidth = origWidth;

    ctx.strokeStyle =  hsl(angle, 1, .65);
    poly.each(function(l, c) {
      ctx.beginPath();
        ctx.arc(c.x, c.y, (c.radius || .5), Math.PI*2, false);
        var orig = ctx.strokeStyle;

        if (c.color) {
          ctx.strokeStyle = c.color;
        }

        ctx.stroke();

      if (c.point && dashed !== false) {
        dashedLine(ctx, c, c.point, 4);
        ctx.stroke();
      }
      ctx.strokeStyle = orig;

    });
  });
};


var dashedLine = function (ctx, start, end, dashLen) {
  ctx.beginPath();
  if (dashLen == undefined) dashLen = 2;
  ctx.moveTo(start.x, start.y);

  var dX = end.x - start.x;
  var dY = end.y - start.y;
  var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
  var dashX = dX / dashes;
  var dashY = dY / dashes;

  var q = 0;
  while (q++ < dashes) {
    start.x += dashX;
    start.y += dashY;
    ctx[q % 2 == 0 ? 'moveTo' : 'lineTo'](start.x, start.y);
  }
  ctx[q % 2 == 0 ? 'moveTo' : 'lineTo'](start.x, start.y);
};



var ctx = fc(function() {
  var w = ctx.canvas.width;
  var h = ctx.canvas.height;

  ctx.fillStyle = '#111115';
  ctx.fillRect(0, 0, w, h);

  ctx.save();
    ctx.translate(w/2 - 200, h/2 - 200);
    ctx.scale(1, -1);

    ctx.beginPath()
    ctx.moveTo(-5, -5);
    ctx.lineTo(5, 5);
    ctx.closePath();
    ctx.strokeStyle = "blue"
    ctx.stroke();

    ctx.beginPath()
    ctx.moveTo(-5, 5);
    ctx.lineTo(5, -5);
    ctx.closePath();
    ctx.strokeStyle = "blue"
    ctx.stroke();

    if (0) {
      // TODO: when you bump this up past 200 we start seeing issues
      //       I think we need to cap the ends of really long lines
      //       and completely implement pruneSelfIntersections

      for (var i=10; i<100; i+=1) {
        renderPoly(p.offset(i).simplify().pruneSelfIntersections(), i*.002, false);
      }

      renderPoly(p.offset(10), .5);
      renderPoly(p.offset(5), .5);
      renderPoly(p.offset(20), .7);

      for (var i = -10; i>-100; i -= 10) {
        var offset = p.offset(i, true);
        var pruned = offset.clone().simplify().pruneSelfIntersections();
        if (pruned.length) {
          pruned.forEach(function(poly, j) {
            renderPoly(poly, i*.001 + j * .0001, false)
          });
        } else {
          renderPoly(offset, i*.001 , false);
        }
      }
    } else {
      var offset = p.offset(80, true);
      for (var i = -60; i<-50; i += 10) {
        if (i === 0) { continue; }
        var o = p.offset(i, true).simplify();
        var selfi = o.pruneSelfIntersections()

        selfi.forEach(function(s, j) {
          renderPoly(selfi, i/100 - j/selfi.length, false);
        })

        // if (!selfi.length || (selfi.length === 1 && selfi[0].points.length === 1)) {
        //   console.log('here');
        //   renderPoly(o, .4, false);
        // } else {
        //   if (selfi.length === 1) {
        //          console.log(selfi);
        //   }
        //   renderPoly(selfi, i/200);
        // }
      }

      // var delta = -90;

      // renderPoly(p.offset(delta, true), .01)

      // var isects = p.offset(delta, true).simplify().selfIntersections();
      // isects.points.forEach(function(point) {
      //   point.color = "red";
      //   point.radius = 5;
      // });

      // renderPoly(p.offset(delta, true).simplify().pruneSelfIntersections(), .6)
      // //renderPoly(o.simplify().pruneSelfIntersections(), .2)
      // //renderPoly(offset.simplify().pruneSelfIntersections(), .2);
    }

    renderPoly(p, 0, false, 3);

    // renderPoly(p.offset(-60, true).pruneSelfIntersections()[0], .2);


    // for (var i = -10; i>-100; i -= 10) {
    //   renderPoly(p.offset(i, true), .2);
    // }

  ctx.restore();

}, false);
