"use strict";
var App = (function () {
    function App() {
        var _this = this;
        this.resolutionField = document.getElementById("resolution");
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext('2d');
        this.emoji = document.querySelector("#emoji");
        this.settings = document.querySelector(".settings");
        this.resolution = 80;
        this.chars = ["🌑", "🌘", "🌗", "🌖", "🌕"];
        var printbutton = document.querySelector("#printbtn");
        var copybutton = document.querySelector("#copybtn");
        printbutton.addEventListener("click", function () { return window.print(); });
        copybutton.addEventListener("click", function () { return _this.copyEmoji(); });
        var uploadField = document.getElementById("files-upload");
        uploadField.addEventListener("change", function (e) {
            var files = e.target.files;
            if (files != null) {
                _this.getLocalUrl(files[0]);
            }
        });
        window.addEventListener("resize", function () { return _this.scaleEmoji(); });
    }
    App.prototype.getLocalUrl = function (file) {
        var _this = this;
        this.settings.innerHTML = "Working...";
        var reader = new FileReader();
        reader.addEventListener("load", function () {
            var url = reader.result;
            _this.loadImage(url);
        });
        reader.readAsDataURL(file);
    };
    App.prototype.loadImage = function (url) {
        var _this = this;
        this.resolution = Number(this.resolutionField.value);
        var img = new Image();
        img.crossOrigin = "Anonymous";
        img.addEventListener("load", function () {
            _this.setCanvas(img);
            _this.generateEmoji();
        });
        img.src = url;
    };
    App.prototype.setCanvas = function (img) {
        var res = this.resolution / img.width;
        var w = img.width * res;
        var h = img.height * res;
        this.canvas.width = w;
        this.canvas.height = h;
        this.context.drawImage(img, 0, 0, w, h);
    };
    App.prototype.grayScale = function () {
        var imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            var wavg = (0.299 * data[i]) + (0.587 * data[i + 1]) + (0.114 * data[i + 2]);
            data[i] = wavg;
            data[i + 1] = wavg;
            data[i + 2] = wavg;
        }
        this.context.putImageData(imageData, 0, 0);
    };
    App.prototype.generateEmoji = function () {
        this.emoji.innerHTML = "";
        var str = "";
        var imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            var wavg = (0.299 * data[i]) + (0.587 * data[i + 1]) + (0.114 * data[i + 2]);
            var num = Math.min(4, Math.floor(wavg / 51));
            if (num < 0 || num > 4) {
                console.warn(num + " incorrect " + wavg);
            }
            if (i > 0 && i % (this.resolution * 4) == 0) {
                str += "\n";
            }
            str += this.chars[num];
        }
        this.emoji.value = str;
        this.calculateRowsColumns();
        this.scaleEmoji();
        this.settings.style.display = "none";
        var print = document.querySelector(".print");
        print.style.display = "block";
    };
    App.prototype.calculateRowsColumns = function () {
        var col = this.resolution;
        var row = 2;
        while (this.emoji.scrollWidth > this.emoji.offsetWidth) {
            col++;
            this.emoji.cols = col;
        }
        while (this.emoji.scrollHeight > this.emoji.offsetHeight) {
            row++;
            this.emoji.rows = row;
        }
    };
    App.prototype.scaleEmoji = function () {
        console.log("scroll width " + this.emoji.scrollWidth);
        console.log("offset width " + this.emoji.offsetWidth);
        console.log("window width " + window.innerWidth);
        console.log("_____________________");
        var s = window.innerWidth / this.emoji.offsetWidth - 0.03;
        this.emoji.style.transform = "scale(" + s + ")";
    };
    App.prototype.copyEmoji = function () {
        this.emoji.focus();
        this.emoji.select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'Copied emoji to clipboard!' : 'Copying failed';
            alert(msg);
        }
        catch (err) {
            alert('Copying failed');
        }
    };
    return App;
}());
window.addEventListener("load", function () {
    new App();
});
