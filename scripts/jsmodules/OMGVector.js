'use strict';

export function rotX(vector, angle){
	let cos = Math.cos(angle);
	let sin = Math.sin(angle);
	return new Vec3(
		vector.x, 
		vector.y * cos - vector.z * sin,
		vector.y * sin + vector.z * cos)
};

export function rotY(vector, angle){
	let cos = Math.cos(angle);
	let sin = Math.sin(angle);
	return new Vec3(
		vector.x * cos + vector.z * sin,
		vector.y, 
		-vector.x * sin + vector.z * cos)
};

export function rotZ(vector, angle){
	let cos = Math.cos(angle);
	let sin = Math.sin(angle);
	return new Vec3(
		vector.x * cos - vector.y * sin,
		vector.x * sin + vector.y * cos,
		vector.z)
};

export function rotAxis(vec, angle, axis){
	let cos = Math.cos(angle);
	let sin = Math.sin(angle);
	return new Vec3(
		(cos + (1 - cos) * axis.x * axis.x) * vec.x +
		((1 - cos) * axis.x * axis.y - axis.z * sin) * vec.y +
  	((1 - cos) * axis.x * axis.z + axis.y * sin) * vec.z,

  	((1 - cos) * axis.x * axis.y + axis.z * sin) * vec.x +
  	(cos + (1 - cos) * axis.y * axis.y) * vec.y +
  	((1 - cos) * axis.y * axis.z - axis.x * sin) * vec.z,

  	((1 - cos) * axis.x * axis.z - axis.y * sin) * vec.x +
  	((1 - cos) * axis.y * axis.z + axis.x * sin) * vec.y +
  	(cos + (1 - cos) * axis.z * axis.z) * vec.z);
};

export function rotVec(vector, angles){
	let r = rotX(vector, angles.x);
	r = rotY(r, angles.y);
	return r = rotZ(r, angles.z);
};

export function unrotVec(vector, angles){
	let r = rotZ(vector, -angles.x);
	r = rotY(r, -angles.y);
	return r = rotX(r, -angles.z);
};

export function forwardY(angles){
	return rotVec(new Vec3(0., 1., 0.), angles);
};

export function forwardZ(angles){
	return rotVec(new Vec3(0., 0., 1.), angles);
};

export function forwardX(angles){
	return rotVec(new Vec3(1., 0., 0.), angles);
};