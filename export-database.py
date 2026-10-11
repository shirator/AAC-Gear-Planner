import sqlite3,json,hashlib,pathlib,sys
source=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'C:/Users/cmesq/Downloads/compact-3503AAClassic-20260925/compact.sqlite3').resolve()
c=sqlite3.connect(source.as_uri()+'?mode=ro',uri=True);c.row_factory=sqlite3.Row
out={'source':source.parent.name,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'grades':[dict(r) for r in c.execute('select * from item_grades')],'weapons':{},'armors':{},'wearable_formulas':{str(r['kind_id']):r['formula'] for r in c.execute('select * from wearable_formulas')}}
mods={r['id']:{k:r[k] for k in ['str_weight','dex_weight','sta_weight','int_weight','spi_weight']} for r in c.execute('select * from equip_item_attr_modifiers')}
for r in c.execute('select i.id,i.level,i.fixed_grade,i.level_requirement,w.mod_set_id,h.formula_dps,h.formula_mdps,h.formula_hdps,h.gear_score_multiplier,h.stat_multiplier,h.slot_type_id from items i join item_weapons w on w.item_id=i.id join holdables h on h.id=w.holdable_id'):
 d=dict(r);d['modifiers']=mods.get(d.pop('mod_set_id'));out['weapons'][str(d.pop('id'))]=d
for r in c.execute('select i.id,i.level,i.fixed_grade,i.level_requirement,a.mod_set_id,a.slot_type_id,a.type_id,s.coverage,s.gear_score_multiplier,v.armor_bp,v.magic_resistance_bp from items i join item_armors a on a.item_id=i.id join wearable_slots s on s.slot_type_id=a.slot_type_id join wearables v on v.slot_type_id=a.slot_type_id and v.armor_type_id=a.type_id'):
 d=dict(r);d['modifiers']=mods.get(d.pop('mod_set_id'));out['armors'][str(d.pop('id'))]=d
(pathlib.Path(__file__).resolve().parent/'data'/'rules.json').write_text(json.dumps(out,ensure_ascii=False),encoding='utf-8')
print('Exported',len(out['weapons']),'weapons,',len(out['armors']),'armors/accessories')
# Gem socket data is copied read-only; no game-unit scaling is inferred.
out['socket_limits']={str(r['slot_id'])+':'+str(r['grade_id']):r['num_socket'] for r in c.execute('select * from item_socket_num_limits')}
out['slot_groups']={}
for r in c.execute('select * from equip_slot_group_maps'):
 out['slot_groups'].setdefault(str(r['equip_slot_group_id']),[]).append(r['equip_slot_type_id'])
required_tags={r[0] for r in c.execute('select distinct equip_item_tag_id from item_sockets where equip_item_tag_id<>0')}
out['item_tags']={}
for r in c.execute('select item_id,tag_id from tagged_items'):
 if r['tag_id'] in required_tags:out['item_tags'].setdefault(str(r['item_id']),[]).append(r['tag_id'])
levels={r['item_id']:r['level'] for r in c.execute('select * from item_socket_level_limits')}
modifiers={}
for r in c.execute("select owner_id,unit_attribute_id,unit_modifier_type_id,value,linear_level_bonus from unit_modifiers where owner_type='Item'"):
 d=dict(r);modifiers.setdefault(d.pop('owner_id'),[]).append(d)
out['gems']={}
for r in c.execute('select s.*,i.description from item_sockets s join items i on i.id=s.item_id'):
 d=dict(r);id=d.pop('item_id');d['min_level']=levels.get(id);d['modifiers']=modifiers.get(id,[]);out['gems'][str(id)]=d
(pathlib.Path(__file__).resolve().parent/'data'/'rules.json').write_text(json.dumps(out,ensure_ascii=False),encoding='utf-8')
print('Exported',len(out['gems']),'socket items')

# Verified casting-time grade effects: Oracle Epic -34 means -3.4%.
out['grade_effects']={}
for row in c.execute("select g.item_id,g.item_grade_id,g.buff_id,u.value from item_grade_buffs g join unit_modifiers u on u.owner_type='Buff' and u.owner_id=g.buff_id where u.unit_attribute_id=71 and u.unit_modifier_type_id=0 and u.linear_level_bonus=0"):
 out['grade_effects'].setdefault(str(row['item_id']),{})[str(row['item_grade_id'])]={'cast_time':row['value']/10,'buff_id':row['buff_id']}
(pathlib.Path(__file__).resolve().parent/'data'/'rules.json').write_text(json.dumps(out,ensure_ascii=False),encoding='utf-8')
