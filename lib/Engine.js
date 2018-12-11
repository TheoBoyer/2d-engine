class Engine {
	constructor(_cnv, _fr=60) {
		this.cnv = Engine.formateCnv(_cnv);
		this.renderer = new Renderer(this.cnv.getContext('2d'));
		this.fr = _fr
		this.dfr = false
		this.go = []
		this.s = 1
		this.keyboard = new Keyboard()
		this.w = window.innerWidth
		this.h = window.innerHeight
		this.userUpdate = ()=>{return}
		this.mouse = {
			x:0,
			y:0
		}
		window.addEventListener('resize', ()=>{
			Engine.formateCnv(_cnv)
			//this.renderer.cameraTranslate((this.w-window.innerWidth)/2, (this.h-window.innerHeight)/2)
		})
		window.addEventListener('mousemove', (ev)=>{
			this.mouse = this.renderer.canvasToWorldCoordinates({
				x: ev.clientX,
				y: ev.clientY
			})
		})
	}
	// Rotate camera of the world on z axis by a radians
	cameraRotate(a) {
		this.renderer.camera.t = Renderable.rotate(this.renderer.camera.t, a)
	}
	// Zoom on the world by a scaling transformation
	cameraZoom(s) {
		this.renderer.camera.t = Renderable.scale(this.renderer.camera.t, s, s)
	}
	// Translate the camera by x and y
	cameraTranslate(x, y) {
		let m = this.renderer.canvasToWorldCoordinates({
			x: window.innerWidth/2 + x,
			y: window.innerHeight/2 - y
		})
		this.renderer.camera.x = m.x
		this.renderer.camera.y = m.y
	}
	// Change light intensity of the RENDERER
	setLightIntensity(n) {
		this.renderer.light.i = n
	}
	// Set no frame limit
	noFPSLimit() {
		this.fr = -1
	}
	// Change light size of the RENDERER
	setLightSize(n) {
		this.renderer.light.r = n
	}
	// Return an object with the name n
	objects(n) {
		for (let i = 0; i < this.go.length; i++) {
			if(this.go[i].name==n)
				return this.go[i]
		}
		return -1
	}
	// Launch the environnment
	start() {
		this.step(Date.now())
	}
	// Call all methods for one frame
	step(d) {
		let d1 = Date.now()
		let dt = this.s*(d1 - d)/1000

		this.renderer.render(
			this.go
		);

		Physics.update(this.go, dt)

		this.userUpdate(this, dt)

		if(this.dfr){
			this.renderer.displayFPS(this.s/dt)
		}

		let d2 = Date.now()
		setTimeout(()=>{
			this.step(d1)
		}, this.fr>0 ? (1000/this.fr)-d2+d1 : 0)
	}
	// Toggle the display mode of the framerate
	toggleFramerate() {
		this.dfr = !this.dfr
	}
	// toggle display mode of light
	toggleLight() {
		this.renderer.dl = this.dl?false:true
	}
	// change the light color
	setLightColor(r,g,b) {
		this.renderer.light.c = [r,g,b]
	}
	// Change the position of the light
	setLightPos(p) {
		if(isNaN(p.x)||isNaN(p.y))
			return
		this.renderer.light.x=p.x
		this.renderer.light.y=p.y
	}
	// Move the light in the world
	moveLight(x, y) {
		this.renderer.light.x+=x
		this.renderer.light.y+=y
	}
	// set the simulation speed
	setSpeed(s) {
		this.s = s
	}
	// add a gameobject
	add(o) {
		this.go.push(o)
		if(this.go[this.go.length-1].name=='')
			this.go[this.go.length-1].name='Shape '+(this.go.length-1)
	}
	// Give a personnal method of user to call when updating
	setUserUpdate(h) {
		this.userUpdate = h
	}
	// Formate the canvas to be as expected
	static formateCnv(_cnv) {
		_cnv.width = window.innerWidth;
		_cnv.height = window.innerHeight;
		_cnv.style.position = 'absolute';
		_cnv.style.top = '0px';
		_cnv.style.left = '0px';
		return _cnv;
	}
}