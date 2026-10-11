"""Export verified equipment-score inputs from the read-only Classic database."""
import sqlite3,json
from pathlib import Path
p=Path(__file__).parent
c=sqlite3.connect('file:C:/Users/cmesq/Downloads/compact-3503AAClassic-20260925/compact.sqlite3?mode=ro',uri=True);c.row_factory=sqlite3.Row
rules=json.loads((p/'data/rules.json').read_text(encoding='utf8'))
rules['score']={'formulas':{str(r['id']):r['formula'] for r in c.execute('select * from formulas where id in (30,31,32)')},'slots':{str(r['slot_type_id']):r['gear_score_multiplier'] for r in c.execute('select * from wearable_slots')},'levels':{str(r['id']):r['level'] for r in c.execute('select id,level from items')},'source':'compact-3503AAClassic-20260925 formulas 30/31/32; aa-classic public item calculator normalizes stat_multiplier and gear_score_multiplier by 100 ; native screenshot retains one decimal, so calculation retains precision.'}
catalog={x['id']:x for x in json.loads((p/'data/skills.json').read_text(encoding='utf8'))};buffs={x['id']:x for x in json.loads((p/'data/buffs.json').read_text(encoding='utf8'))}
import re
rules['skill_buffs']={}
for r in c.execute("select s.skill_id,s.start_level,s.end_level,b.buff_id from skill_effects s join effects e on e.id=s.effect_id and e.actual_type='BuffEffect' join buff_effects b on b.id=e.actual_id where s.chance=100 and b.chance=100"):
 skill=catalog.get(r['skill_id']);buff=buffs.get(r['buff_id'])
 if not skill or not buff or not skill.get('show') or skill.get('category')!='ability':continue
 match=re.match(r'^(.+) \(Rank (\d+)\)$',buff['name'])
 if not match or match[1]!=skill['name']:continue
 rows=rules['skill_buffs'].setdefault(str(r['skill_id']),[])
 if not any(x['buff_id']==r['buff_id'] for x in rows):rows.append({'buff_id':r['buff_id'],'rank':int(match[2]),'start_level':r['start_level'],'end_level':r['end_level']})
for rows in rules['skill_buffs'].values():rows.sort(key=lambda r:r['rank'])
(p/'data/rules.json').write_text(json.dumps(rules),encoding='utf8')
