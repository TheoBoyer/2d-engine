class Keyboard {
	// Class for handling keyboards events
	constructor() {
		this.keys = []
		for(let i=8; i<223; i++) {
			this.keys[i] = false
		}
		window.addEventListener('keyup', (k)=>{
			this.keys[k.keyCode] = false
		})
		window.addEventListener('keydown', (k)=>{
			this.keys[k.keyCode] = true
		})
	}

	isPressed(n) {
		return  this.keys[n]
	}
}