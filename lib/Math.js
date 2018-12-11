class MathTools {
	// Maths stuff

	// Return identity matrix
	static getIdentityMatrix() {
		let s = [
			Const.verticeSize()+1,
			Const.verticeSize()+1
		]
		let mat = []
		for(let i=0; i<s[0]; i++) {
			mat[i] = []
			for(let j=0; j<s[1]; j++) {
				mat[i][j] = i==j ? 1 : 0;
			}
		}
		return mat
	}
	// gives ditance between two points
	static dist(x1, y1, x2, y2) {
		return Math.sqrt((x2-x1)**2+(y2-y1)**2)
	}
	// Return absolute value of x
	static abs(x) {
		return x<0 ? -x : x
	}
	// Return sign of x
	static signOf(x) {
		return x<0 ? -1 : 1
	}
	// Matrix multiplication for transformations
	static matMul(a, b) {
		let mat = []

		let ar=a.length, ac=a[0].length,
		br=b.length, bc=b[0].length

		if(ac!=br)
			throw "Matching problem during matmul"

		for(let i=0; i<ar; i++) {
			mat[i] = []
			for(let j=0; j<bc; j++) {
				mat[i][j]=0
				for(let k=0; k<ac; k++)
					mat[i][j] = mat[i][j] + (a[i][k] * b[k][j])
			}
		}
		return mat
	}
	// Custom method for inverse matrix multiplication
	static inverseMatMul(t,p) {
		return [
			[(t[1][1]*p[0][0] - t[0][1]*p[1][0]) / (t[1][1]*t[0][0] - t[0][1]*t[1][0])],
			[(t[0][0]*p[1][0] - t[1][0]*p[0][0]) / (t[1][1]*t[0][0] - t[0][1]*t[1][0])],
			[1]
		]
	}
}