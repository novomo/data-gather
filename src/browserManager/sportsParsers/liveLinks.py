from time import sleep
from secrets import TENNIS_LIVE_BASE_URL

def getLiveTennisUrlPages(BOT, opts): 
    BOT.drivers['proxyDriver'].get(TENNIS_LIVE_BASE_URL)
    sleep(5)
    return BOT


def getLiveTennisUrlData():
    pass