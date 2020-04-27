class Vector {
 constructor(public x       ,
             public y       ,
             public z       ) {}
 times(k         )          { return new Vector(k*this.x,k*this.y,k*this.z); }
 dot  (v         )          { return this.x*v.x+this.y*v.y+this.z*v.z; }
 mag  (          )          { return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z); } 
}
class Camera {
 public fwd: !Vector;
 constructor(public k: !number, v: !Vector) {
   this.fwd = v.times(k);
 }
}
