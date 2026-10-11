const fs=require('node:fs'),P=require('./core.js'),E=require('./effects.js'),M=require('./character-model.js');
const read=n=>JSON.parse(fs.readFileSync(__dirname+'/data/'+n+'.json','utf8'));
const items=read('items'),d=read('equipment-effects'),rules=read('rules');
const missingRefs=[],unknownAttributes=new Map();let gradePairs=0,pendingPairs=0;
for(const [id,record]of Object.entries(d.items)){for(const buff of new Set([record.base_buff,...Object.values(record.grades||{})].filter(Boolean)))if(!d.buffs[buff])missingRefs.push({item:Number(id),buff});for(const grade of Object.keys(record.grades||{})){gradePairs++;const result=E.itemEffects(items.find(i=>i.id===Number(id))||{id:Number(id)},Number(grade),d);if(result.pending.length)pendingPairs++;}}
for(const buff of Object.values(d.buffs))for(const mod of buff.modifiers||[])if(!d.attributes[mod.unit_attribute_id])unknownAttributes.set(mod.unit_attribute_id,(unknownAttributes.get(mod.unit_attribute_id)||0)+1);
const state=P.empty(),summary=M.summarize(state,items,d,rules),base=M.calculate(state,items,d,rules,summary);
const report={catalogItems:items.length,modifierRecords:Object.keys(d.items).length,buffRecords:Object.keys(d.buffs).length,passives:Object.keys(d.passives).length,gradePairs,pairsWithUnresolvedEffects:pendingPairs,missingBuffReferences:missingRefs,unknownAttributes:Object.fromEntries(unknownAttributes),dynamicBuffs:Object.values(d.buffs).filter(b=>(b.dynamic||[]).length).length,nakedCharacter:base};
fs.writeFileSync(__dirname+'/data/checkup.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
