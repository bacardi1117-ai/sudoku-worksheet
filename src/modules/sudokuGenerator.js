import {solveSudoku} from './sudokuSolver.js'
import {gradeDifficulty} from './difficultyGrader.js'
export function canonicalKey(grid) {
 const n=Math.sqrt(grid.length),keys=[]
 for(let mirror=0;mirror<2;mirror++)for(let turns=0;turns<4;turns++){
 const transformed=Array(grid.length);for(let i=0;i<grid.length;i++){let r=Math.floor(i/n),c=i%n;if(mirror)c=n-1-c;for(let t=0;t<turns;t++)[r,c]=[c,n-1-r];transformed[r*n+c]=grid[i]}
 const names=new Map();keys.push(transformed.map(v=>{if(!v)return 0;if(!names.has(v))names.set(v,names.size+1);return names.get(v)}).join(''))
 }return keys.sort()[0]
}
function random(seed){let s=2166136261;for(const c of String(seed))s=Math.imul(s^c.charCodeAt(0),16777619);return ()=>{s+=0x6D2B79F5;let t=Math.imul(s^s>>>15,1|s);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296}}
export async function generateSudoku({size=9,count=1,seed='default',difficulty='入門',onProgress=()=>{}}={}) {
 if(![6,9].includes(size))throw new Error('只支援 6×6 與 9×9')
 if(!Number.isInteger(count)||count<1||count>20)throw new Error('每批必須為 1～20 題')
 if(!['入門','簡單'].includes(difficulty))throw new Error('此難度尚未支援')
 const rng=random(seed),shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a},batch=[],seen=new Set(),h=size/3
 for(let attempt=0;attempt<count*100&&batch.length<count;attempt++) {
 await new Promise(resolve=>setTimeout(resolve,0))
 const rows=shuffle(Array.from({length:3},(_,i)=>i)).flatMap(b=>shuffle(Array.from({length:h},(_,i)=>b*h+i))),cols=shuffle(Array.from({length:h},(_,i)=>i)).flatMap(b=>shuffle([0,1,2].map(i=>b*3+i))),digits=shuffle(Array.from({length:size},(_,i)=>i+1))
 const solution=rows.flatMap(r=>cols.map(c=>digits[(r*3+Math.floor(r/h)+c)%size])),puzzle=[...solution]
 for(const i of shuffle(Array.from({length:size*size},(_,i)=>i))){const old=puzzle[i];puzzle[i]=0;const grade=gradeDifficulty(puzzle);if(!grade.solved||(difficulty==='入門'&&grade.difficulty!=='入門')||solveSudoku(puzzle).length!==1)puzzle[i]=old}
 const grade=gradeDifficulty(puzzle),key=canonicalKey(puzzle)
 if(grade.difficulty!==difficulty||seen.has(key))continue
 seen.add(key);batch.push({puzzle,solution,size,difficulty,steps:grade.steps});onProgress(batch.length,count)
 }
 if(batch.length!==count)throw new Error('已達產生次數上限，請更換 Seed 或難度再試')
 return batch
}
