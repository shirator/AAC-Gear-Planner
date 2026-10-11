import sqlite3,json
from pathlib import Path
p=Path(__file__).parent
c=sqlite3.connect('file:C:/Users/cmesq/Downloads/compact-3503AAClassic-20260925/compact.sqlite3?mode=ro',uri=True);c.row_factory=sqlite3.Row
rules=json.loads((p/'data/rules.json').read_text(encoding='utf8'))
items={str(r['item_id']):r['item_rnd_attr_category_id'] for r in c.execute('select item_id,item_rnd_attr_category_id from item_armors where slot_type_id in (9,12,13,31)')}
categories=set(items.values())-{0}
sets={str(r['id']):dict(r) for r in c.execute('select * from item_rnd_attr_unit_modifier_group_sets') if r['item_rnd_attr_category_id'] in categories}
groups={str(r['id']):dict(r) for r in c.execute('select * from item_rnd_attr_unit_modifier_groups') if str(r['item_rnd_attr_unit_modifier_group_set_id']) in sets}
for g in groups.values():g['grades']={str(r['grade_id']):{'min':r['min'],'max':r['max']} for r in c.execute('select grade_id,min,max from item_rnd_attr_unit_modifiers where group_id=?',(g['id'],))}
rules['synthesis']={'items':items,'sets':sets,'groups':groups,'source':'compact-3503AAClassic-20260925: item_armors + item_rnd_attr_unit_modifier_*; raw inclusive ranges'}
(p/'data/rules.json').write_text(json.dumps(rules,ensure_ascii=False,separators=(',',':')),encoding='utf8')
print(len(items),'items,',len(groups),'groups')
