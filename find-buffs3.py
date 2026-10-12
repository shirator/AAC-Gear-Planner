import sqlite3,json,pathlib
c=sqlite3.connect('file:C:/Users/cmesq/Downloads/compact-3503AAClassic-20260925/compact.sqlite3?mode=ro',uri=True);c.row_factory=sqlite3.Row
idx={x['id']:x['name'] for x in json.loads(pathlib.Path('gear-planner/data/buffs.json').read_text(encoding='utf8'))}
for r in c.execute("select id,name,desc from buffs where desc like '%ua_incoming_damage_mul%' limit 8"):
 d=dict(r);d['api_name']=idx.get(r['id']);d['mods']=[dict(x) for x in c.execute("select unit_attribute_id,unit_modifier_type_id,value from unit_modifiers where owner_type='Buff' and owner_id=?",(r['id'],))];print(json.dumps(d,ensure_ascii=True))
