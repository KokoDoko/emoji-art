class App {
    private resolutionField: HTMLInputElement = document.getElementById("resolution")! as HTMLInputElement
    private sizeField: HTMLInputElement = document.getElementById("fontsize")! as HTMLInputElement
    private canvas: HTMLCanvasElement = document.getElementById("canvas")! as HTMLCanvasElement
    private context: CanvasRenderingContext2D = this.canvas.getContext('2d')!
    private emoji: HTMLDivElement = document.querySelector("emoji")! as HTMLDivElement
    private settings: HTMLDivElement = document.querySelector(".settings")! as HTMLDivElement
    private resolution: number = 80
    private fontsize : number = 16
    private chars = ["🌑","🌘","🌗","🌖","🌕"]

    constructor() {
        // webcam branch contains code to capture the webcam

        let uploadField = document.getElementById("files-upload")! as HTMLInputElement
        uploadField.addEventListener("change", (e) => {
            let files = (e.target as HTMLInputElement).files!
            if (files != null) {
                this.getLocalUrl(files[0])
            }
        })

        // removed from html - remote image in canvas is not allowed with getImageData :(
        /*
        let urlButton = document.getElementById("btn-url")! as HTMLInputElement
        urlButton.addEventListener("click", () => {
            let url = (document.getElementById("file-url")! as HTMLInputElement).value
            this.loadImage(url)
        })
        */

        window.addEventListener("resize", () => this.scaleEmoji())    
    }

    getLocalUrl(file: File) {
        this.settings.innerHTML = "Working..."

        let reader = new FileReader()

        reader.addEventListener("load", () => {
            let url: string = reader.result as string
            this.loadImage(url)
        })

        reader.readAsDataURL(file);
    }

    loadImage(url: string) {
        
        this.resolution = Number(this.resolutionField.value)
        this.fontsize = Number(this.sizeField.value)
        this.emoji.style.fontSize = this.fontsize + "px"

        let img = new Image()
        img.crossOrigin = "Anonymous"

        img.addEventListener("load", () => {
            // use the number of characters per row
            let res = this.resolution / img.width
            let w = img.width * res
            let h = img.height * res
            this.canvas.width = w
            this.canvas.height = h
            this.context.drawImage(img, 0, 0, w, h)
            this.grayScale()
            this.generateEmoji()
        })

        img.src = url
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
        let imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
        let data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
            let wavg = (0.299 * data[i]) + (0.587 * data[i + 1]) + (0.114 * data[i + 2])
            
            // value 0 - 254 translates to 0 - 4. Use math.min to catch the 255 value
            let num = Math.min(4, Math.floor(wavg/51))
            if(num < 0 || num > 4) {
                console.warn(num + " incorrect " + wavg)
            }
            
            if (i % (this.resolution*4) == 0) this.emoji.innerHTML += "<br>"
            this.emoji.innerHTML += this.chars[num]
        }

        this.scaleEmoji()
        this.settings.style.display = "none"
    }

    // scale the div to fit the window
    scaleEmoji(){
        let s = window.innerWidth/this.emoji.offsetWidth - 0.02
        this.emoji.style.transform = `scale(${s})`
    }
}

window.addEventListener("load", () => {
    new App()
})

// canvas docs
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas