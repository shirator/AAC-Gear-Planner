import sqlite3,json
c=sqlite3.connect('file:C:/Users/cmesq/Downloads/compact-3503AAClassic-20260925/compact.sqlite3?mode=ro',uri=True);c.row_factory=sqlite3.Row
print([r[1] for r in c.execute('pragma table_info(buffs)')])
rows=c.execute("select id,name,desc from buffs where lower(desc) like '%received%damage%' or lower(desc) like '%damage%received%'").fetchall()
print('matches',len(rows))
for r in rows:
 d=dict(r)
 if '2%' in d['desc']:print(json.dumps(d,ensure_ascii=True))

