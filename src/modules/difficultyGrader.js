import {validate,units,candidates} from './sudokuSolver.js'

export const difficulties = {6:['入門','簡單'],9:['入門','簡單','中階','困難']}
const labels={'Naked Single':'入門','Hidden Single':'簡單','Locked Candidates':'中階','Naked Pairs':'困難'}

export function gradeDifficulty(puzzle) {
 const n=validate(puzzle),g=[...puzzle],steps=[],allUnits=units(n)
 const removed=Array.from({length:g.length},()=>new Set())
 while(g.includes(0)) {
  const choices=g.map((v,i)=>v?[]:candidates(g,i,n).filter(x=>!removed[i].has(x)))
  if(choices.some((x,i)=>!g[i]&&!x.length))return {difficulty:null,solved:false,steps}
  let move=null
  for(let i=0;i<g.length;i++)if(!g[i]&&choices[i].length===1){move={index:i,value:choices[i][0],technique:'Naked Single'};break}
  if(!move)for(const unit of allUnits){for(let v=1;v<=n;v++){if(unit.some(i=>g[i]===v))continue;const cells=unit.filter(i=>choices[i].includes(v));if(cells.length===1){move={index:cells[0],value:v,technique:'Hidden Single'};break}}if(move)break}
  if(move){g[move.index]=move.value;steps.push(move);continue}
  let elimination=null
  // A digit confined to one box within a row or column cannot appear
  // elsewhere in that box (claiming), and vice versa (pointing).
  const boxStart=2*n
  for(let u=0;u<allUnits.length&&!elimination;u++)for(let v=1;v<=n&&!elimination;v++){
   const cells=allUnits[u].filter(i=>choices[i].includes(v));if(cells.length<2)continue
   for(let target=0;target<allUnits.length&&!elimination;target++){
    if((u<boxStart)===(target<boxStart))continue
    if(!cells.every(i=>allUnits[target].includes(i)))continue
    const victims=allUnits[target].filter(i=>!allUnits[u].includes(i)&&choices[i].includes(v))
    if(victims.length)elimination={technique:'Locked Candidates',digit:v,unit:u,affected:victims}
   }
  }
  if(!elimination)for(let u=0;u<allUnits.length&&!elimination;u++){
   const groups=new Map()
   for(const i of allUnits[u])if(choices[i].length===2){const key=choices[i].join(',');groups.set(key,[...(groups.get(key)||[]),i])}
   for(const [key,pair] of groups)if(pair.length===2){const digits=key.split(',').map(Number),victims=allUnits[u].filter(i=>!pair.includes(i)&&digits.some(v=>choices[i].includes(v)))
    if(victims.length){elimination={technique:'Naked Pairs',digits,unit:u,pair,affected:victims};break}
   }
  }
  if(!elimination)return {difficulty:null,solved:false,steps}
  for(const i of elimination.affected)for(const v of elimination.digits||[elimination.digit])removed[i].add(v)
  steps.push(elimination)
 }
 const rank={'入門':0,'簡單':1,'中階':2,'困難':3}
 return {difficulty:steps.reduce((max,s)=>rank[labels[s.technique]]>rank[max]?labels[s.technique]:max,'入門'),solved:true,steps}
}
