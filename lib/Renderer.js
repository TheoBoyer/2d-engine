class Renderer {
	// Renderer contains method to draw game objects
	constructor(_ctx) {
		this.ctx = _ctx;
		this.camera = {
			x: 0,
			y: 0,
			t: MathTools.getIdentityMatrix()
		}
		this.light = {
			x: 0,
			y: 0,
			c: [255,255,255],
			r: 800,
			i: 0.3,
			o: false,
			t: MathTools.getIdentityMatrix()
		}
		this.dl = false
	}
	// Render an object
	renderObject(o) {
		if(o.v instanceof Promise)
			return
		this.ctx.beginPath()
		this.ctx.fillStyle = "#fff"
		this.ctx.strokeStyle = "#000"
		let vd = Renderer.getCoords(o.tr(), this.camera, {
			x:o.v[0],
			y:o.v[1]
		})
		
		this.ctx.moveTo(vd.x, vd.y)
		// Draw from vertices and transformation matrix
		for(let i=1; i<o.v.length/Const.verticeSize(); i++) {
			let v = Renderer.getCoords(o.tr(), this.camera, {
				x:o.v[Const.verticeSize()*i],
				y:o.v[Const.verticeSize()*i+1]
			})
			this.ctx.lineTo(v.x, v.y)
		}
		this.ctx.lineTo(vd.x, vd.y)
		this.ctx.fill()
		this.ctx.stroke()
		this.ctx.closePath()
		// Draw the hitbox used generally for testing
		if(o.displayBoundingBox){
			let v = Renderer.getCoords(o.tr(), this.camera, {
				x: 0,
				y: 0
			})
			this.ctx.beginPath()
			this.ctx.strokeStyle = "#f00"
			this.ctx.moveTo(v.x-o.boundWidth/2, v.y-o.boundHeight/2)
			this.ctx.lineTo(v.x+o.boundWidth/2, v.y-o.boundHeight/2)
			this.ctx.lineTo(v.x+o.boundWidth/2, v.y+o.boundHeight/2)
			this.ctx.lineTo(v.x-o.boundWidth/2, v.y+o.boundHeight/2)
			this.ctx.lineTo(v.x-o.boundWidth/2, v.y-o.boundHeight/2)
			this.ctx.stroke()
			this.ctx.closePath()
		}
	}
	// Draw the light
	renderLight() {
		let v = Renderer.getCoords(this.light, this.camera, {
			x: 0,
			y: 0
		})
		if(isNaN(v.x)||isNaN(v.x))
			return
		// If light is ocluded => no light
		if(this.light.o) {
			this.light.o = false
			this.ctx.beginPath()
			this.ctx.fillStyle = "#000"
			this.ctx.moveTo(0,0)
			this.ctx.lineTo(window.innerWidth,0)
			this.ctx.lineTo(window.innerWidth,window.innerHeight)
			this.ctx.lineTo(0,window.innerHeight)
			this.ctx.lineTo(0,0)
			this.ctx.fill()
			this.ctx.closePath()
			return
		}
		// This path draws all shadows not in range of light with rectangles
		this.ctx.beginPath()
		this.ctx.fillStyle = "#000"
		this.ctx.moveTo(0,0)
		this.ctx.lineTo(window.innerWidth,0)
		this.ctx.lineTo(window.innerWidth,v.y-this.light.r/2)
		this.ctx.lineTo(0,v.y-this.light.r/2)
		this.ctx.lineTo(0,0)
		this.ctx.moveTo(0,v.y+this.light.r/2)
		this.ctx.lineTo(window.innerWidth,v.y+this.light.r/2)
		this.ctx.lineTo(window.innerWidth,window.innerHeight)
		this.ctx.lineTo(0,window.innerHeight)
		this.ctx.lineTo(0,v.y+this.light.r/2)
		this.ctx.moveTo(0,0)
		this.ctx.lineTo(v.x-this.light.r/2,0)
		this.ctx.lineTo(v.x-this.light.r/2,window.innerHeight)
		this.ctx.lineTo(0,window.innerHeight)
		this.ctx.lineTo(0,0)
		this.ctx.moveTo(v.x+this.light.r/2,0)
		this.ctx.lineTo(window.innerWidth,0)
		this.ctx.lineTo(window.innerWidth,window.innerHeight)
		this.ctx.lineTo(v.x+this.light.r/2,window.innerHeight)
		this.ctx.lineTo(v.x+this.light.r/2,0)
		this.ctx.fill()
		this.ctx.closePath()
		let s = Const.lightSize()
		// Then we draw a radial gradient to fill remaining shadows
		this.ctx.beginPath()
		let linear = this.ctx.createRadialGradient(
			v.x, v.y, 0,
			v.x, v.y, this.light.r,
		)
		linear.addColorStop(0, 'rgba('+this.light.c[0]*this.light.i+','+this.light.c[1]*this.light.i+','+this.light.c[2]*this.light.i+','+(1-this.light.i)+')')
		linear.addColorStop(0.05, 'rgba('+this.light.c[0]*0.8*this.light.i+','+this.light.c[1]*0.8*this.light.i+','+this.light.c[2]*0.8*this.light.i+','+(1-this.light.i)+')')
		linear.addColorStop(0.5, 'rgba(0,0,0,1')
		linear.addColorStop(1, 'rgba(0,0,0,1')
		this.ctx.fillStyle = linear
		this.ctx.arc(v.x, v.y, this.light.r, 0, Math.PI*2)
		this.ctx.fill()
		this.ctx.closePath()
	}
	// Render the shadow of an object
	renderObjectShadow(o) {
		// Oclude light if necessary
		if(o.inBounds(this.light))
			this.light.o = true

		let dx = this.light.x-o.x
		let dy = this.light.y-o.y

		let pt = []
		// Draw dynamic shadow based on vertices
		if(o.dynamicShadow) {
			let a = -dy / dx

			let bmax = -Infinity, bmin = Infinity,
			imax = -1, imin = -1
			for(let i=0; i<o.v.length/Const.verticeSize(); i++) {
				let v = Renderer.getCoords(o.tr(), this.camera, {
					x: o.v[Const.verticeSize()*i],
					y: o.v[Const.verticeSize()*i+1]
				})
				let b = v.y - a * v.x
				if(b==-Infinity)
					b = -v.x
				if(b==Infinity)
					b = v.x
				if(b > bmax) {
					bmax = b
					imax = i
				} else if(b<bmin){
					bmin = b
					imin = i
				}
			}

			pt = [
				{
					x: o.v[Const.verticeSize()*imin],
					y: o.v[Const.verticeSize()*imin+1]
				},
				{
					x: o.v[Const.verticeSize()*imax],
					y: o.v[Const.verticeSize()*imax+1]
				}
			]
		} else {
			// Draw Shadow based on boundBox => less accurate but better performances
			for (let i = 0; i < o.boundPoints.length; i++) {
				let p = o.boundPoints[i]
				let ndx = dx - p.x*o.boundWidth
				let ndy = dy - p.y*o.boundHeight
				if(ndx>=0&&ndy*p.f>=0)
					pt.push(p)
				else if(ndx<=0&&ndy*p.f<=0)
					pt.push(p)
			}

			if(pt.length!=2)
				return
		}

		if(pt[0].x===undefined||pt[0].y===undefined||pt[1].x===undefined||pt[1].y===undefined)
			return

		let v1 = Renderer.getCoords(o.tr(), this.camera, pt[0])
		let v2 = Renderer.getCoords(o.tr(), this.camera, pt[1])

		let li = Renderer.getCoords(this.light, this.camera, {
			x: 0,
			y: 0
		})

		let a1 = (v1.y - li.y) / (v1.x - li.x)
		let a2 = (v2.y - li.y) / (v2.x - li.x)

		let b1 = v1.y - a1*v1.x
		let b2 = v2.y - a2*v2.x

		let l=100000

		let p = Renderer.getCoords(o.tr(), this.camera, {
			x: 0,
			y: 0
		})

		this.ctx.beginPath()
		this.ctx.globalAlpha = 1
		let linear = this.ctx.createRadialGradient(
			v1.x, v1.y, 0,
			v1.x, v1.y, 1000,
		)
		linear.addColorStop(0, 'rgba(0, 0, 0, 0.95)')
		linear.addColorStop(1, 'rgba(0, 0, 0, 0.1)')
		this.ctx.fillStyle = linear
		this.ctx.moveTo(v1.x, v1.y)
		this.ctx.lineTo(p.x, p.y)
		this.ctx.lineTo(v2.x, v2.y)
		if((v1.x < li.x&&v2.x > li.x)||(v2.x < li.x&&v1.x > li.x)){
			if(o.dynamicShadow) {
				this.ctx.lineTo(v2.x+l* -MathTools.signOf(li.x-v2.x), a2*(v2.x+l* -MathTools.signOf(li.x-v2.x))+b2)
				this.ctx.lineTo(v1.x+l* -MathTools.signOf(li.x-v1.x), a1*(v1.x+l* -MathTools.signOf(li.x-v1.x))+b2)
			} else {
				this.ctx.lineTo(v2.x-l* -MathTools.signOf(dy), a2*(v2.x-l* -MathTools.signOf(dy))+b2)
				this.ctx.lineTo(v1.x+l* -MathTools.signOf(dy), a1*(v1.x+l* -MathTools.signOf(dy))+b1)
			}
		} else {
			this.ctx.lineTo(v2.x+l* -MathTools.signOf(dx), a2*(v2.x+l* -MathTools.signOf(dx))+b2)
			this.ctx.lineTo(v1.x+l* -MathTools.signOf(dx), a1*(v1.x+l* -MathTools.signOf(dx))+b1)
		}
		this.ctx.lineTo(v1.x, v1.y)
		this.ctx.fill()
		this.ctx.globalAlpha = 1
		this.ctx.closePath()
	}
	// Render method taking all gameobjects to render then call appropriate methods in right order
	render(go) {
		this.ctx.beginPath()
		this.ctx.fillStyle = "#fff"
		this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
		this.ctx.closePath()

		for (let i = 0; i < go.length; i++){
			if(this.light.o)
				break;
			this.renderObjectShadow(go[i])
		}

		for (let i = 0; i < go.length; i++)
			this.renderObject(go[i])

		if(this.dl) this.renderLight()

	}
	// just draw the fps
	displayFPS(f) {
		this.ctx.beginPath()
		this.ctx.font = "10px Arial"
		this.ctx.fillStyle = "#00ff00"
		this.ctx.fillText('FPS: '+ Math.round(f),10,15);
		this.ctx.fill()
		this.ctx.closePath()
	}
	// give canvas coordinates based on transformation matrix, camera object, and position in the world
	static getCoords(t, c, p) {
		let m = MathTools.matMul(t.t, [
			[p.x],
			[p.y],
			[1]
		])
		m[0][0] += (t.x - c.x)
		m[1][0] += (t.y - c.y)
		m = MathTools.matMul(c.t, m)
		return {
			x: m[0][0]+window.innerWidth/2,
			y: window.innerHeight - (m[1][0]+window.innerHeight/2)
		}
	}
	// Gives back world coordinates of a given point on the canvas
	canvasToWorldCoordinates(p) {
		let m = MathTools.inverseMatMul(this.camera.t, [
			[p.x-window.innerWidth/2+this.camera.x],
			[window.innerHeight-(p.y+window.innerHeight/2)+this.camera.y]
		])
		return {
			x: m[0][0],
			y: m[1][0]
		}
	}
}