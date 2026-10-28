import { generateSudoku } from './modules/sudokuGenerator.js'
let generated = []
let exporting = false
const downloadButtons = ["worksheet","answers","combined"].map(type=>document.querySelector(`#download-${type}`))
function updateDownloadButtons(){downloadButtons.forEach(button=>button.disabled=!generated.length||exporting)}
import './style.css'

const applicableDifficulties = {
  6: ['入門', '簡單'],
  9: ['入門', '簡單', '中階', '困難'],
}

const form = document.querySelector('#worksheet-form')
const difficultySelect = document.querySelector('#difficulty')
const paperTitle = document.querySelector('#paper-title')
const paperFields = document.querySelector('#paper-fields')
const paperPuzzles = document.querySelector('#paper-puzzles')
const pageSummary = document.querySelector('#page-summary')

function selectedValue(name) {
  return form.elements[name].value
}

function updateDifficulties() {
  const current = difficultySelect.value
  difficultySelect.replaceChildren()

  for (const difficulty of applicableDifficulties[selectedValue('size')]) {
    const option = new Option(difficulty, difficulty)
    difficultySelect.add(option)
  }

  if (applicableDifficulties[selectedValue('size')].includes(current)) {
    difficultySelect.value = current
  } else {
    difficultySelect.value = applicableDifficulties[selectedValue('size')][0]
  }
}

function makeBlankBoard(size, values = []) {
  const board = document.createElement('div')
  board.className = 'blank-board'
  board.style.setProperty('--board-size', size)
  board.setAttribute('aria-label', '數獨題目')

  const boxWidth = size === 6 ? 3 : Math.sqrt(size)
  const boxHeight = size === 6 ? 2 : Math.sqrt(size)

  for (let index = 0; index < size * size; index += 1) {
    const cell = document.createElement('span')
    cell.textContent = values[index] || ''
    const column = index % size
    const row = Math.floor(index / size)
    if (column === size - 1) cell.classList.add('last-column')
    if (row === size - 1) cell.classList.add('last-row')
    if ((column + 1) % boxWidth === 0 && column < size - 1) cell.classList.add('box-right')
    if ((row + 1) % boxHeight === 0 && row < size - 1) cell.classList.add('box-bottom')
    board.append(cell)
  }

  return board
}

function updatePreview() {
  const size = Number(selectedValue('size'))
  const perPage = Number(selectedValue('perPage'))
  const title = form.elements.title.value.trim() || '數獨練習學習單'
  paperTitle.textContent = title
  pageSummary.textContent = `A4 · 每頁 ${perPage} 題`
  document.querySelector("#layout-warning").hidden = !(size === 9 && perPage === 6)

  paperFields.replaceChildren()
  for (const [name, label] of [
    ['showClass', '班級'],
    ['showName', '姓名'],
    ['showDate', '日期'],
  ]) {
    if (!form.elements[name].checked) continue
    const field = document.createElement('span')
    field.textContent = `${label}：____________`
    paperFields.append(field)
  }

  document.querySelector('.preview-pill').textContent = generated.length ? '已產生題目' : '版面示意 · 非實際題目'
  document.querySelector('.preview-note').textContent = generated.length ? `共 ${generated.length} 題，皆已驗證唯一解。` : '尚未產生題目。'
  updateDownloadButtons()
  paperPuzzles.replaceChildren()
  paperPuzzles.dataset.count = perPage
  for (let index = 0; index < (generated.length || perPage); index += 1) {
    const puzzle = document.createElement('div')
    puzzle.className = 'paper-puzzle'
    const caption = document.createElement('span')
    caption.className = 'puzzle-caption'
    caption.textContent = `第 ${index + 1} 題 · ${size} × ${size} · ${difficultySelect.value}`
    puzzle.append(caption, makeBlankBoard(size, generated[index]?.puzzle))
    paperPuzzles.append(puzzle)
  }
}

form.addEventListener('submit', (event) => event.preventDefault())
form.addEventListener('input', (event) => {
  if (['size', 'difficulty', 'quantity', 'seed'].includes(event.target.name)) generated = []
  if (event.target.name === 'size') { updateDifficulties(); form.querySelector(`input[name=perPage][value=${selectedValue('size') === '6' ? '4' : '2'}]`).checked=true }
  updatePreview()
})
form.addEventListener('change', (event) => {
  if (['size', 'difficulty', 'quantity', 'seed'].includes(event.target.name)) generated = []
  if (event.target.name === 'size') updateDifficulties()
  updatePreview()
})

updateDifficulties()
updatePreview()

const generateButton = document.querySelector('#generate-button')
generateButton.addEventListener('click', async () => {
 const error = document.querySelector('#error-message'), progress = document.querySelector('#progress-message')
 error.hidden = true
 if (!form.reportValidity()) return
 const seedInput = form.elements.seed
 if (!seedInput.value) seedInput.value = crypto.randomUUID()
 const options = {size:Number(selectedValue('size')),count:Number(selectedValue('quantity')),difficulty:difficultySelect.value,seed:seedInput.value}
 const controls = [...form.elements]; controls.forEach(c=>c.disabled=true)
 generated=[]; updatePreview(); progress.textContent='正在產生題目…'
 try {
 generated = await generateSudoku({...options,onProgress:(done,total,attempt)=>progress.textContent=`已產生 ${done} / ${total} 題（嘗試 ${attempt} 次）`})
 updatePreview()
 document.querySelector('.preview-pill').textContent='已產生題目'
 document.querySelector('.preview-note').textContent=`共 ${generated.length} 題，皆已驗證唯一解。Seed：${seedInput.value}`
 updateDownloadButtons()
 } catch (e) {error.textContent=e.message;error.hidden=false;progress.textContent='產生失敗'}
 finally {controls.forEach(c=>c.disabled=false)}
})

for (const [index,mode] of ['worksheet','answers','combined'].entries()) downloadButtons[index].addEventListener('click', async () => {
 if (!generated.length || exporting) return
 exporting=true;updateDownloadButtons()
 const error=document.querySelector('#error-message'),progress=document.querySelector('#progress-message')
 error.hidden=true;progress.textContent='正在準備 PDF…'
 try {
  const {exportPdf,layoutFor}=await import('./modules/pdfExporter.js')
  const perPage=Number(selectedValue('perPage')),size=generated[0].size
  const bytes=await exportPdf(generated,{mode,perPage,title:form.elements.title.value.trim(),showClass:form.elements.showClass.checked,showName:form.elements.showName.checked,showDate:form.elements.showDate.checked,onProgress:(done,total)=>progress.textContent=`PDF 處理進度 ${done} / ${total} 頁`})
  const date=new Date(),stamp=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('')
  const name=`${stamp}_${size}x${size}_${generated[0].difficulty}_${mode}.pdf`
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),link=document.createElement('a')
  link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)
  progress.textContent=`已下載 ${name}。可再次下載同一批題目。${layoutFor(perPage,size).warning?'提醒：9×9 每頁 6 題的棋盤較小。':''}`
 }catch(e){error.textContent=`PDF 匯出失敗：${e.message}`;error.hidden=false;progress.textContent='PDF 匯出失敗'}
 finally{exporting=false;updateDownloadButtons()}
})
