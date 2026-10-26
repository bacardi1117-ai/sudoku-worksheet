import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {PDFDocument} from 'pdf-lib'
import {generateSudoku} from '../src/modules/sudokuGenerator.js'
import {exportPdf,layoutFor} from '../src/modules/pdfExporter.js'
const fontBytes=readFileSync(new URL('../public/fonts/NotoSansTC-worksheet.ttf',import.meta.url))
for(const size of [6,9])test(`${size}×${size} PDF modes, counts and layouts`,async()=>{
 const full=await generateSudoku({size,count:20,seed:'pdf-fixture'})
 for(const count of [1,10,20])for(const perPage of [1,2,4,6]){
  const batch=full.slice(0,count),plan=layoutFor(perPage,size)
  assert.ok(plan.cell>0 && Math.abs(plan.board-plan.cell*size)<1e-8)
  assert.ok(plan.top-32-plan.board>=plan.bottom)
  for(const mode of ['worksheet','answers','combined']){
   const bytes=await exportPdf(batch,{mode,perPage,fontBytes,title:'繁體中文數獨學習單'})
   const pdf=await PDFDocument.load(bytes),pages=Math.ceil(count/perPage)*(mode==='combined'?2:1)
   assert.equal(pdf.getPageCount(),pages)
   for(const page of pdf.getPages())assert.deepEqual(page.getSize(),{width:595.28,height:841.89})
   const path=`/tmp/sudoku-pdf-test-${process.pid}.pdf`;writeFileSync(path,bytes)
   let text;try{text=execFileSync('pdftotext',[path,'-'],{encoding:'utf8'})}finally{unlinkSync(path)}
   assert.match(text,/繁體中文數獨學習單/)
   assert.equal((text.match(/第 1 題/g)||[]).length,mode==='combined'?2:1)
   assert.equal((text.match(/第 \d+ 題/g)||[]).length,count*(mode==='combined'?2:1))
   assert.equal((text.match(/參考答案/g)||[]).length,mode==='worksheet'?0:Math.ceil(count/perPage)*2)
  }
 }
})
test('PDF rejects missing batch and invalid layout',async()=>{
 await assert.rejects(exportPdf([],{fontBytes}));assert.throws(()=>layoutFor(3,9))
})
