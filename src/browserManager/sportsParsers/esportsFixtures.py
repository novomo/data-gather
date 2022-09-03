from secrets import ESPORTS_BASE_URL
from time import sleep

def getESportsFixturePages(BOT, opts):
    url = f"{ESPORTS_BASE_URL}"
    print(url)
    BOT.drivers['proxyDriver'].get(url)

    sleep(3)  
    soupText = BOT.drivers['proxyDriver'].find_element_by_tag_name('body').get_attribute('outerHTML')
    BOT.makeSoup(soupText)
    #print(BOT.soup)
    matches = BOT.soupSelectEle('div', {'class': 'make_bnt_list'})
    return [BOT, matches]


def getESportsFixtureData():
    pass