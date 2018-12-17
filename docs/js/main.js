"use strict";
var App = (function () {
    function App() {
        var _this = this;
        this.resolution = 80;
        this.fontsize = 16;
        this.chars = ["🌑", "🌘", "🌗", "🌖", "🌕"];
        this.resolutionField = document.getElementById("resolution");
        this.sizeField = document.getElementById("fontsize");
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext('2d');
        this.emoji = document.getElementsByTagName("emoji")[0];
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
        this.fontsize = Number(this.sizeField.value);
        this.emoji.style.fontSize = this.fontsize + "px";
        var img = new Image();
        img.crossOrigin = "Anonymous";
        img.addEventListener("load", function () {
            var res = _this.resolution / img.width;
            var w = img.width * res;
            var h = img.height * res;
            _this.canvas.width = w;
            _this.canvas.height = h;
            _this.context.drawImage(img, 0, 0, w, h);
            _this.grayScale();
            _this.generateEmoji();
        });
        img.src = url;
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
        var imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            var wavg = (0.299 * data[i]) + (0.587 * data[i + 1]) + (0.114 * data[i + 2]);
            var num = Math.min(4, Math.floor(wavg / 51));
            if (num < 0 || num > 4) {
                console.warn(num + " incorrect " + wavg);
            }
            if (i % (this.resolution * 4) == 0)
                this.emoji.innerHTML += "<br>";
            this.emoji.innerHTML += this.chars[num];
        }
        this.scaleEmoji();
    };
    App.prototype.scaleEmoji = function () {
        var s = window.innerWidth / this.emoji.offsetWidth - 0.02;
        this.emoji.style.transform = "scale(" + s + ")";
    };
    return App;
}());
window.addEventListener("load", function () {
    new App();
});
