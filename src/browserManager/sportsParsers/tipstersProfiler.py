from platform import platform
from sportsParsers.blogabet import blogabet

TIPPING_PLATFORMS = {
    'blogabet': blogabet
}



def getTipsterProfilingPages(BOT, opts):
    tipsterData = []
    for key in TIPPING_PLATFORMS:
        print(key)
        [BOT, data] = TIPPING_PLATFORMS[key](BOT)
        tipsterData.append(data)
    return [BOT, tipsterData]
    
    
def getTipsterData():
    pass
    




    