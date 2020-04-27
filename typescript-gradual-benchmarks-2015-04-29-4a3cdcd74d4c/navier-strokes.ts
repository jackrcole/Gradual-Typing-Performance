/**
 * Copyright 2012 the V8 project authors. All rights reserved.
 * Copyright 2009 Oliver Hunt <http://nerget.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
 
 module NavierStokes {
    var solver:!FluidField = null;
    var nsFrameCounter:!intNumber = 0;

    export function runNavierStokes()
    {
        solver.update();
        nsFrameCounter++;

        if(nsFrameCounter==15)
            checkResult(solver.getDens());
    }

    function checkResult(dens:!floatNumber[]) {
    
        var result:!intNumber = 0;
        for (var i=7000;i<7100;i++) {
            result+=~~((dens[i]*10));
        }

        if (result!=74) {
            //expected to fail because of the bug fix
            //            console.log("checksum failed: " + result);
        }
    }

    export function setupNavierStokes()
    {
        solver = new FluidField(null);
        solver.setResolution(128, 128);
        solver.setIterations(20);
        solver.setDisplayFunction(function(f:!Field){});
        solver.setUICallback(prepareFrame);
        solver.reset();
    }

    export function tearDownNavierStokes()
    {
        solver = null;
    }

    function addPoints(field:!Field) {
        var n:!floatNumber = 64;
        for (var i:!floatNumber = 1; i <= n; i++) {
            field.setVelocity(i, i, n, n);
            field.setDensity(i, i, 5);
            field.setVelocity(i, n - i, -n, -n);
            field.setDensity(i, n - i, 20);
            field.setVelocity(128 - i, n + i, -n, -n);
            field.setDensity(128 - i, n + i, 30);
        }
    }

    var framesTillAddingPoints:!intNumber = 0;
    var framesBetweenAddingPoints:!intNumber = 5;

    function prepareFrame(field:!Field)
    {
        if (framesTillAddingPoints == 0) {
            addPoints(field);
            framesTillAddingPoints = framesBetweenAddingPoints;
            framesBetweenAddingPoints++;
        } else {
            framesTillAddingPoints--;
        }
    }

    // Code from Oliver Hunt (http://nerget.com/fluidSim/pressure.js) starts here.
    export class FluidField {
        public update:() => void=null;
        public setDisplayFunction:(func:(field:!Field) => void) => void =null;
        public iterations:() => !intNumber=null;
        public setIterations:(i:!intNumber) => void =null;
        public setUICallback:(fun:(f:!Field)=>void) => void=null;
        public reset:() => void=null;
        public getDens:() => !floatNumber[]=null;
        public setResolution:(hRes:!floatNumber, wRes:!floatNumber) => boolean=null;

        constructor(canvas) {
            var iterations:!intNumber = 10;
            var visc:!floatNumber = 0.5;
            var dt:!floatNumber = 0.1;
            var dens:!floatNumber[] = null;
            var dens_prev:!floatNumber []=null;
            var u:!floatNumber[]=null;
            var u_prev:!floatNumber[]=null;
            var v:!floatNumber[]=null;
            var v_prev:!floatNumber[]=null;
            var width=0;
            var height=0;
            var rowSize=0;
            var size=0;
            var displayFunc: (f:!Field) => void = null;

            function addFields(x:!floatNumber[], s:!floatNumber[], dt:!floatNumber)
            {
                for (var i=0; i<size ; i++ ) x[i] += dt*s[i];
            }

            function set_bnd(b:!floatNumber, x:!floatNumber[])
            {
                if (b===1) {
                    for (var i:!intNumber = 1; i <= width; i++) {
                        x[i] =  x[i + rowSize];
                        x[i + (height+1) *rowSize] = x[i + height * rowSize];
                    }
                    //Used to be:
                    //for (var j:!intNumber = 1; i <= height; i++) {
                    for (var j:!intNumber = 1; j <= height; j++) { //NS:scoping rules caught this bug; fixed in latest version of V8 octane benchmarks
                        x[j * rowSize] = -x[1 + j * rowSize];
                        x[(width + 1) + j * rowSize] = -x[width + j * rowSize];
                    }
                } else if (b === 2) {
                    for (var i:!intNumber = 1; i <= width; i++) {
                        x[i] = -x[i + rowSize];
                        x[i + (height + 1) * rowSize] = -x[i + height * rowSize];
                    }

                    for (var j:!intNumber = 1; j <= height; j++) {
                        x[j * rowSize] =  x[1 + j * rowSize];
                        x[(width + 1) + j * rowSize] =  x[width + j * rowSize];
                    }
                } else {
                    for (var i:!intNumber = 1; i <= width; i++) {
                        x[i] =  x[i + rowSize];
                        x[i + (height + 1) * rowSize] = x[i + height * rowSize];
                    }

                    for (var j:!intNumber = 1; j <= height; j++) {
                        x[j * rowSize] =  x[1 + j * rowSize];
                        x[(width + 1) + j * rowSize] =  x[width + j * rowSize];
                    }
                }
                var maxEdge:!floatNumber = (height + 1) * rowSize;
                x[0]                 = 0.5 * (x[1] + x[rowSize]);
                x[maxEdge]           = 0.5 * (x[1 + maxEdge] + x[height * rowSize]);
                x[(width+1)]         = 0.5 * (x[width] + x[(width + 1) + rowSize]);
                x[(width+1)+maxEdge] = 0.5 * (x[width + maxEdge] + x[(width + 1) + height * rowSize]);
            }

            function lin_solve(b:!floatNumber, x:!floatNumber[], x0:!floatNumber[], a:!floatNumber, c:!floatNumber)
            {
                if (a === 0 && c === 1) {
                    for (var j=1 ; j<=height; j++) {
                        var currentRow:!intNumber = j * rowSize;
                        ++currentRow;
                        for (var i:!intNumber = 0; i < width; i++) {
                            x[currentRow] = x0[currentRow];
                            ++currentRow;
                        }
                    }
                    set_bnd(b, x);
                } else {
                    var invC:!floatNumber = 1 / c;
                    for (var k=0 ; k<iterations; k++) {
                        for (var j=1 ; j<=height; j++) {
                            var lastRow:!intNumber = (j - 1) * rowSize;
                            var currentRow:!intNumber = j * rowSize;
                            var nextRow:!intNumber = (j + 1) * rowSize;
                            var lastX:!floatNumber = x[currentRow];
                            ++currentRow;
                            for (var i:!intNumber=1; i<=width; i++)
                                lastX = x[currentRow] = (x0[currentRow] + a*(lastX+x[++currentRow]+x[++lastRow]+x[++nextRow])) * invC;
                        }
                        set_bnd(b, x);
                    }
                }
            }

            function diffuse(b:!floatNumber, x:!floatNumber[], x0:!floatNumber[], dt:!floatNumber)
            {
                var a:!floatNumber = 0;
                lin_solve(b, x, x0, a, 1 + 4*a);
            }

            function lin_solve2(x:!floatNumber[], x0:!floatNumber[], y:!floatNumber[], y0:!floatNumber[], a:!floatNumber, c:!floatNumber)
            {
                if (a === 0 && c === 1) {
                    for (var j=1 ; j <= height; j++) {
                        var currentRow:!intNumber = j * rowSize;
                        ++currentRow;
                        for (var i:!intNumber = 0; i < width; i++) {
                            x[currentRow] = x0[currentRow];
                            y[currentRow] = y0[currentRow];
                            ++currentRow;
                        }
                    }
                    set_bnd(1, x);
                    set_bnd(2, y);
                } else {
                    var invC:!floatNumber = 1/c;
                    for (var k=0 ; k<iterations; k++) {
                        for (var j=1 ; j <= height; j++) {
                            var lastRow:!intNumber = (j - 1) * rowSize;
                            var currentRow:!intNumber = j * rowSize;
                            var nextRow:!intNumber= (j + 1) * rowSize;
                            var lastX:!floatNumber = x[currentRow];
                            var lastY:!floatNumber = y[currentRow];
                            ++currentRow;
                            for (var i:!intNumber = 1; i <= width; i++) {
                                lastX = x[currentRow] = (x0[currentRow] + a * (lastX + x[currentRow] + x[lastRow] + x[nextRow])) * invC;
                                lastY = y[currentRow] = (y0[currentRow] + a * (lastY + y[++currentRow] + y[++lastRow] + y[++nextRow])) * invC;
                            }
                        }
                        set_bnd(1, x);
                        set_bnd(2, y);
                    }
                }
            }

            function diffuse2(x:!floatNumber[], x0:!floatNumber[], y:!floatNumber[], y0:!floatNumber[], dt:!floatNumber)
            {
                var a:!floatNumber = 0;
                lin_solve2(x, x0, y, y0, a, 1 + 4 * a);
            }

            function advect(b:!floatNumber, d:!floatNumber[], d0:!floatNumber[], u:!floatNumber[], v:!floatNumber[], dt:!floatNumber)
            {
                var Wdt0 = dt * width;
                var Hdt0 = dt * height;
                var Wp5 = width + 0.5;
                var Hp5 = height + 0.5;
                for (var j:!intNumber = 1; j<= height; j++) {
                    var pos:!intNumber = j * rowSize;
                    for (var i:!intNumber = 1; i <= width; i++) {
                        var x:!floatNumber = i - Wdt0 * u[++pos];
                        var y:!floatNumber = j - Hdt0 * v[pos];
                        if (x < 0.5)
                            x = 0.5;
                        else if (x > Wp5)
                            x = Wp5;
                        var i0:!intNumber = x | 0;
                        var i1:!intNumber = i0 + 1;
                        if (y < 0.5)
                            y = 0.5;
                        else if (y > Hp5)
                            y = Hp5;
                        var j0:!intNumber = y | 0;
                        var j1:!intNumber = j0 + 1;
                        var s1:!intNumber = x - i0;
                        var s0:!floatNumber = 1 - s1;
                        var t1:!intNumber = y - j0;
                        var t0:!floatNumber = 1 - t1;
                        var row1:!intNumber = j0 * rowSize;
                        var row2:!intNumber = j1 * rowSize;
                        d[pos] = s0 * (t0 * d0[i0 + row1] + t1 * d0[i0 + row2]) + s1 * (t0 * d0[i1 + row1] + t1 * d0[i1 + row2]);
                    }
                }
                set_bnd(b, d);
            }

            function project(u:!floatNumber[], v:!floatNumber[], p:!floatNumber[], div:!floatNumber[])
            {
                var h:!floatNumber = -0.5 / Math.sqrt(width * height);
                for (var j:!intNumber = 1 ; j <= height; j++ ) {
                    var row:!intNumber = j * rowSize;
                    var previousRow:!intNumber = (j - 1) * rowSize;
                    var prevValue:!intNumber = row - 1;
                    var currentRow:!intNumber = row;
                    var nextValue:!intNumber = row + 1;
                    var nextRow:!intNumber = (j + 1) * rowSize;
                    for (var i:!intNumber = 1; i <= width; i++ ) {
                        div[++currentRow] = h * (u[++nextValue] - u[++prevValue] + v[++nextRow] - v[++previousRow]);
                        p[currentRow] = 0;
                    }
                }
                set_bnd(0, div);
                set_bnd(0, p);

                lin_solve(0, p, div, 1, 4 );
                var wScale:!floatNumber = 0.5 * width;
                var hScale:!floatNumber = 0.5 * height;
                for (var k:!intNumber = 1; k<= height; k++ ) {
                    var prevPos:!intNumber = k * rowSize - 1;
                    var currentPos:!intNumber = k * rowSize;
                    var nextPos:!intNumber = k * rowSize + 1;
                    var prevRow:!intNumber = (k - 1) * rowSize;
                    var currentRow:!intNumber = k * rowSize;
                    var nextRow:!intNumber = (k + 1) * rowSize;

                    for (var i:!intNumber = 1; i<= width; i++) {
                        u[++currentPos] -= wScale * (p[++nextPos] - p[++prevPos]);
                        v[currentPos]   -= hScale * (p[++nextRow] - p[++prevRow]);
                    }
                }
                set_bnd(1, u);
                set_bnd(2, v);
            }

            function dens_step(x:!floatNumber[], x0:!floatNumber[], u:!floatNumber[], v:!floatNumber[], dt:!floatNumber)
            {
                addFields(x, x0, dt);
                diffuse(0, x0, x, dt );
                advect(0, x, x0, u, v, dt );
            }

            function vel_step(u:!floatNumber[], v:!floatNumber[], u0:!floatNumber[], v0:!floatNumber[], dt:!floatNumber)
            {
                addFields(u, u0, dt );
                addFields(v, v0, dt );
                var temp = u0; u0 = u; u = temp;
                // var
                temp = v0; v0 = v; v = temp;
                diffuse2(u,u0,v,v0, dt);
                project(u, v, u0, v0);
                // var
                temp = u0; u0 = u; u = temp;
                // var
                temp = v0; v0 = v; v = temp;
                advect(1, u, u0, u0, v0, dt);
                advect(2, v, v0, u0, v0, dt);
                project(u, v, u0, v0 );
            }
            var uiCallback = function(field:!Field) {};

            function queryUI(d:!floatNumber[], u:!floatNumber[], v:!floatNumber[])
            {
                for (var i:!intNumber = 0; i < size; i++)
                    u[i] = v[i] = d[i] = 0.0;
                uiCallback(new Field(rowSize, width, height, d, u, v));
            } 

            this.update = function () {
                queryUI(dens_prev, u_prev, v_prev);
                vel_step(u, v, u_prev, v_prev, dt);
                dens_step(dens, dens_prev, u, v, dt);
                displayFunc(new Field(rowSize, width, height, dens, u, v));
            }
            this.setDisplayFunction = function(func:(f:!Field) => void) {
                displayFunc = func;
            }

            this.iterations = function() { return iterations; }
            this.setIterations = function(iters:!intNumber) {
                if (iters > 0 && iters <= 100)
                    iterations = iters;
            }
            this.setUICallback = function(callback:(f:!Field) => void) {
                uiCallback = callback;
            }
            function reset()
            {
                rowSize = width + 2;
                size = (width+2)*(height+2);
                dens = new Array<!floatNumber>(size);
                dens_prev = new Array<!floatNumber>(size);
                u = new Array<!floatNumber>(size);
                u_prev = new Array<!floatNumber>(size);
                v = new Array<!floatNumber>(size);
                v_prev = new Array<!floatNumber>(size);
                for (var i:!intNumber = 0; i < size; i++)
                    dens_prev[i] = u_prev[i] = v_prev[i] = dens[i] = u[i] = v[i] = 0;
            }
            this.reset = reset;
            this.getDens = function()
            {
                return dens;
            }
            this.setResolution = function (hRes:!floatNumber, wRes:!floatNumber)
            {
                var res:!floatNumber = wRes * hRes;
                if (res > 0 && res < 1000000 && (wRes != width || hRes != height)) {
                    width = wRes;
                    height = hRes;
                    reset();
                    return true;
                }
                return false;
            }
            this.setResolution(64, 64);
        }
    }
    export class Field {
        public setDensity : (x:!floatNumber,y:!floatNumber,d:!floatNumber) => void = null;
        public getDensity : (x:!floatNumber, y:!floatNumber) => !floatNumber = null;
        public setVelocity : (x:!floatNumber, y:!floatNumber, xv:!floatNumber, yv:!floatNumber) => void = null;
        public getXVelocity : (x:!floatNumber, y:!floatNumber) => !floatNumber = null;
        public getYVelocity : (x:!floatNumber, y:!floatNumber) => !floatNumber = null;
        public width : () => !floatNumber = null;
        public height : () => !floatNumber = null;
        
        constructor(rowSize:!floatNumber, width:!floatNumber, height:!floatNumber, dens:!floatNumber[], u:!floatNumber[], v:!floatNumber[]) {
            this.setDensity = function(x:!floatNumber, y:!floatNumber, d:!floatNumber) {
                dens[(x + 1) + (y + 1) * rowSize] = d;
            }
            this.getDensity = function(x:!floatNumber, y:!floatNumber) {
                return dens[(x + 1) + (y + 1) * rowSize];
            }
            this.setVelocity = function(x:!floatNumber, y:!floatNumber, xv:!floatNumber, yv:!floatNumber) {
                u[(x + 1) + (y + 1) * rowSize] = xv;
                v[(x + 1) + (y + 1) * rowSize] = yv;
            }
            this.getXVelocity = function(x:!floatNumber, y:!floatNumber) {
                return u[(x + 1) + (y + 1) * rowSize];
            }
            this.getYVelocity = function(x:!floatNumber, y:!floatNumber) {
                return v[(x + 1) + (y + 1) * rowSize];
            }
            this.width = function() { return width; }
            this.height = function() { return height; }
        }
    }
}

declare var benchmark_fn;
benchmark_fn = function () {
    NavierStokes.setupNavierStokes();
    NavierStokes.runNavierStokes();
    NavierStokes.tearDownNavierStokes();
};

 
