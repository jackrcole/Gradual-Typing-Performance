class Vector {
 constructor(public x: !number,
             public y: !number,
             public z: !number) {}
 times(k:  number): !Vector { return new Vector(k*this.x,k*this.y,k*this.z); }
 dot  (v:  Vector): !number { return this.x*v.x+this.y*v.y+this.z*v.z; }
 mag  (          ): !number { return +Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z); } 
}


class Camera {
 public fwd        ;
 constructor(public k         , v         ) {
  this.fwd = v.times(k);
 }
}
