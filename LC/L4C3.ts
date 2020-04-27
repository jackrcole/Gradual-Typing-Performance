class Vector {
 constructor(public x: !floatNumber,
             public y: !floatNumber,
             public z: !floatNumber) {}
 times(k: !number): !Vector { return new Vector(k*this.x,k*this.y,k*this.z); }
 dot  (v: !Vector): !number { return this.x*v.x+this.y*v.y+this.z*v.z; }
 mag  (          ): !number { return +Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z); } 
}

class Camera {
 public fwd: !Vector;
 constructor(public k: !number, v: !Vector) {
   this.fwd = v.times(k);
 }
}
