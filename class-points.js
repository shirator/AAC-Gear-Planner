(function(root){
const abilities=['fight','illusion','adamant','will','death','wild','magic','vocation','romance','love'];
function spent(state,ability,skills,passives){return (state.skills||[]).filter(id=>skills.find(skill=>skill.id===id)?.ability===ability).length+(state.passives||[]).filter(id=>abilities[passives[id]?.ability_id-1]===ability).length;}
function total(state){return (state.skills||[]).length+(state.passives||[]).length;}
function prune(state,skills,passives){
 const valid=new Set();
 for(const ability of state.classes){let points=(state.skills||[]).filter(id=>skills.find(skill=>skill.id===id)?.ability===ability).length;
  const rows=(state.passives||[]).map(id=>passives[id]).filter(passive=>passive&&abilities[passive.ability_id-1]===ability).sort((a,b)=>a.req_points-b.req_points||a.id-b.id);
  for(const passive of rows)if(points>=passive.req_points){valid.add(passive.id);points++;}
 }
 state.passives=(state.passives||[]).filter(id=>valid.has(id));state.conditions=(state.conditions||[]).filter(id=>valid.has(id));return state;
}
function toggle(state,kind,id,skills,passives){
 if(!['skills','passives'].includes(kind))throw Error('Invalid selection.');
 const next=JSON.parse(JSON.stringify(state));next[kind]??=[];
 if(next[kind].includes(id)){next[kind]=next[kind].filter(value=>value!==id);return prune(next,skills,passives);}
 if(total(next)>=28)throw Error('All 28 skill points are allocated. Remove a skill or passive first.');
 if(kind==='skills'){const skill=skills.find(skill=>skill.id===id);if(!skill?.show||skill.category!=='ability'||!state.classes.includes(skill.ability))throw Error('Skill is outside the selected skillsets.');}
 else{const passive=passives[id],ability=abilities[passive?.ability_id-1];if(!passive||!state.classes.includes(ability))throw Error('Passive is outside the selected skillsets.');if(spent(next,ability,skills,passives)<passive.req_points)throw Error('Requires '+passive.req_points+' points in this skillset.');}
 next[kind].push(id);return next;
}
function orderedSkills(skills,ability,metadata){return skills.filter(skill=>skill.show&&skill.category==='ability'&&skill.ability===ability).sort((a,b)=>(metadata[a.id]?.high_ability_id||0)-(metadata[b.id]?.high_ability_id||0)||(metadata[a.id]?.level??999)-(metadata[b.id]?.level??999)||a.id-b.id);}
const api={spent,total,prune,toggle,orderedSkills};if(typeof module!=='undefined')module.exports=api;else root.ClassPoints=api;
})(globalThis);
