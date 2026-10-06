const fs=require('fs'),path=require('path');
let failed=0, total=0;
function walk(dir){
 if(!fs.existsSync(dir))return;
 for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,e.name);
  if(e.isDirectory())walk(p);
  else if(e.isFile()&&p.endsWith('.js')){
   total++;
   const cp=require('child_process').spawnSync(process.execPath,['--check',p],{encoding:'utf8'});
   if(cp.status!==0){failed++;console.error(`FAIL ${p}\n${cp.stderr}`);}
  }
 }
}
walk('.');
console.log(`Checked ${total} JavaScript files. ${failed} failed.`);
process.exitCode=failed?1:0;
