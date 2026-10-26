import {validate,units,candidates} from './sudokuSolver.js'
export function gradeDifficulty(puzzle) {
 const n=validate(puzzle),g=[...puzzle],steps=[]
 while(g.includes(0)) {
  const choices=g.map((v,i)=>v?[]:candidates(g,i,n));let move=null
  for(let i=0;i<g.length;i++)if(!g[i]&&choices[i].length===1){move={index:i,value:choices[i][0],technique:'Naked Single'};break}
  if(!move)for(const unit of units(n)){for(let v=1;v<=n;v++){const cells=unit.filter(i=>choices[i].includes(v));if(cells.length===1){move={index:cells[0],value:v,technique:'Hidden Single'};break}}if(move)break}
  if(!move)return {difficulty:null,solved:false,steps}
  g[move.index]=move.value;steps.push(move)
 }
 return {difficulty:steps.some(s=>s.technique==='Hidden Single')?'簡單':'入門',solved:true,steps}
}
