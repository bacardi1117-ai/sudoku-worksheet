import json,sys
import xml.etree.ElementTree as ET
from PIL import Image

image=Image.open(sys.argv[1]).convert('L')
data=json.loads(sys.argv[2])
page_width,page_height=595.28,841.89
scale_x=image.width/page_width
scale_y=image.height/page_height

def dark_box(x0,y0,x1,y1):
    box=image.crop((round(x0*scale_x),round(y0*scale_y),round(x1*scale_x),round(y1*scale_y)))
    return sum(pixel<155 for pixel in box.getdata())

assert dark_box(36,30,160,64)>25,'標題在實際渲染後不可見'
size=data['size'];board=data['board'];cell=board/size
x=data['x'];top=page_height-(data['y']+board)
for i,value in enumerate(data['values']):
    row,col=divmod(i,size)
    left=x+(col+.24)*cell;right=x+(col+.76)*cell
    upper=top+(row+.20)*cell;lower=top+(row+.80)*cell
    dark=dark_box(left,upper,right,lower)
    if value and dark<2:raise AssertionError(f'第 {i+1} 格提示數字 {value} 在圖片中不可見')
    if not value and dark>3:raise AssertionError(f'第 {i+1} 格空白格出現額外墨跡: {dark}')
print('rendered cells match')

if len(sys.argv)>3:
    found=[0]*(size*size)
    root=ET.parse(sys.argv[3]).getroot()
    for word in root.iter():
        if not word.tag.endswith('word') or not (word.text or '').strip().isdigit():continue
        cx=(float(word.attrib['xMin'])+float(word.attrib['xMax']))/2
        cy=(float(word.attrib['yMin'])+float(word.attrib['yMax']))/2
        if not (x<cx<x+board and top<cy<top+board):continue
        col=int((cx-x)/cell);row=int((cy-top)/cell)
        found[row*size+col]=int(word.text)
    assert found==data['values'],f'PDF 文字座標與預覽資料不同: {found} != {data["values"]}'
