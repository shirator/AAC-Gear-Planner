import sqlite3,json,pathlib
c=sqlite3.connect('file:C:/Users/cmesq/Downloads/compact-3503AAClassic-20260925/compact.sqlite3?mode=ro',uri=True);c.row_factory=sqlite3.Row
idx={x['id']:x['name'] for x in json.loads(pathlib.Path('gear-planner/data/buffs.json').read_text(encoding='utf8'))}
rows=[]
for r in c.execute("select b.id,b.name,b.desc,b.kind_id,b.duration,b.max_stack,m.unit_attribute_id,m.value,m.linear_level_bonus from buffs b join unit_modifiers m on m.owner_type='Buff' and m.owner_id=b.id where m.unit_attribute_id in (58,199) and m.value in (-20,20) order by m.unit_attribute_id,b.id"):
 d=dict(r);d['api_name']=idx.get(r['id']);rows.append(d)
print(json.dumps(rows,ensure_ascii=True));pathlib.Path('gear-planner/data/buffs-exact-2-candidates.json').write_text(json.dumps(rows,ensure_ascii=False),encoding='utf8')
