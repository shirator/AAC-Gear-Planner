import sqlite3,json,re,pathlib
c=sqlite3.connect('file:C:/Users/cmesq/Downloads/compact-3503AAClassic-20260925/compact.sqlite3?mode=ro',uri=True);c.row_factory=sqlite3.Row
print('known',json.dumps([dict(r) for r in c.execute("select * from unit_modifiers where owner_type='Buff' and owner_id=9000964")]))
index={x['id']:x['name'] for x in json.loads(pathlib.Path('gear-planner/data/buffs.json').read_text(encoding='utf-8'))}
for r in c.execute('select id,name,desc from buffs'):
 if re.search(r'(?<![\d.])[-+]?2(?:\.0)?%',r['desc'] or '') and re.search(r'damage|dmg',r['desc'] or '',re.I):
  d=dict(r);d['api_name']=index.get(d['id']);print(json.dumps(d,ensure_ascii=True))

