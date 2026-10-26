import './style.css'

const applicableDifficulties = {
  4: ['入門', '簡單'],
  6: ['入門', '簡單', '中等'],
  9: ['入門', '簡單', '中等', '困難', '專家'],
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

function makeBlankBoard(size) {
  const board = document.createElement('div')
  board.className = 'blank-board'
  board.style.setProperty('--board-size', size)
  board.setAttribute('aria-hidden', 'true')

  const boxWidth = size === 6 ? 3 : Math.sqrt(size)
  const boxHeight = size === 6 ? 2 : Math.sqrt(size)

  for (let index = 0; index < size * size; index += 1) {
    const cell = document.createElement('span')
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

  paperPuzzles.replaceChildren()
  paperPuzzles.dataset.count = perPage
  for (let index = 0; index < perPage; index += 1) {
    const puzzle = document.createElement('div')
    puzzle.className = 'paper-puzzle'
    const caption = document.createElement('span')
    caption.className = 'puzzle-caption'
    caption.textContent = `第 ${index + 1} 題 · ${size} × ${size} · ${difficultySelect.value}`
    puzzle.append(caption, makeBlankBoard(size))
    paperPuzzles.append(puzzle)
  }
}

form.addEventListener('submit', (event) => event.preventDefault())
form.addEventListener('input', (event) => {
  if (event.target.name === 'size') updateDifficulties()
  updatePreview()
})
form.addEventListener('change', (event) => {
  if (event.target.name === 'size') updateDifficulties()
  updatePreview()
})

updateDifficulties()
updatePreview()
