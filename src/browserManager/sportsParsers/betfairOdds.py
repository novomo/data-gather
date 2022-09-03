from secrets import BETFAIR_HEADERS_GET, BETFAIR_HEADERS_MARKET
import json
from typing import Dict
from datetime import datetime, timedelta
from multiprocessing import Process, JoinableQueue, Queue, Manager
from queue import feed, dataQueue

def getBetfairDataPages(BOT, opts):
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
    if bot is None:
        BOT = loadBot()
    else:
        BOT = bot 
    events = getStartingSoonEvents(bot=BOT)
    print(events)
    marketIds = []
    for event in events:
        markets = event['betFair']['markets']
        for market in markets:
            if market['marketName'] == 'Match Odds':
                marketIds.append(market['marketId'])
    if len(marketIds) == 0:
        return
    BOT.headers = BETFAIR_HEADERS_MARKET
    BOT.headers['user-agent'] = BOT.driver.execute_script("return navigator.userAgent;")
    cookies = BOT.driver.get_cookies()
    print(cookies)
    cookieStr = ''
    for cookie in cookies:
        cookieStr= f"{cookieStr} {cookie['name']}={cookie['value']};"
    print(cookieStr)
    BOT.headers['cookie'] = cookieStr.strip()
    print(BOT.headers)
    splitMarkets = chunks(marketIds, 8)
    betfairEvents = []
    for lst in splitMarkets:
        print(f'https://ero.betfair.com/www/sports/exchange/readonly/v1/bymarket?_ak=nzIFcwyWhrlwYMrh&alt=json&currencyCode=GBP&locale=en&marketIds={",".join(lst)}&rollupLimit=1&rollupModel=STAKE&types=MARKET_STATE,RUNNER_STATE,RUNNER_EXCHANGE_PRICES_BEST')
        BOT.driver.get(f'https://ero.betfair.com/www/sports/exchange/readonly/v1/bymarket?_ak=nzIFcwyWhrlwYMrh&alt=json&currencyCode=GBP&locale=en&marketIds={",".join(lst)}&rollupLimit=1&rollupModel=STAKE&types=MARKET_STATE,RUNNER_STATE,RUNNER_EXCHANGE_PRICES_BEST')
        res = BOT.driver.find_element(BOT.By.TAG_NAME, 'body').find_element(BOT.By.TAG_NAME, 'pre').get_attribute('innerHTML')
        resData: Dict = json.loads(res)
        betfairEvents = betfairEvents + resData['eventTypes'][0]['eventNodes']
        sleep(2)
    
    for event in events:
        eventId = event['betFair']['eventId']
        print(event)
        markets = event['betFair']['markets']
        for betfairEvent in betfairEvents:
            #print(eventId)
            print(betfairEvent)
            if str(betfairEvent['eventId']) == eventId:
                oddsString = '['
                for market in markets:
                    selections = market['selections']
                    for betFairMarket in betfairEvent['marketNodes']:
                        print(market['marketId'])
                        print(betFairMarket['marketId'])
                        if market['marketId'] == betFairMarket['marketId']:
                            oddsObjects = betFairMarket['runners']
                            oddsString = f'{oddsString}{{ market: "{market["marketName"]}", bets: ['

                            for runner in oddsObjects:
                                for runr in selections:
                                    if runr['selectionId'] == str(runner['selectionId']):
                                        selectName = runr['selectionName']
                                oddsString = f'{oddsString}{{ name: "{selectName}",  odds: {runner["exchange"]["availableToBack"][0]["price"]} }},'
                            oddsString = oddsString + '] } ]'
                        
                
                
                
                
                query = f"""mutation {{
                        updateSportsEvent(
                            inputSportsEvent: {{
                                odds: {oddsString}
                            }},
                            _id: "{event['_id']}"
                        )
                    }}"""
                print(query)
                data = run_query(query, BOT)
                print(data)
    return [BOT, process]


def getBetfairEventId():
    pass
def getStartingOdds():
    pass