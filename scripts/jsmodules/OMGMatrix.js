'use strict';

// matrix functions referenced from https://github.com/mrdoob/three.js/blob/dev/src/math/Matrix4.js

const deg2rad = Math.PI / 180;
const rad2deg = 180 / Math.PI;

function clamp(x, min, max){ return Math.max(Math.min(x, max), min) }

export default class Mat4 {
	constructor(b){
		if (b instanceof Mat4){
			this.elements = new Array(4);
			for(let i = 0; i < 4; i++){
				this.elements[i] = b.elements[i].slice();
			}
		}
		else if (arguments.length === 16){
			this.elements = new Array(4);
			for(let i = 0; i < 4; i++){
				this.elements[i] = new Array(4);
				for(let j = 0; j < 4; j++){
					this.elements[i][j] = arguments[i*4 + j];
				}
			}
		}
		else{
			this.elements = [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 1]
			];
		}
	}


	printElements(){
		for(let x = 0; x < 4; x++){
			let line = "";
			for(let y = 0; y < 4; y++){
				line += this.elements[x][y].toString() + " ";
			}
			console.log(line);
		}
	}


	multiply(right){
		let a = this.elements;
		let b = right.elements;
		let r = new Mat4();

		for (let x = 0; x < 4; x++){
			for(let y = 0; y < 4; y++){
				r.elements[x][y] = a[x][0] * b[0][y] + a[x][1] * b[1][y] + a[x][2] * b[2][y] + a[x][3] * b[3][y];
			}
		}
		return r;
	}


	static fromAxisAngle(axis, angle){
		let cos = Math.cos(angle);
		let sin = Math.sin(angle);
		let t = 1 - cos;
		let x = axis.x, y = axis.y, z = axis.z;
		let tx = t*x, ty = t*y;

		return new Mat4(
			tx * x + cos,      tx * y - sin * z,  tx * z + sin * y,  0,
			tx * y + sin * z,  ty * y + cos,      ty * z - sin * x,  0,
			tx * z - sin * y,  ty * z + sin * x,  t * z * z + cos,   0,
			0,                 0,                 0,                 1
		);
	}


	static fromPosition(pos){
		return new Mat4(
			1, 0, 0, pos.x,
			0, 1, 0, pos.y,
			0, 0, 1, pos.z,
			0, 0, 0, 1
		);
	}


	toPosition(pos){
		let m = this.elements;
		return new Vec3(m[0][3], m[1][3], m[2][3]);
	}


	static fromEuler(angles, order){
		let r = new Mat4();
		let e = angles.multiply(deg2rad);
		let sx = Math.sin(e.x), sy = Math.sin(e.y), sz = Math.sin(e.z);
		let cx = Math.cos(e.x), cy = Math.cos(e.y), cz = Math.cos(e.z);

		let o = order;
		if (typeof(o) !== "string")
			o = "XYZ";

		switch (o.toUpperCase()){

			case "XYZ":
			default:
				r.elements[0][0] = cy * cz;
				r.elements[0][1] = -cy * sz;
				r.elements[0][2] = sy;

				r.elements[1][0] = cx * sz + sx * cz * sy;
				r.elements[1][1] = cx * cz - sx * sz * sy;
				r.elements[1][2] = -sx * cy;

				r.elements[2][0] = sx * sz - cx * cz * sy;
				r.elements[2][1] = sx * cz + cx * sz * sy;
				r.elements[2][2] = cx * cy;
				break;

			case "YXZ":
				r.elements[0][0] = cy * cz + sy * sz * sx;
				r.elements[0][1] = sy * cz * sx - cy * sz;
				r.elements[0][2] = cx * sy;

				r.elements[1][0] = cx * sz;
				r.elements[1][1] = cx * cz;
				r.elements[1][2] = -sx;

				r.elements[2][0] = cy * sz * sx - sy * cz;
				r.elements[2][1] = sy * sz + cy * cz * sx;
				r.elements[2][2] = cx * cy;
				break;

			case "ZXY":
				r.elements[0][0] = cy * cz - sy * sz * sx
				r.elements[0][1] = -cx * sz;
				r.elements[0][2] = sy * cz + cy * sz * sx;

				r.elements[1][0] = cy * sz + sy * cz * sx;
				r.elements[1][1] = cx * cz;
				r.elements[1][2] = sy * sz - cy * cz * sx;

				r.elements[2][0] = -cx * sy;
				r.elements[2][1] = sx;
				r.elements[2][2] = cx * cy;
				break;

			case "ZYX":
				r.elements[0][0] = cy * cz;
				r.elements[0][1] = sx * cz * sy - cx * sz;
				r.elements[0][2] = cx * cz * sy + sx * sz;

				r.elements[1][0] = cy * sz;
				r.elements[1][1] = sx * sz * sy + cx * cz;
				r.elements[1][2] = cx * sz * sy - sx * cz;

				r.elements[2][0] = -sy;
				r.elements[2][1] = sx * cy;
				r.elements[2][2] = cx * cy;
				break;

			case "YZX":
				r.elements[0][0] = cy * cz;
				r.elements[0][1] = sx * sy - cx * cy * sz;
				r.elements[0][2] = sx * cy * sz + cx * sy;

				r.elements[1][0] = sz;
				r.elements[1][1] = cx * cz;
				r.elements[1][2] = -sx * cz;

				r.elements[2][0] = -sy * cz;
				r.elements[2][1] = cx * sy * sz + sx * cy;
				r.elements[2][2] = cx * cy - sx * sy * sz;
				break;
		}

		// right colur.elementsn
		r.elements[0][3] = 0;
		r.elements[1][3] = 0;
		r.elements[2][3] = 0;
		
		// bottor.elements row
		r.elements[3][0] = 0;
		r.elements[3][1] = 0;
		r.elements[3][2] = 0;
		r.elements[3][3] = 1;

		return r;
	}


	toEuler(order){
		let m = this.elements;
		let x,y,z;

		let o = order;
		if (typeof(o) !== "string")
			o = "XYZ";

		switch (o.toUpperCase()){
			case "XYZ":
			default:
				y = Math.asin(clamp(m[0][2], -1, 1));

				if (Math.abs(m[0][2] < 0.999999)){
					x = Math.atan2(-m[1][2], m[2][2]);
					z = Math.atan2(-m[0][1], m[0][0]);
				}
				else{
					x = Math.atan2(m[2][1], m[1][1]);
					z = 0;
				}
				break;
			case "YXZ":
				x = Math.asin(-clamp(m[1][2], -1, 1));

				if (Math.abs(m[1][2] < 0.999999)){
					y = Math.atan2(m[0][2], m[2][2]);
					z = Math.atan2(m[1][0], m[1][1]);
				}
				else{
					y = Math.atan2(-m[2][0], m[0][0]);
					z = 0;
				}
				break;
			case "ZXY":
				x = Math.asin(clamp(m[2][1], -1, 1));

				if (Math.abs(m[2][1] < 0.999999)){
					y = Math.atan2(-m[2][0], m[2][2]);
					z = Math.atan2(-m[0][1], m[1][1]);
				}
				else{
					y = 0;
					z = Math.atan2(m[1][0], m[0][0]);
				}
				break;
			case "ZYX":
				y = Math.asin(-clamp(m[2][0], -1, 1));

				if (Math.abs(m[2][0] < 0.999999)){
					x = Math.atan2(m[2][1], m[2][2]);
					z = Math.atan2(m[1][0], m[0][0]);
				}
				else{
					x = 0;
					z = Math.atan2(-m[0][1], m[1][1]);
				}
				break;
			case "YZX":
				z = Math.asin(clamp(m[1][0], -1, 1));

				if (Math.abs(m[1][0] < 0.999999)){
					x = Math.atan2(-m[1][2], m[1][1]);
					y = Math.atan2(-m[2][0], m[0][0]);
				}
				else{
					x = 0;
					y = Math.atan2(m[0][2], m[2][2]);
				}
				break;
			case "XZY":
				z = Math.asin(-clamp(m[0][1], -1, 1));

				if (Math.abs(m[0][1] < 0.999999)){
					x = Math.atan2(m[2][1], m[1][1]);
					y = Math.atan2(m[0][2], m[0][0]);
				}
				else{
					x = Math.atan2(-m[1][2], m[2][2]);
					y = 0;
				}
				break;
		}
		let euler = new Vec3(x, y, z);
		euler = euler.multiply(rad2deg);
		return euler;
	}
};
