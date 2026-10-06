import fs from "node:fs";
import zlib from "node:zlib";

const crcTable = Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(buf){let c=0xffffffff;for(const b of buf)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),len=Buffer.alloc(4),crc=Buffer.alloc(4);len.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([len,t,data,crc]);}
function insideRounded(x,y,s,r){const cx=Math.max(r,Math.min(s-r,x)),cy=Math.max(r,Math.min(s-r,y));return (x-cx)**2+(y-cy)**2<=r*r;}
function png(size,path){
  const rows=[];
  for(let y=0;y<size;y++){
    const row=Buffer.alloc(1+size*4);row[0]=0;
    for(let x=0;x<size;x++){
      let color=[16,13,29,255];
      const X=x/size*512,Y=y/size*512;
      if(!insideRounded(x,y,size,size*.225))color=[16,13,29,255];
      const body=((X-256)/143)**2+((Y-282)/146)**2<1 || (((X-256)/115)**2+((Y-190)/95)**2<1);
      if(body){const t=Math.max(0,Math.min(1,(X+Y-150)/650));color=[Math.round(255*(1-t)+173*t),Math.round(95*(1-t)+85*t),Math.round(86*(1-t)+255*t),255];}
      const hornL=((X-178)/28)**2+((Y-124)/54)**2<1&&Y<150, hornR=((X-334)/28)**2+((Y-124)/54)**2<1&&Y<150;
      if(hornL||hornR)color=[255,202,87,255];
      const eyeL=((X-209)/31)**2+((Y-257)/40)**2<1,eyeR=((X-303)/31)**2+((Y-257)/40)**2<1;
      if(eyeL||eyeR)color=[255,251,242,255];
      const pupilL=((X-217)/12)**2+((Y-270)/14)**2<1,pupilR=((X-295)/12)**2+((Y-270)/14)**2<1;
      if(pupilL||pupilR)color=[27,20,38,255];
      const mouth=Math.abs(Math.hypot((X-256)/1.08,Y-357)-66)<11&&Y<357;
      if(mouth)color=[27,20,38,255];
      const i=1+x*4;row[i]=color[0];row[i+1]=color[1];row[i+2]=color[2];row[i+3]=color[3];
    }rows.push(row);
  }
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;
  const out=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(Buffer.concat(rows),{level:9})),chunk("IEND",Buffer.alloc(0))]);
  fs.writeFileSync(path,out);
}
fs.mkdirSync("dist/icons",{recursive:true});
png(192,"dist/icons/icon-192.png");png(512,"dist/icons/icon-512.png");png(180,"dist/icons/apple-touch-icon.png");
