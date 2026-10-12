"""Audit all catalog equipment against the read-only Classic database."""
import sqlite3,json,hashlib
from pathlib import Path
p=Path(__file__).parent
source=Path('C:/Users/cmesq/Downloads/compact-3503AAClassic-20260925/compact.sqlite3')
c=sqlite3.connect(source.resolve().as_uri()+'?mode=ro',uri=True);c.row_factory=sqlite3.Row
catalog={i['id']:i for i in json.loads((p/'data/items.json').read_text(encoding='utf8'))}
attrs=json.loads((p/'data/attribute-map.json').read_text(encoding='utf8'))
data={'attributes':attrs,'items':{},'buffs':{},'sets':{},'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest()}
data['gem_special_effects']=json.loads((p/'data/gem-special-effects.json').read_text(encoding='utf8'))
data['armor_grade_buffs']=[dict(r) for r in c.execute('select armor_type_id,item_grade_id,buff_id from armor_grade_buffs where item_grade_id<=11')]
mods={}
for row in c.execute('select * from unit_modifiers'):
 d=dict(row);mods.setdefault((d.pop('owner_type'),d.pop('owner_id')),[]).append(d)
rules=json.loads((p/'data/rules.json').read_text(encoding='utf8'))
rules['enchants']={}
for row in c.execute('select * from item_enchanting_gems'):
 if row['item_id'] not in catalog:continue
 d=dict(row);rules['enchants'].setdefault(str(d.pop('item_id')),[]).append(d)
rules['sigils']={}
for id in rules['enchants']:
 item=catalog.get(int(id));values=mods.get(('Item',int(id)),[])
 if item and item['name'].startswith('Perfect ') and item['name'].endswith('Lunasigil') and values and all(m['unit_attribute_id'] in range(5) and m['unit_modifier_type_id']==0 and m['linear_level_bonus']==0 for m in values):
  rules['sigils'][id]={'stats':{['str','dex','sta','int','spi'][m['unit_attribute_id']]:m['value'] for m in values}}
required={r['equip_item_tag_id'] for rows in rules['enchants'].values() for r in rows if r['equip_item_tag_id']}
for row in c.execute('select item_id,tag_id from tagged_items'):
 if row['tag_id'] in required:
  tags=rules['item_tags'].setdefault(str(row['item_id']),[])
  if row['tag_id'] not in tags:tags.append(row['tag_id'])
rules['accessories']={str(row['item_id']):dict(row) for row in c.execute('select a.*,i.level from item_accessories a join items i on i.id=a.item_id')}
rules['synthesis_items']={str(row['item_id']):dict(row) for row in c.execute('select item_id,slot_type_id,item_rnd_attr_category_id from item_armors where slot_type_id in (12,13,31)')}
for row in c.execute('select w.item_id,h.speed from item_weapons w join holdables h on h.id=w.holdable_id'):
 if str(row['item_id']) in rules['weapons']:rules['weapons'][str(row['item_id'])]['speed']=row['speed']
rules['passives']={str(r['id']):{'ability_id':r['ability_id']} for r in c.execute('select id,ability_id from passive_buffs where ability_id between 1 and 10 and high_ability_id=0')}
(p/'data/rules.json').write_text(json.dumps(rules),encoding='utf8')
procs={}
for row in c.execute('select * from item_proc_bindings'):procs.setdefault(row['item_id'],[]).append(row['proc_id'])
grade={};ambiguous={}
for row in c.execute('select item_id,item_grade_id,buff_id from item_grade_buffs'):
 previous=grade.get(row['item_id'],{}).get(str(row['item_grade_id']))
 if previous and previous!=row['buff_id']:ambiguous.setdefault(row['item_id'],{})[str(row['item_grade_id'])]=[previous,row['buff_id']]
 grade.setdefault(row['item_id'],{})[str(row['item_grade_id'])]=row['buff_id']
equip={}
for table in ['item_weapons','item_armors','item_accessories']:
 for row in c.execute('select item_id,eiset_id,recharge_buff_id,item_rnd_attr_category_id from '+table):equip[row['item_id']]=dict(row)
for row in c.execute('select id,level,buff_id from items'):
 id=row['id']
 if id not in catalog:continue
 if id not in equip and not mods.get(('Item',id)) and not grade.get(id):continue
 data['items'][str(id)]={'level':row['level'],'base_buff':row['buff_id'],'grades':grade.get(id,{}),'ambiguous_grades':ambiguous.get(id,{}),'direct':mods.get(('Item',id),[]),'procs':procs.get(id,[]),**equip.get(id,{})}
needed=set()
for item in data['items'].values():
 needed.update(item['grades'].values());needed.update([item['base_buff'],item.get('recharge_buff_id',0)])
 for ids in item['ambiguous_grades'].values():needed.update(ids)
sets={x.get('eiset_id',0) for x in data['items'].values()}
sets.update(r['eiset_id'] for rows in rules['enchants'].values() for r in rows if r['eiset_id'])
for row in c.execute('select * from equip_item_set_bonuses'):
 if row['equip_item_set_id'] in sets:
  data['sets'].setdefault(str(row['equip_item_set_id']),[]).append(dict(row));needed.add(row['buff_id'])
needed.update(x[0] for x in c.execute('select id from buffs'))
data['limits']={str(r['unit_attribute_id']):dict(r) for r in c.execute('select * from unit_attribute_limits')}
data['formulas']={str(x['kind_id']):x['formula'] for x in c.execute('select * from unit_formulas where owner_type_id=0')}
data['passives']={}
for row in c.execute('select * from passive_buffs where ability_id between 1 and 10 and high_ability_id=0'):
 d=dict(row);d['children']=[dict(x) for x in c.execute("select t.event_id,t.target_buff_tag_id,t.source_buff_tag_id,t.owner_buff_tag_id,b.buff_id,b.chance,b.stack from buff_triggers t join effects e on e.id=t.effect_id and e.actual_type='BuffEffect' join buff_effects b on b.id=e.actual_id where t.buff_id=?",(row['buff_id'],))];api_passive=json.loads((p/'data/passive-descriptions.json').read_text(encoding='utf8')).get(str(row['buff_id']),{})
 d['related']=[]
 buff_catalog=json.loads((p/'data/buffs.json').read_text(encoding='utf8'));description=api_passive.get('description','').lower();parent_name=api_passive.get('name','').lower()
 for b in buff_catalog:
  if b['id']==row['buff_id'] or not b.get('has_modifiers') or b.get('kind_id')!=1:continue
  name=b['name'].lower();duration=c.execute('select duration from buffs where id=?',(b['id'],)).fetchone()
  if duration and duration[0]>0 and (name==parent_name or (len(name)>=5 and name in description)):d['related'].append(b['id'])
 d['description']=api_passive.get('description','');d['conditional']=bool(d['children'] or d['related']) or any(word in d['description'].lower() for word in ['when ', 'while ', 'after ', 'if ', 'with a shield', 'dual-wielding'])
 first=d['description'].replace('|r','').split('\n')[0].split('.')[0].lower()
 if mods.get(('Buff',d['buff_id'])) and not any(word in first for word in ['when ', 'while ', 'after ', 'if ', 'with a shield', 'dual-wielding']):
  d['conditional']=False
  if not d['children'] and not any(w in d['description'].lower() for w in ['grants','triggers','when ','while ','after ','each ']):d['related']=[]
 if d['buff_id']==831:d['conditional']=False
 data['passives'][str(row['id'])]=d
dynamic={}
for row in c.execute('select * from dynamic_unit_modifiers'):dynamic.setdefault(row['buff_id'],[]).append(dict(row))
for row in c.execute('select id,name,desc,duration,stack_rule_id,max_stack from buffs'):
 if row['id'] in needed:data['buffs'][str(row['id'])]={**dict(row),'modifiers':mods.get(('Buff',row['id']),[]),'dynamic':dynamic.get(row['id'],[])}
buff_names={x['id']:x['name'] for x in json.loads((p/'data/buffs.json').read_text(encoding='utf8'))}
for id,buff in data['buffs'].items():buff['name']=buff_names.get(int(id),buff['name'])
audit={'catalog_items':len(catalog),'catalog_equipment':sum(i in equip for i in catalog),'exported_items':len(data['items']),'grade_records':sum(len(i['grades']) for i in data['items'].values()),'attribute_metadata':len(attrs),'cast_time_items':[],'unmapped_attributes':{},'scaled_modifiers':0,'non_additive_modifiers':0,'dynamic_buffs':sum(bool(b['dynamic']) for b in data['buffs'].values())}
for id,item in data['items'].items():
 allmods=item['direct']+[m for b in item['grades'].values() for m in data['buffs'].get(str(b),{}).get('modifiers',[])]+data['buffs'].get(str(item['base_buff']),{}).get('modifiers',[])
 if any(m['unit_attribute_id']==71 for m in allmods):audit['cast_time_items'].append({'id':int(id),'name':catalog[int(id)]['name'],'scaled':any(m['unit_attribute_id']==71 and m['linear_level_bonus'] for m in allmods)})
 for m in allmods:
  if str(m['unit_attribute_id']) not in attrs:audit['unmapped_attributes'][str(m['unit_attribute_id'])]=audit['unmapped_attributes'].get(str(m['unit_attribute_id']),0)+1
  audit['scaled_modifiers']+=bool(m['linear_level_bonus']);audit['non_additive_modifiers']+=m['unit_modifier_type_id']!=0
# Classic Pink Goblet includes Healing Power +15% (user-confirmed server behavior).
data['buffs']['7688']['modifiers'].append({'linear_level_bonus':0,'unit_attribute_id':175,'unit_modifier_type_id':1,'value':15})
data['buffs']['7688']['classic_override']='Classic user-confirmed Healing Power +15%; historical modifier omitted.'
# Description explicitly says this set reduces received damage.
for modifier in data['buffs']['9000845']['modifiers']:
 if modifier['unit_attribute_id']==58:modifier['value']=-abs(modifier['value'])
data['buffs']['9000845']['classic_override']='Corrected positive raw sign to match the explicit received damage reduction description.'
(p/'data/equipment-effects.json').write_text(json.dumps(data,ensure_ascii=True),encoding='utf8')
(p/'data/equipment-audit.json').write_text(json.dumps(audit,indent=2),encoding='utf8')
print(json.dumps({**audit,'cast_time_items':len(audit['cast_time_items'])}))
