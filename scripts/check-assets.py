from PIL import Image
from pathlib import Path
import json
catalog=json.loads(Path('src/catalog2026.json').read_text(encoding='utf-8'))
bad=[]
for s in catalog['shoes']:
 for url in s['photos']:
  try:
   im=Image.open(Path('public')/url.lstrip('/')); im.verify()
  except Exception as e: bad.append({'shoe':s['id'],'url':url,'error':str(e)})
print(json.dumps({'checked':sum(len(s['photos']) for s in catalog['shoes']),'bad':bad},ensure_ascii=False))
