class Physics {
	// Physics simulation class
	static update(go, dt) {
		// Update a game object given a delta t in seconds
		for (let i = 0; i < go.length; i++) {
			if(go[i].applyGravity){
				go[i].addForce(900*dt, 0, -1)
			}
			let collideIndex = go[i].gonnaCollideAny(go, dt)
			if(collideIndex==-1){
				go[i].move(dt)
			} else {
				go[i].collideWith(go[collideIndex])
			}
		}
	}
}