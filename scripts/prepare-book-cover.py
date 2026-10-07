from pathlib import Path
from PIL import Image
import json
im=Image.open('public/shoes/book2-hero-source.png').convert('RGBA')
im=im.crop((int(im.width*.083),int(im.height*.353),int(im.width*.925),int(im.height*.79)))
pix=[]
for r,g,b,a in im.getdata():
 if min(r,g,b)>213 and max(r,g,b)-min(r,g,b)<17:a=0
 pix.append((r,g,b,a))
im.putdata(pix);im=im.crop(im.getchannel('A').getbbox());im.thumbnail((1500,1000));im.save('public/shoes/book2-hero.webp',quality=96)
w,h=im.size;rows=[]
for x in range(0,w,max(1,w//180)):
 ys=[y for y in range(h) if im.getpixel((x,y))[3]>200]
 if len(ys)>3:rows.append({'x':x/w,'top':min(ys)/h,'bottom':max(ys)/h})
Path('src/book2-profile.json').write_text(json.dumps({'source':'/shoes/book2-hero.webp','aspect':w/h,'rings':rows}),encoding='utf-8');print(im.size,len(rows))
