(function(root){
const abilities=['fight','illusion','adamant','will','death','wild','magic','vocation','romance','love'];
function isAbyssal(id,metadata={}){return !!metadata[id]?.high_ability_id;}
function spent(state,ability,skills,passives,metadata={}){return (state.skills||[]).filter(id=>skills.find(skill=>skill.id===id)?.ability===ability&&!isAbyssal(id,metadata)).length+(state.passives||[]).filter(id=>abilities[passives[id]?.ability_id-1]===ability).length;}
function total(state,metadata={}){return (state.skills||[]).filter(id=>!isAbyssal(id,metadata)).length+(state.passives||[]).length;}
function prune(state,skills,passives,metadata={}){
 const valid=new Set();
 for(const ability of state.classes){let points=(state.skills||[]).filter(id=>skills.find(skill=>skill.id===id)?.ability===ability&&!isAbyssal(id,metadata)).length;
  const rows=(state.passives||[]).map(id=>passives[id]).filter(passive=>passive&&abilities[passive.ability_id-1]===ability).sort((a,b)=>a.req_points-b.req_points||a.id-b.id);
  for(const passive of rows)if(points>=passive.req_points){valid.add(passive.id);points++;}
 }
 state.passives=(state.passives||[]).filter(id=>valid.has(id));state.conditions=(state.conditions||[]).filter(id=>valid.has(id));return state;
}
function toggle(state,kind,id,skills,passives,metadata={}){
 if(!['skills','passives'].includes(kind))throw Error('Invalid selection.');
 const next=JSON.parse(JSON.stringify(state));next[kind]??=[];
 if(next[kind].includes(id)){next[kind]=next[kind].filter(value=>value!==id);return prune(next,skills,passives,metadata);}
 if(!(kind==='skills'&&isAbyssal(id,metadata))&&total(next,metadata)>=28)throw Error('All 28 skill points are allocated. Remove a skill or passive first.');
 if(kind==='skills'){const skill=skills.find(skill=>skill.id===id);if(!skill?.show||skill.category!=='ability'||!state.classes.includes(skill.ability))throw Error('Skill is outside the selected skillsets.');}
 else{const passive=passives[id],ability=abilities[passive?.ability_id-1];if(!passive||!state.classes.includes(ability))throw Error('Passive is outside the selected skillsets.');if(spent(next,ability,skills,passives,metadata)<passive.req_points)throw Error('Requires '+passive.req_points+' points in this skillset.');}
 next[kind].push(id);return next;
}
function orderedSkills(skills,ability,metadata){return skills.filter(skill=>skill.show&&skill.category==='ability'&&skill.ability===ability).sort((a,b)=>(metadata[a.id]?.high_ability_id||0)-(metadata[b.id]?.high_ability_id||0)||(metadata[a.id]?.level??999)-(metadata[b.id]?.level??999)||a.id-b.id);}
const classNames={
 'adamant+death+fight':'Doomlord','adamant+death+illusion':'Defiler','adamant+death+love':'Justiciar','adamant+death+magic':'Battlemage','adamant+death+romance':'Dark Aegis','adamant+death+vocation':'Dreadnaught','adamant+death+wild':'Dreadstone','adamant+death+will':'Skullknight',
 'adamant+fight+illusion':'Hexblade','adamant+fight+love':'Paladin','adamant+fight+magic':'Crusader','adamant+fight+romance':'Dawncaller','adamant+fight+vocation':'Blighter','adamant+fight+wild':'Liberator','adamant+fight+will':'Abolisher',
 'adamant+illusion+love':'Shadowbane','adamant+illusion+magic':'Cabalist','adamant+illusion+romance':'Poxbane','adamant+illusion+vocation':'Shadowknight','adamant+illusion+wild':'Archon','adamant+illusion+will':'Dreambreaker',
 'adamant+love+magic':'Scion','adamant+love+romance':'Caretaker','adamant+love+vocation':'Death Warden','adamant+love+wild':'Druid','adamant+love+will':'Templar',
 'adamant+magic+romance':'Earthsinger','adamant+magic+vocation':'Swiftstone','adamant+magic+wild':'Farslayer','adamant+magic+will':'Thaumaturge',
 'adamant+romance+vocation':'Nightbearer','adamant+romance+wild':'Honorguard','adamant+romance+will':'Tomb Warden',
 'adamant+vocation+wild':'Stone Arrow','adamant+vocation+will':'Bastion','adamant+wild+will':'Redoubt',
 'death+fight+illusion':'Hordebreaker','death+fight+love':'Blackguard','death+fight+magic':'Ravager','death+fight+romance':'Lorebreaker','death+fight+vocation':'Executioner','death+fight+wild':'Dreadbow','death+fight+will':'Bloodreaver',
 'death+illusion+love':'Necromancer','death+illusion+magic':'Demonologist','death+illusion+romance':'Tombcaller','death+illusion+vocation':'Shroudmaster','death+illusion+wild':'Dreadhunter','death+illusion+will':'Nightcloak',
 'death+love+magic':'Cultist','death+love+romance':'Sorrowsong','death+love+vocation':'Doombringer','death+love+wild':'Ghosthunter','death+love+will':'Edgewalker',
 'death+magic+romance':'Requiem','death+magic+vocation':'Reaper','death+magic+wild':'Spellbow','death+magic+will':'Revenant',
 'death+romance+vocation':'Nocturne','death+romance+wild':'Banesong','death+romance+will':'Phantasm',
 'death+vocation+wild':'Shadehunter','death+vocation+will':'Planeshifter','death+wild+will':'Astral Ranger',
 'fight+illusion+love':'Dervish','fight+illusion+magic':'Harbinger','fight+illusion+romance':'Dirgeweaver','fight+illusion+vocation':'Shadowblade','fight+illusion+wild':'Hex Ranger','fight+illusion+will':'Hex Warden',
 'fight+love+magic':'Fleshshaper','fight+love+romance':'Bloodthrall','fight+love+vocation':'Inquisitor','fight+love+wild':'Warpriest','fight+love+will':'Argent',
 'fight+magic+romance':'Spellsword','fight+magic+vocation':'Hellweaver','fight+magic+wild':'Destroyer','fight+magic+will':'Enforcer',
 'fight+romance+vocation':'Blade Dancer','fight+romance+wild':'Bloodskald','fight+romance+will':'Herald',
 'fight+vocation+wild':'Outrider','fight+vocation+will':'Darkrunner','fight+wild+will':'Bonestalker',
 'illusion+love+magic':'Shaman','illusion+love+romance':'Athame','illusion+love+vocation':'Assassin','illusion+love+wild':'Soulbow','illusion+love+will':'Hierophant',
 'illusion+magic+romance':'Lamentor','illusion+magic+vocation':'Daggerspell','illusion+magic+wild':'Stormcaster','illusion+magic+will':'Arcanist',
 'illusion+romance+vocation':'Nightwitch','illusion+romance+wild':'Beguiler','illusion+romance+will':'Enchanter',
 'illusion+vocation+wild':'Trickster','illusion+vocation+will':'Eidolon','illusion+wild+will':'Arcane Hunter',
 'love+magic+romance':'Gypsy','love+magic+vocation':'Animist','love+magic+wild':'Soulmender','love+magic+will':'Boneweaver',
 'love+romance+vocation':'Confessor','love+romance+wild':'Soulsong','love+romance+will':'Cleric',
 'love+vocation+wild':'Ranger','love+vocation+will':'Soothsayer','love+wild+will':'Oracle',
 'magic+romance+vocation':'Spellsinger','magic+romance+wild':'Evoker','magic+romance+will':'Spellsong',
 'magic+vocation+wild':'Infiltrator','magic+vocation+will':'Enigmatist','magic+wild+will':'Stormchaser',
 'romance+vocation+wild':'Ebonsong','romance+vocation+will':'Exorcist','romance+wild+will':'Howler',
 'vocation+wild+will':'Primeval'
};
function className(classes){if(!Array.isArray(classes)||classes.length!==3)return null;const key=[...classes].sort().join('+');return classNames[key]||null;}
const api={isAbyssal,spent,total,prune,toggle,orderedSkills,classNames,className};if(typeof module!=='undefined')module.exports=api;else root.ClassPoints=api;
})(globalThis);
