class Renderable {
	constructor(_c) {
		if(_c.v instanceof Promise){
			this.v = []
			_c.v.then((a)=>{
				this.v = JSON.parse(a)
			}).catch((a)=>{
				throw "Impossible de charger les vertices de "+this.name
			})
		}
		this.v = _c.v
		if(_c.t)
			this.t = _c.t
		else
			this.t = Renderable.scale(MathTools.getIdentityMatrix(), _c.p.w, _c.p.h), _c.p.x, window.innerHeight-_c.p.y
		this.vx = 0
		this.vy = 0
		this.x = _c.p.x
		this.y = _c.p.y
		this.boundWidth = _c.p.w
		this.boundHeight = _c.p.h
		this.applyGravity = true
		this.ground = false
		this.onGround = false
		this.displayBoundingBox = false
		this.opaque = true
		this.dynamicShadow = true
		this.name =''
		if(_c.c) {
			for(let k in _c.c) {
				if(this[k]!=undefined)
					this[k] = _c.c[k]
			}
		}

		if(this.opaque) {
			this.boundPoints = [
				{x: -0.5, y:0.5, f:1},
				{x: 0.5, y:0.5, f:-1},
				{x: 0.5, y:-0.5, f:1},
				{x: -0.5, y:-0.5, f:-1}
			]
		}
	}

	isOnGround() {
		return this.onGround
	}
	// gives transformation information (matrix + coords)
	tr() {
		return {
			x: this.x,
			y: this.y,
			t: this.t
		}
	}
	// 
	setPos(p) {
		this.x = p.x
		this.y = p.y
	}
	// Check if p is in bound of this
	inBounds(p) {
		if(p.x>this.x+this.boundWidth/2||p.x<this.x-this.boundWidth/2)
			return false
		if(p.y>this.y+this.boundHeight/2||p.y<this.y-this.boundHeight/2)
			return false
		return true
	}
	// collision not totally implemented
	collideWith(r) {
		if(r.ground){
			this.translate(0, (r.y+r.boundHeight/2)-(this.y-this.boundHeight/2))
			this.vy=0
			this.onGround = true
			return
		}
		throw "not implement"
	}
	// Check if in the next frame with current informations, it's gonna collide 
	gonnaCollide(r, dt) {
		if(this.ground)
			return false
		if(r.ground) {
			if(r.infinite) {
				if(this.y-(this.boundHeight/2)+this.vy*dt<r.y+r.boundHeight/2)
						return true
				else
					return false
			} else {
				return (r.inBounds({
					x: this.x-(this.boundWidth/2)+this.vx*dt,
					y: this.y-(this.boundHeight/2)+this.vy*dt
				})||r.inBounds({
					x: this.x+(this.boundWidth/2)+this.vx*dt,
					y: this.y-(this.boundHeight/2)+this.vy*dt
				}))
			}
		}
		/*console.log(r)
		console.log(this)
		throw "not implement"*/
	}
	// check gonna collide for the list of game objects
	gonnaCollideAny(go, dt) {
		for (let i = 0; i < go.length; i++) {
			if(go[i]==this)
				continue
			if(this.gonnaCollide(go[i], dt))
				return i
		}
		return -1
	}
	// move according to delta t value passed in seconds 
	move(dt) {
		this.translate(this.vx*dt, this.vy*dt)
		this.onGround = false
	}
	// Apply a force on this
	addForce(s, x, y) {
		this.vx+=x*s
		this.vy+=y*s
	}
	// Rotate object using its transformation matrix
	rotate(a) {
		this.t = Renderable.rotate(this.t, a)
	}
	// Scale object using its transformation matrix
	scale(x, y) {
		this.t = Renderable.scale(this.t, x, y)
	}
	// Translate object using its transformation matrix
	translate(x, y) {
		this.x+=x
		this.y+=y
	}
	// Same than before but using static methods
	static rotate(v, a) {
		return MathTools.matMul(v, [
			[Math.cos(a), -Math.sin(a), 0],
			[Math.sin(a), Math.cos(a), 0],
			[0, 0, 1]
		]);
	}

	static scale(v, x,y) {
		return MathTools.matMul(v, [
			[x, 0, 0],
			[0, y, 0],
			[0, 0, 1]
		]);
	}

	static translate(v, x, y) {
		v[0][2]+=x
		v[1][2]+=y
		return v
	}
	// Return vertices for a rectangle
	static rectVertices(_c) {
		return [
			-0.5, 0.5,
			 0.5, 0.5,
			 0.5,-0.5,
			-0.5,-0.5
		]
	}
	// Simplified constructor for a rectangle
	static rect(_c) {
		if(_c.c==undefined)
			_c.c = {}
		_c.c.dynamicShadow = false
		return {
			p: _c,
			v: Renderable.rectVertices(),
			c: _c.c
		} 
	}
	// Simplified constructor for a ground
	static ground(_c) {
		if(_c==undefined)
			_c={}
		if(_c.c==undefined)
			_c.c = {}
		if(_c.x==undefined)
			_c.x = 0
		if(_c.y==undefined)
			_c.y = 0
		if(_c.w==undefined)
			_c.w = window.innerWidth
		if(_c.h==undefined)
			_c.h = 100
		if(_c.infinite==undefined)
			_c.infinite = false
		_c.c.applyGravity = false
		_c.c.dynamicShadow = false
		_c.c.ground = true
		return {
			p: _c,
			v: Renderable.rectVertices(),
			c: _c.c
		} 
	}
	// Load vertices from a json file using promises
	static loadVertices(f) {
		return new Promise((resolve, reject) => {
			const req = new XMLHttpRequest();

			req.onreadystatechange = function(event) {
			    // XMLHttpRequest.DONE === 4
			    if (this.readyState === XMLHttpRequest.DONE) {
			        if (this.status === 200) {
			            resolve(this.responseText);
			        } else {
			            reject(this.statusText);
			        }
			    }
			};

			req.open('GET', Const.getURL(f.replace(" ", "_")), true);
			req.send(null);
		});
	}
}