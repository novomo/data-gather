from secrets import BETFAIR_HEADERS_GET, BETFAIR_HEADERS_MARKET
import json
from typing import Dict

def getBetfairDataPages(BOT, opts):
    BOT.headers = BETFAIR_HEADERS_GET
    BOT.headers['user-agent'] = BOT.driver.execute_script("return navigator.userAgent;")
    BOT.drivers['standard'].get('https://www.betfair.com/exchange/plus/')
    cookies = BOT.drivers['standard'].get_cookies()
    print(cookies)
    cookieStr = ''
    for cookie in cookies:
        cookieStr= f"{cookieStr} {cookie['name']}={cookie['value']};"
    print(cookieStr)
    BOT.headers['cookie'] = cookieStr.strip()
    res = BOT.request('https://scan-inbf.betfair.com/www/sports/navigation/facet/v1/search?_ak=nzIFcwyWhrlwYMrh&alt=json', data=DATA, post=True)
    resData: Dict = json.loads(res.text)
    return BOT


def getStartingSoonEventsPages(BOT, opts):
    getDate: datetime = datetime.now()
    nxt: datetime = getDate + timedelta(hours=6)

    after: str = getDate.strftime("%Y-%m-%dT%H:00:00.000Z")
    before: str = nxt.strftime("%Y-%m-%dT%H:59:59.999Z")
    print(before, after)

    DATA={
        "filter":{
            "marketBettingTypes":[
                "ASIAN_HANDICAP_SINGLE_LINE",
                "ASIAN_HANDICAP_DOUBLE_LINE",
                "ODDS"
                ],
            "productTypes":[
                "EXCHANGE"
                ],
            "marketTypeCodes":[
                "MATCH_ODDS",
                "MATCH_ODDS_UNMANAGED",
                "MONEYLINE",
                "MONEY_LINE"
                ],
            "contentGroup":{
                "language":"en",
                "regionCode":"UK"
                },
            "turnInPlayEnabled":True,
            "maxResults":0,
            "selectBy":"FIRST_TO_START_AZ",
            "marketStartingAfter":after,
            "marketStartingBefore":before,
            "eventTypeIds":[2]
            },
        "facets":[
            {
                "type":"EVENT_TYPE",
                "skipValues":0,
                "maxValues":10,
                "next":{
                    "type":"EVENT",
                    "skipValues":0,
                    "maxValues":100,
                    "next":{
                        "type":"MARKET",
                        "maxValues":1,
                        "next":{
                            "type":"COMPETITION",
                            "maxValues":1
                            }
                        }
                    }
                }
            ],
        "currencyCode":"GBP",
        "locale":"en"
        }
    BOT.headers = BETFAIR_HEADERS_GET
    BOT.headers['user-agent'] = BOT.driver.execute_script("return navigator.userAgent;")
    BOT.drivers['standard'].get('https://www.betfair.com/exchange/plus/')
    cookies = BOT.drives['standard'].get_cookies()
    print(cookies)
    cookieStr = ''
    for cookie in cookies:
        cookieStr= f"{cookieStr} {cookie['name']}={cookie['value']};"
    print(cookieStr)
    BOT.headers['cookie'] = cookieStr.strip()
    res = BOT.request('https://scan-inbf.betfair.com/www/sports/navigation/facet/v1/search?_ak=nzIFcwyWhrlwYMrh&alt=json', data=DATA, post=True)
    resData: Dict = json.loads(res.text)
    return BOT