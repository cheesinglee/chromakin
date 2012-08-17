'''
Scan for PlayerBase types and create AI database entries for them.
Also generate a player for each AI.
Created on Aug 15, 2012

@author: cheesinglee
'''

import json
from chromakin.players import *

classes = base.PlayerBase.__subclasses__()

j = []
pk = 1
for c in classes:
    d = {}
    d['model'] = 'chromakin.Ai'
    d['pk'] = str(pk)
    f = {}
    f['name'] = c.__name__
    f['classname'] = c.__module__+'.'+c.__name__
    f['description'] = c.__doc__
    d['fields'] = f 
    j.append(d)
    pk += 1
    
jsonfile = open('ai_list.json','w')
print j
json.dump(j,jsonfile,indent=4,sort_keys=True)
jsonfile.close()
