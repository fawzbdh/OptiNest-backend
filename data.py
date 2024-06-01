from geofunc import GeoFunc
import pandas as pd
import json

def getData(index,config_file):
    name=[config_file]
    scale=[1]
    df = pd.read_csv(name[index], encoding='utf-8')
    polygons=[]
    for i in range(0,df.shape[0]):
        for j in range(0,df['num'][i]):
            poly=json.loads(df['polygon'][i])
            GeoFunc.normData(poly,scale[index])
            polygons.append(poly)
    return polygons