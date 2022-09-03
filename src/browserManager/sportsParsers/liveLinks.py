from time import sleep
from secrets import TENNIS_LIVE_BASE_URL
from bs4 import BeautifulSoup

def getLiveTennisUrlPages(BOT, opts): 
    BOT.drivers['proxyDriver'].get(TENNIS_LIVE_BASE_URL)
    sleep(5)
    data = BeautifulSoup(BOT.drivers['proxyDriver'].find_element_by_tag_name('body').get_attribute('innerHTML'), 'lxml')
    return [BOT, data]


def getLiveTennisUrlData():
    pass