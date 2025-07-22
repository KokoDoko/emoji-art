class App {
    constructor() {
        this.resolutionField = document.getElementById("resolution")
        this.canvas = document.getElementById("canvas")
        this.context = this.canvas.getContext('2d')
        this.emoji = document.querySelector("#emoji")
        this.settings = document.querySelector(".settings")
        this.resolution = 80
        this.chars = ["🌑","🌘","🌗","🌖","🌕"]

        // print and copy buttons
        let printbutton = document.querySelector("#printbtn")
        let copybutton = document.querySelector("#copybtn")

        printbutton.addEventListener("click", () => window.print())

        copybutton.addEventListener("click", () => this.copyEmoji())

        // note: the webcam git branch contains code to capture the webcam

        let uploadField = document.getElementById("files-upload")
        uploadField.addEventListener("change", (e) => {
            let files = e.target.files
            if (files != null) {
                this.getLocalUrl(files[0])
            }
        })

        // removed from html - remote image in canvas is not allowed with getImageData :(
        /*
        let urlButton = document.getElementById("btn-url")
        urlButton.addEventListener("click", () => {
            let url = document.getElementById("file-url").value
            this.loadImage(url)
        })
        */

        
        window.addEventListener("resize", () => this.scaleEmoji())    
    }

    getLocalUrl(file) {
        this.settings.innerHTML = "Working..."

        let reader = new FileReader()

        reader.addEventListener("load", () => {
            let url = reader.result
            this.loadImage(url)
        })

        reader.readAsDataURL(file);
    }

    loadImage(url) {
        this.resolution = Number(this.resolutionField.value)
         
        let img = new Image()
        img.crossOrigin = "Anonymous"

        img.addEventListener("load", () => {
            this.setCanvas(img)
            // this.grayScale()
            this.generateEmoji()
        })

        img.src = url
    }

    setCanvas(img){
        // use the number of characters per row
        let res = this.resolution / img.width
        let w = img.width * res
        let h = img.height * res
        this.canvas.width = w
        this.canvas.height = h
        this.context.drawImage(img, 0, 0, w, h)
    }

    // this is not needed for emoji generation, but nice to show the grayscale tones of the loaded image
    grayScale(){
        let imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
        let data = imageData.data
   
        for (let i = 0; i < data.length; i += 4) {
            // average of red, green, blue
            // let avg = (data[i] + data[i + 1] + data[i + 2]) / 3

            // weighted average looks better
            let wavg = (0.299 * data[i]) + (0.587 * data[i + 1]) + (0.114 * data[i + 2])

            data[i] = wavg
            data[i + 1] = wavg
            data[i + 2] = wavg
        }
        this.context.putImageData(imageData, 0, 0)
    }

    generateEmoji(){
        this.emoji.innerHTML = ""
        let str = ""
        let imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
        let data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
            let wavg = (0.299 * data[i]) + (0.587 * data[i + 1]) + (0.114 * data[i + 2])
            
            // value 0 - 254 translates to 0 - 4. Use math.min to catch the 255 value
            let num = Math.min(4, Math.floor(wavg/51))
            if(num < 0 || num > 4) {
                console.warn(num + " incorrect " + wavg)
            }
            
            if (i > 0 && i % (this.resolution*4) == 0) { 
                str += "\n"
            }
            str += this.chars[num]
            
        }
        this.emoji.value = str

        this.calculateRowsColumns()

        this.scaleEmoji()
        this.settings.style.display = "none"

        let print = document.querySelector(".print")
        print.style.display = "block"
    }

    // calculate rows and columns for the textarea
    calculateRowsColumns(){
        let col = this.resolution
        let row = 2

        while (this.emoji.scrollWidth > this.emoji.offsetWidth) {
            col++
            this.emoji.cols = col
        }

        while (this.emoji.scrollHeight > this.emoji.offsetHeight) {
            row++
            this.emoji.rows = row
        }
    }

    // scale the div to fit the window
    scaleEmoji(){      

        // measure width of div that is too wide
        console.log("scroll width " + this.emoji.scrollWidth)
        console.log("offset width " + this.emoji.offsetWidth)
        console.log("window width " + window.innerWidth)
        console.log("_____________________")
        
        
       // BUG BUG BUG HEIGHT NOT TRANSFORMING!?!?
       let s = window.innerWidth/this.emoji.offsetWidth - 0.03
       this.emoji.style.transform = `scale(${s})`
    }

    copyEmoji() {
        this.emoji.focus()
        this.emoji.select()

        try {
            var successful = document.execCommand('copy')
            var msg = successful ? 'Copied emoji to clipboard!' : 'Copying failed'
            alert(msg)
        } catch (err) {
            alert('Copying failed')
        }
    }
}

window.addEventListener("load", () => {
    new App()
})

// canvas docs
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
