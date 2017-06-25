"use strict";function getMaze(a){var l=[],r=localStorage.getItem("maze");if(a&&r)l=JSON.parse(r);else{for(var L=function(a,r,L){l[a][r]=FLOOR,L&&(valid(a,r+1)&&l[a][r+1]===WALL&&walls.push([a,r+1,[a,r]]),valid(a,r-1)&&l[a][r-1]===WALL&&walls.push([a,r-1,[a,r]]),valid(a+1,r)&&l[a+1][r]===WALL&&walls.push([a+1,r,[a,r]]),valid(a-1,r)&&l[a-1][r]===WALL&&walls.push([a-1,r,[a,r]]))},t=0;t<CELL_WIDTH;t++){l[t]=[];for(var e=0;e<CELL_HEIGHT;e++)l[t][e]=WALL}for(L(currentX,currentY,!0);walls.length;){var n=walls[Math.floor(Math.random()*walls.length)],o=n[2],s=[o[0]+2*(n[0]-o[0]),o[1]+2*(n[1]-o[1])];valid(s[0],s[1])?l[s[0]][s[1]]===FLOOR?walls.splice(walls.indexOf(n),1):(L(n[0],n[1],!1),L(s[0],s[1],!0)):walls.splice(walls.indexOf(n),1)}for(var O=0;O<RANDOM_CELL_COUNT;){var i=1+Math.floor(Math.random()*CELL_WIDTH-2),u=1+Math.floor(Math.random()*CELL_HEIGHT-2);l[i]&&l[i][u]===WALL&&2===nearFloorCount(i,u,l)&&(l[i][u]=FLOOR,O++)}localStorage.setItem("maze",JSON.stringify(l))}return l}var valid=function(a,l){return a<CELL_WIDTH&&a>=0&&l<CELL_HEIGHT&&l>=0},walls=[],currentX=0,currentY=0,nearFloorCount=function(a,l,r){var L=0;return r[a]&&r[a][l+1]===FLOOR&&L++,r[a]&&r[a][l-1]===FLOOR&&L++,r[a+1]&&r[a+1][l]===FLOOR&&L++,r[a-1]&&r[a-1][l]===FLOOR&&L++,L};