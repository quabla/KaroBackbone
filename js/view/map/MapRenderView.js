/**
 * Created with JetBrains PhpStorm.
 * User: pdietrich
 * Date: 10.08.12
 * Time: 12:07
 * To change this template use File | Settings | File Templates.
 */

var MapRenderView = MapBaseView.extend({
    className: "mapRenderView",
    tagName: "canvas",
    initialize: function(options) {
        //init MapBaseView with creation of a settings model
        this.constructor.__super__.initialize.apply(this, arguments);
        _.bindAll(this, "render", "drawBorder", "drawField", "drawFlagField", "drawStandardField", "drawStartField", "renderCheckpoints");
        this.listenTo(this.model, "change:mapcode", this.render);
        this.listenTo(this.model, "change:field", this.renderFieldChange);
        this.listenTo(this.settings, "change:size change:border", this.render);
        this.listenTo(this.settings, "change:cpsVisited change:cpsActive", this.renderCheckpoints);
        this.palette = new MapRenderPalette();
        this.fieldColors = {};
        this.initFieldColors();
        this.listenTo(this.settings, "change:specles", this.render);
        this.stdFields = "LNOVWXYZ.";
    },
    renderCheckpoints: function() {
        //console.warn("RENDER CHECKPOINTS", new Date());
        //find cps
        var cps = this.model.getCpPositions();
        //console.log("CPs to render", cps);
        var me = this;

        //for each cp, drawField
        cps.forEach(function(pos) {
            var cp = pos.attributes;
            var f = me.model.getFieldAtRowCol(cp.row, cp.col);
            //console.log("Rendering CP", cp, f);
            me.drawField(cp.row, cp.col, f);
        });
    },
    renderFieldChange: function(e, a, b) {
        //console.info("Fieldchange only");
        var field = e.field;
        var r = e.r;
        var c = e.c;
        this.drawField(r, c, field);
    },
    render: function() {
        //console.warn("FULL RENDER", new Date())
        this.trigger("before:render");
        var map = this.model;
        this.size = this.settings.get("size");
        this.border = this.settings.get("border");
        this.specles = this.settings.get("specles");
        this.el.width = map.get("cols") * (this.fieldSize);
        this.el.height = map.get("rows") * (this.fieldSize);

        //console.log("FIELDSIZE", this.fieldSize);
        this.ctx = this.el.getContext("2d");

        this.ctx.fillStyle = this.palette.getRGB("grass");
        this.ctx.lineWidth = this.size;

        this.ctx.fillRect(0, 0, this.el.width, this.el.height);
        var me = this;
        for (var r = 0; r < map.get("rows"); r++) {
            for (var c = 0; c < map.get("cols"); c++) {
                var f = map.getFieldAtRowCol(r, c);
                me.drawField(r, c, f);
            }
        }
        this.trigger("render");
    },

    initFieldColors: function() {
        console.warn("Prepare a simple fg/bg field mapping - here or in MapPalette, to speed up");
    },
    drawField: function(r, c, field) {
        var x = c * (this.fieldSize);
        var y = r * (this.fieldSize);

        //faster than 1x1 rect
        //this.specle=this.ctx.getImageData(0,0,1,1);

        if (this.stdFields.indexOf(field) >= 0) {
            var fillColor = this.palette.getRGB(field);
            var specleColor = this.palette.getRGB(field + "specle");
            this.drawStandardField(x, y, fillColor, specleColor);
            return true;
        }

        //finish
        if (field == "F") {
            this.drawFlagField(x, y, this.palette.getRGB('finish1'), this.palette.getRGB('finish2'));
            return true;
        }

        //checkpoint
        if ((parseInt(field) == field)) {
            var intField = parseInt(field);
            if (this.settings.get("cpsActive")) {
                //console.log("Render CP", field);
                var fg = this.palette.getRGB('checkpoint' + field);

                if (field % 2) {
                    var bg = this.palette.getRGB('checkpointBgOdd');
                } else {
                    var bg = this.palette.getRGB('checkpointBgEven');
                }

                //check passed CPS
                //console.log(this.settings.get("cpsVisited"), field, this.settings.get("cpsVisited").indexOf(intField));
                if (this.settings.get("cpsVisited").indexOf(intField) >= 0) {
                    //change to rgba with .3
                    fg = fg.replace("rgb", "rgba").replace(")", ", 0.3)");
                    bg = bg.replace("rgb", "rgba").replace(")", ", 0.3)");
                    //draw street layer
                    this.drawField(r, c, "O");
                    //console.log("I drew");
                }
                this.drawFlagField(x, y, fg, bg);
            } else {
                this.drawField(r, c, "O");
            }
            return true;
        }

        //Start
        if (field == "S") {
            this.drawStartField(x, y, this.palette.getRGB('start1'), this.palette.getRGB('start2'));
            return true;
        }

        //Parc ferme
        if (field == "P") {
            this.drawStandardField(x, y, this.palette.getRGB('parc'), this.palette.getRGB('roadspecle'), false); //no specles
            return true;
        }

        //default for "unknown"
        //console.warn("MAL DEFAULT", field);
        this.drawStandardField(x, y, "rgb(0,0,0)", "rgb(0,0,0)", false);
    },

    drawStandardField: function(x, y, fg, specle) {
        this.ctx.fillStyle = fg;
        this.ctx.fillRect(x, y, this.size, this.size);

        //check optional param to force "no specles"
        var drawSpecles = this.specles;
        if (arguments[4] === false) {
            drawSpecles = false;
        }

        if (this.border > 0) {
            this.drawBorder(x, y, specle);
        }

        //no specles on tiny fields
        if (this.size <= 4) return true;

        if (drawSpecles) {
            var ctx = this.ctx
            var specleColor = specle;
            var size = this.size;
            var baseX = x;
            var baseY = y;
            setTimeout(function() {
                ctx.fillStyle = specleColor;
                for (var i = 0; i < 3; i++) {
                    var xr = Math.round(Math.random() * (size - 1));
                    var yr = Math.round(Math.random() * (size - 1));
                    ctx.fillRect(baseX + xr, baseY + yr, 1, 1);
                }
            }, 1);
        }
    },

    drawBorder: function(x, y, specle) {
        if (this.border < 1) return false;
        this.ctx.lineWidth = this.border;
        this.ctx.strokeStyle = specle;
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.size + this.border / 2, y);
        this.ctx.lineTo(x + this.size + this.border / 2, y + this.size + this.border / 2);
        this.ctx.lineTo(x, y + this.size + this.border / 2);
        this.ctx.stroke();
        this.ctx.closePath();
    },

    drawFlagField: function(x, y, c1, c2) {
        //console.log("Flagfield", c1, c2);
        this.ctx.fillStyle = c2;
        this.ctx.beginPath();
        this.ctx.rect(x, y, this.size, this.size);
        this.ctx.fill();

        if (this.size < 2) return;

        var factor = Math.round(this.size / 4);
        var sende = this.size / factor;

        for (var m = 0; m < sende; m++) {
            for (var n = 0; n < sende; n++) {
                if ((m + n) % 2 == 1) {
                    this.ctx.fillStyle = c1;
                    this.ctx.beginPath();
                    var xm = Math.round(x + m * factor);
                    var yn = Math.round(y + n * factor);
                    this.ctx.rect(xm, yn, factor, factor);
                    this.ctx.fill();
                }
            }
        }
        this.drawBorder(x, y, this.palette.getRGB('roadspecle'));
    },

    drawStartField: function(x, y) {
        this.ctx.fillStyle = this.palette.getRGB('start2');
        this.ctx.beginPath();
        //this.ctx.rect(x,y,this.size,this.size); //instead of border make larger
        var newSize = this.size + this.border;
        this.ctx.rect(x, y, newSize, newSize);
        this.ctx.fill();

        //fg square
        this.ctx.strokeStyle = this.palette.getRGB('start1');
        this.ctx.beginPath();
        this.ctx.rect(x + 0.3 * newSize, y + 0.3 * newSize, 0.4 * newSize, 0.4 * newSize);
        this.ctx.stroke();

        //imagerectangle($this->image, $x+0.3*$this->this.size, $y+0.3*$this->this.size,
        // $x+0.7*($this->this.size+border), $y+0.7*($this->this.size+border), $c1);

        //add border
        //$this->drawBorder($x,$y,$this->MapPalette['roadspecle']);
    }
});
