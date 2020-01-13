'use strict';

// matrix function reference: https://github.com/mrdoob/three.js/blob/dev/src/math/Matrix4.js

const deg2rad = Math.PI / 180;
const rad2deg = 180 / Math.PI;

function clamp(x, min, max){ return Math.max(Math.min(x, max), min) }

export default class Mat4 {
	constructor(b, type, order){
		if (b instanceof Mat4){
			this.elements = new Array(4);
			for(let i = 0; i < 4; i++){
				this.elements[i] = b.elements[i].slice();
			}
		}
		else if (b instanceof Vec3 && type && type.toLowerCase() === "euler"){
			this.elements = new Array(4);
			for(let i = 0; i < 4; i++){
				this.elements[i] = new Array(4); 
			}
			this.fromEuler(b, order);
		}
		else if (b instanceof Vec3 && type && type.toLowerCase() === "position"){
			this.elements = new Array(4);
			for(let i = 0; i < 4; i++){
				this.elements[i] = new Array(4); 
			}
			this.fromPosition(b, order);
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
		let m = this.elements;
		let copy = new Mat4(this);
		let a = copy.elements;
		let b = right.elements;

		for (let x = 0; x < 4; x++){
			for(let y = 0; y < 4; y++){
				m[x][y] = a[x][0] * b[0][y] + a[x][1] * b[1][y] + a[x][2] * b[2][y] + a[x][3] * b[3][y];
			}
		}
		return this;
	}


	fromAxisAngle(axis, angle){
		let cos = Math.cos(angle);
		let sin = Math.sin(angle);
		let t = 1 - cos;
		let x = axis.x, y = axis.y, z = axis.z;
		let tx = t*x, ty = t*y;

		this.elements = [
		[tx * x + cos, tx * y - sin * z, tx * z + sin * y, 0],
		[tx * y + sin * z, ty * y + cos, ty * z - sin * x, 0],
		[tx * z - sin * y, ty * z + sin * x, t * z * z + cos, 0],
		[0, 0, 0, 1]
		]
	}


	fromPosition(pos){
		this.elements = [
			[1, 0, 0, pos.x],
			[0, 1, 0, pos.y],
			[0, 0, 1, pos.z],
			[0, 0, 0, 1]
		];

		return this;
	}


	toPosition(pos){
		let m = this.elements;
		return new Vec3(m[0][3], m[1][3], m[2][3]);
	}


	fromEuler(angles, order){
		// XYZ rotation order
		let m = this.elements;
		let e = angles.multiply(deg2rad);
		let sx = Math.sin(e.x), sy = Math.sin(e.y), sz = Math.sin(e.z);
		let cx = Math.cos(e.x), cy = Math.cos(e.y), cz = Math.cos(e.z);

		let o = order;
		if (typeof(o) !== "string")
			o = "XYZ";

		switch (o.toUpperCase()){

			case "XYZ":
			default:
				m[0][0] = cy * cz;
				m[0][1] = -cy * sz;
				m[0][2] = sy;

				m[1][0] = cx * sz + sx * cz * sy;
				m[1][1] = cx * cz - sx * sz * sy;
				m[1][2] = -sx * cy;

				m[2][0] = sx * sz - cx * cz * sy;
				m[2][1] = sx * cz + cx * sz * sy;
				m[2][2] = cx * cy;
				break;

			case "ZYX":
				m[0][0] = cy * cz;
				m[0][1] = sx * cz * sy - cx * sz;
				m[0][2] = cx * cz * sy + sx * sz;

				m[1][0] = cy * sz;
				m[1][1] = sx * sz * sy + cx * cz;
				m[1][2] = cx * sz * sy - sx * cz;

				m[2][0] = -sy;
				m[2][1] = sx * cy;
				m[2][2] = cx * cy;
				break;
		}

		// right column
		m[0][3] = 0;
		m[1][3] = 0;
		m[2][3] = 0;
		
		// bottom row
		m[3][0] = 0;
		m[3][1] = 0;
		m[3][2] = 0;
		m[3][3] = 1;

		return this;
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