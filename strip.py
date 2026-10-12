import sys,glob
from PIL import Image,ImageDraw
d,out,scale,cols,n=sys.argv[1],sys.argv[2],float(sys.argv[3]),int(sys.argv[4]),int(sys.argv[5])
fs=sorted(glob.glob(d+'/*.jpg'))[:n];ims=[Image.open(f).convert('RGB') for f in fs];w=int(ims[0].width*scale);h=int(ims[0].height*scale)
rows=(len(ims)+cols-1)//cols;c=Image.new('RGB',(cols*(w+6),rows*(h+22)),'white');dr=ImageDraw.Draw(c)
for i,(f,im) in enumerate(zip(fs,ims)):x=(i%cols)*(w+6);y=(i//cols)*(h+22);c.paste(im.resize((w,h)),(x,y+20));dr.text((x+4,y+4),f.split('/')[-1].replace('.jpg','')+' ms',fill='black')
c.save(out)
