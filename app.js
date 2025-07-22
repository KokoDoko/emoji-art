const density = ["🌕", "🌖", "🌗", "🌘", "🌑"];

density.reverse();

let video;
let asciiDiv;
let vwidth = 48;
let vheight = 48;
let scaled = false;

function setup() {
    noCanvas();
    video = createCapture(VIDEO);
    video.size(vwidth, vheight);
    video.style('object-fit', 'cover'); // square cropping
    video.style('transform', 'scaleX(-1)'); // flip the video horizontally

    asciiDiv = createDiv();
    asciiDiv.class('ascii-art');
    asciiDiv.style('white-space', 'pre'); 
    asciiDiv.style('font-family', 'monospace'); 
    asciiDiv.style('line-height', '1'); 

    const helloDiv = createDiv();
    helloDiv.html('Click <a href="./photo/">here</a> to convert your own photo');
    helloDiv.class('photo-link');

    
    //Add resize listener
    window.addEventListener('resize', () => {
        if (scaled) scaleImage();
    });

}

function draw() {
    video.loadPixels();
    let asciiImage = "";
    for (let j = 0; j < vheight; j++) {
        for (let i = vwidth - 1; i >= 0; i--) { // Loop from right to left
            const pixelIndex = (i + j * vwidth) * 4; // Use vwidth instead of video.width
            const r = video.pixels[pixelIndex + 0];
            const g = video.pixels[pixelIndex + 1];
            const b = video.pixels[pixelIndex + 2];
            const avg = (r + g + b) / 3;
            const len = density.length - 1;
            const charIndex = floor(map(avg, 0, 255, 0, len));
            const c = density[charIndex];
            asciiImage += c; // Remove the <span> tags
        }
        asciiImage += "\n"; 
    }
    asciiDiv.html(asciiImage);
    
    // // Scale to fit viewport height (only once)
    if (!scaled && frameCount > 5) {
        scaleImage()
        scaled = true;
    }
}

function scaleImage(){
    const scaleHeight = window.innerHeight / asciiDiv.elt.offsetHeight;
    const scaleWidth = window.innerWidth / asciiDiv.elt.offsetWidth;
    const scale = Math.min(scaleHeight, scaleWidth); // Use the smaller scale to fit both dimensions
    asciiDiv.style('transform', `scale(${scale})`);
    asciiDiv.style('transform-origin', 'top left');
}


