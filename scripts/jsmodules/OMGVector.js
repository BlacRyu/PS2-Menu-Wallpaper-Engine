'use strict';

export function rotX(vector, angle){
	return new Vec3(
		vector.x, 
		vector.y * Math.cos(angle) - vector.z * Math.sin(angle),
		vector.y * Math.sin(angle) + vector.z * Math.cos(angle))
}

export function rotY(vector, angle){
	return new Vec3(
		vector.x * Math.cos(angle) + vector.z * Math.sin(angle),
		vector.y, 
		-vector.x * Math.sin(angle) + vector.z * Math.cos(angle))
}

export function rotZ(vector, angle){
	return new Vec3(
		vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
		vector.x * Math.sin(angle) + vector.y * Math.cos(angle),
		vector.z)
}

export function rotVec(vector, angles){
	let r = rotX(vector, angles.x);
	r = rotY(r, angles.y);
	return r = rotZ(r, angles.z);
}

export function unrotVec(vector, angles){
	let r = rotZ(vector, -angles.x);
	r = rotY(r, -angles.y);
	return r = rotX(r, -angles.z);
}

export function forwardY(angles){
	return rotVec(new Vec3(0., 1., 0.), angles);
}

export function forwardZ(angles){
	return rotVec(new Vec3(0., 0., 1.), angles);
}

export function forwardX(angles){
	return rotVec(new Vec3(1., 0., 0.), angles);
}