import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

const PAGE = {width:595.28,height:841.89}
const MARGIN=36
export function layoutFor(perPage,size) {
 if(![1,2,4,6].includes(perPage)||![6,9].includes(size))throw new Error('PDF 排版設定不合法')
 const cols=perPage<=2?1:2,rows=perPage/cols
 const top=PAGE.height-112,bottom=45,slotWidth=(PAGE.width-2*MARGIN)/cols,slotHeight=(top-bottom)/rows
 const board=Math.min(slotWidth-25,slotHeight-42,perPage===1?440:Infinity)
 return {cols,rows,top,bottom,slotWidth,slotHeight,board,cell:board/size,warning:size===9&&perPage===6}
}
function validateBatch(batch) {
 if(!Array.isArray(batch)||batch.length<1||batch.length>20)throw new Error('請先產生 1～20 題')
 const size=batch[0].size
 if(![6,9].includes(size)||batch.some(item=>item.size!==size||item.puzzle?.length!==size*size||item.solution?.length!==size*size))throw new Error('題目資料不完整')
 return size
}
async function loadFont(fontBytes) {
 if(fontBytes)return fontBytes
 const response=await fetch(`${import.meta.env.BASE_URL}fonts/NotoSansTC-worksheet.ttf`)
 if(!response.ok)throw new Error('中文字型載入失敗')
 return new Uint8Array(await response.arrayBuffer())
}
function drawText(page,font,text,x,y,size,color=rgb(.15,.25,.2)) {page.drawText(String(text),{x,y,size,font,color})}
function drawBoard(page,font,values,size,x,y,width) {
 const cell=width/size,h=size/3
 page.drawRectangle({x,y,width,height:width,borderWidth:2,borderColor:rgb(.1,.2,.15)})
 for(let i=1;i<size;i++) {
  page.drawLine({start:{x:x+i*cell,y},end:{x:x+i*cell,y:y+width},thickness:i%3===0?1.6:.45,color:rgb(.2,.27,.22)})
  page.drawLine({start:{x,y:y+i*cell},end:{x:x+width,y:y+i*cell},thickness:i%h===0?1.6:.45,color:rgb(.2,.27,.22)})
 }
 const textSize=Math.min(18,cell*.56)
 values.forEach((v,i)=>{if(!v)return;const text=String(v),r=Math.floor(i/size),c=i%size;drawText(page,font,text,x+c*cell+(cell-font.widthOfTextAtSize(text,textSize))/2,y+width-(r+1)*cell+(cell-textSize)/2+textSize*.12,textSize,rgb(.06,.12,.08))})
}
export async function exportPdf(batch,{mode='worksheet',perPage=2,title='數獨練習學習單',showClass=true,showName=true,showDate=true,fontBytes,onProgress=()=>{}}={}) {
 const size=validateBatch(batch)
 if(!['worksheet','answers','combined'].includes(mode))throw new Error('PDF 類型不合法')
 const layout=layoutFor(perPage,size),pdf=await PDFDocument.create()
 pdf.registerFontkit(fontkit)
 // Fontkit's PDF subset for this Noto Sans TC font maps text correctly but drops
 // most glyph outlines in rendered pages. Embed the validated full font instead.
 const font=await pdf.embedFont(await loadFont(fontBytes),{subset:false})
 pdf.setCreationDate(new Date('2000-01-01T00:00:00Z'));pdf.setModificationDate(new Date('2000-01-01T00:00:00Z'))
 const sections=mode==='combined'?['worksheet','answers']:[mode],pagesPerSection=Math.ceil(batch.length/perPage)
 let done=0
 for(const section of sections)for(let pageIndex=0;pageIndex<pagesPerSection;pageIndex++){
  const page=pdf.addPage([PAGE.width,PAGE.height]),answer=section==='answers'
  const heading=answer?`${title || '數獨練習學習單'} · 參考答案`:(title||'數獨練習學習單')
  const headingSize=Math.min(17,(PAGE.width-2*MARGIN)/Math.max(font.widthOfTextAtSize(heading,1),1)*.95)
  drawText(page,font,heading,MARGIN,PAGE.height-52,headingSize)
  if(!answer){let fields=[];if(showClass)fields.push('班級：____________');if(showName)fields.push('姓名：____________');if(showDate)fields.push('日期：____________');drawText(page,font,fields.join('     '),MARGIN,PAGE.height-76,9)}
  const first=pageIndex*perPage,last=Math.min(first+perPage,batch.length)
  for(let i=first;i<last;i++){
   const local=i-first,row=Math.floor(local/layout.cols),col=local%layout.cols,slotX=MARGIN+col*layout.slotWidth,slotTop=layout.top-row*layout.slotHeight
   const item=batch[i],caption=`第 ${i+1} 題  ·  ${size}×${size}  ·  ${item.difficulty}`
   drawText(page,font,caption,slotX+9,slotTop-14,9)
   const x=slotX+(layout.slotWidth-layout.board)/2,y=slotTop-32-layout.board
   drawBoard(page,font,answer?item.solution:item.puzzle,size,x,y,layout.board)
  }
  drawText(page,font,`${answer?'參考答案':'題目'}  ·  第 ${pageIndex+1} / ${pagesPerSection} 頁`,MARGIN,26,8)
  done++;onProgress(done,sections.length*pagesPerSection)
  await new Promise(resolve=>setTimeout(resolve,0))
 }
 return pdf.save({useObjectStreams:false})
}
export const exportWorksheetPdf=(batch,options)=>exportPdf(batch,{...options,mode:'worksheet'})
export const exportAnswersPdf=(batch,options)=>exportPdf(batch,{...options,mode:'answers'})
export const exportCombinedPdf=(batch,options)=>exportPdf(batch,{...options,mode:'combined'})
