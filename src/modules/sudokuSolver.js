export function units(n) {
  if (![6,9].includes(n)) throw new Error('只支援 6×6 與 9×9')
  const h=n/3, out=[]
  for(let i=0;i<n;i++) { out.push(Array.from({length:n},(_,j)=>i*n+j)); out.push(Array.from({length:n},(_,j)=>j*n+i)) }
  for(let r=0;r<n;r+=h) for(let c=0;c<n;c+=3) out.push(Array.from({length:n},(_,j)=>(r+Math.floor(j/3))*n+c+j%3))
  return out
}
export function validate(grid) {
 const n=Math.sqrt(grid.length), u=units(n)
 if(grid.some(v=>!Number.isInteger(v)||v<0||v>n)||u.some(a=>{const b=a.map(i=>grid[i]).filter(Boolean);return new Set(b).size!==b.length})) throw new Error('數獨資料不合法')
 return n
}
export function candidates(g,i,n) {
 const r=Math.floor(i/n),c=i%n,h=n/3, used=new Set()
 for(let j=0;j<n;j++){used.add(g[r*n+j]);used.add(g[j*n+c]);used.add(g[(Math.floor(r/h)*h+Math.floor(j/3))*n+Math.floor(c/3)*3+j%3])}
 return Array.from({length:n},(_,j)=>j+1).filter(v=>!used.has(v))
}
export function solveSudoku(grid,limit=2) {
 const n=validate(grid),g=[...grid],solutions=[]
 function visit(){if(solutions.length>=limit)return;let at=-1,opts=[];for(let i=0;i<g.length;i++)if(!g[i]){const a=candidates(g,i,n);if(!a.length)return;if(at<0||a.length<opts.length){at=i;opts=a}}
 if(at<0){solutions.push([...g]);return}for(const v of opts){g[at]=v;visit();g[at]=0;if(solutions.length>=limit)return}}
 visit();return solutions
}
