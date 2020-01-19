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

export function interpAngle(angle1, angle2, percent){
	let a1 = [angle1.x % 360, angle1.y % 360, angle1.z % 360];
	let a2 = [angle2.x % 360, angle2.y % 360, angle2.z % 360];
	let diff = [];
	for (let i = 0; i < 3; i++){
		if (a1[i] < 0)
			a1[i] += 360;
		if (a2[i] < 0)
			a2[i] += 360;
		diff[i] = a2[i] - a1[i];
		if (diff[i] > 180)
			diff[i] -= 360;
		else if (diff[i] < -180)
			diff[i] += 360;
	}
	return new Vec3(a1[0] + diff[0] * percent, a1[1] + diff[1] * percent, a1[2] + diff[2] * percent);
};

export function interpPosition(pos1, pos2, percent){
	let x = pos1.x + (pos2.x - pos1.x) * percent;
	let y = pos1.y + (pos2.y - pos1.y) * percent;
	let z = pos1.z + (pos2.z - pos1.z) * percent;
	return new Vec3(x, y, z);
};