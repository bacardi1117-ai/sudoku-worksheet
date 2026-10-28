import {test} from 'node:test'
import assert from 'node:assert/strict'
import {generateSudoku,canonicalKey} from '../src/modules/sudokuGenerator.js'
import {solveSudoku,validate} from '../src/modules/sudokuSolver.js'
import {gradeDifficulty} from '../src/modules/difficultyGrader.js'
for(const size of [6,9])for(const count of [1,10,20])test(`${size}: batch ${count}`,async()=>{
 const options={size,count,seed:'classroom'};const a=await generateSudoku(options),b=await generateSudoku(options)
 assert.deepEqual(a,b);assert.equal(a.length,count);assert.equal(new Set(a.map(x=>canonicalKey(x.puzzle))).size,count)
 for(const x of a){assert.equal(validate(x.solution),size);assert.ok(x.solution.every(Boolean));assert.deepEqual(solveSudoku(x.puzzle),[x.solution]);assert.ok(x.puzzle.every((v,i)=>!v||v===x.solution[i]));const g=gradeDifficulty(x.puzzle);assert.equal(g.difficulty,'入門');assert.ok(g.steps.length);assert.ok(g.steps.every(s=>s.technique==='Naked Single'))}
})
test('validation',async()=>{for(const count of [0,21,50,1.5,NaN])await assert.rejects(generateSudoku({count}));await assert.rejects(generateSudoku({size:4}));await assert.rejects(generateSudoku({difficulty:'專家'}));assert.equal(gradeDifficulty(Array(36).fill(0)).difficulty,null)})
test('hidden singles and equivalence',async()=>{for(const size of [6,9]){const [x]=await generateSudoku({size,difficulty:'簡單',seed:'hidden'});assert.ok(x.steps.some(s=>s.technique==='Hidden Single'));assert.equal(gradeDifficulty(x.puzzle).difficulty,'簡單');assert.equal(canonicalKey(x.puzzle),canonicalKey([...x.puzzle].reverse().map(v=>v?size+1-v:0)))}})
test('intermediate and hard require verified logical techniques',async()=>{
 for(const difficulty of ['中階','困難']){
  const options={size:9,count:1,seed:'trial',difficulty}
  const [item]=await generateSudoku(options)
  assert.deepEqual([item],await generateSudoku(options))
  assert.deepEqual(solveSudoku(item.puzzle),[item.solution])
  const grade=gradeDifficulty(item.puzzle)
  assert.equal(grade.difficulty,difficulty)
  assert.ok(grade.steps.some(step=>step.technique===(difficulty==='中階'?'Locked Candidates':'Naked Pairs')))
  assert.ok(item.puzzle.every((value,index)=>!value||value===item.solution[index]))
 }
 for(const difficulty of ['中階','困難'])await assert.rejects(generateSudoku({size:6,difficulty}),/尚未支援/)
})
