from time import sleep
import selenium, json, traceback, os, sys
from typing import Dict, List
from datetime import datetime, timedelta, date
from secret import API_URL, HEADERS, SPORTS_BASE_URL, ESPORTS_BASE_URL, \
    BETFAIR_HEADERS_GET, BETFAIR_HEADERS_MARKET, BLOGABET_PROFILE, TENNIS_LIVE_BASE_URL, SERVER
from helpers import importModuleByPath, chunks
from selenium.webdriver.common.action_chains import ActionChains
import requests
import unidecode, re


DIRECTORY = os.path.dirname(os.path.abspath(__file__))
masterBot = importModuleByPath(f'/{DIRECTORY}/master-bot/src/app.py')




class ScraperBot(masterBot.Bot):
    def __init__(self, requestBot: bool=False, seleniumBot: bool=False, visualBot: bool=False, 
        headless: bool=False, imagePath: str=f"{DIRECTORY}/images", virtualDisplay: bool=False, showVirtualDisplay: int=1, implicitWait: int=15, proxy: str="", torPass: str="", loadChrome: bool=True):
        super().__init__(requestBot=requestBot, seleniumBot=seleniumBot, visualBot=visualBot, 
        headless=headless, imagePath=imagePath, virtualDisplay=virtualDisplay, showVirtualDisplay=showVirtualDisplay, 
        implicitWait=implicitWait, proxy=proxy, torPass=torPass, loadChrome=loadChrome)
        
        # Task config
        self.config = {
            "sportsFixtures": {
            "compilePageList": self.getSportsFixturePages,
            "opts": {
                "sportsList":  [
                                'football',
                                'basketball',
                                'baseball',
                                'ice-hockey',
                                'volleyball',
                                'handball',
                                'rugby',
                                'american-football',
                                'table-tennis',
                                'darts',
                                'cricket',
                                'snooker',
                                'futsal',
                                'badminton',
                                'aussie-rules',
                                'beach-volleyball',
                                'waterpolo',
                                'floorball',
                                'bandy'
                            ]
                }   
            },
            "eSportsFixtures": {
                "compilePageList": self.getESportsFixturePages,
            },
            "tennisFixtures": {
                "compilePageList": self.getSportsFixturePages,
                "opts": {
                    "sportsList":  [
                                    'tennis'
                                ]
                }
            },
            "liveTennisUrls": {
                "compilePageList": self.getLiveTennisUrlPages,
            },
            "liveFootballUrls": {
                "compilePageList": self.getLiveFootballUrlPages
            },
            "tipsterProfiling": {
                "compilePageList": self.getTipsterProfilingPages,
            },
            "betfairEventIds": {
                "compilePageList": self.getBetfairDataPages,
            },
            "betfairStartingOdds": {
                "compilePageList": self.getStartingSoonEventsPages,
            },
            "soccerwayPrematch": {
                "compilePageList": self.getSoccerwayPages,
            },
            "tennisRankings": {
                "compilePageList": self.getTennisRankingsPages,
            },
            "userStaking": {
                "compilePageList": self.updateUserStaking,
            }
        }
        
        self.tipsterStats = {}
        
    def sendToParser(self, data):
        
        self.request('http://localhost:3000', data=data, post=True, verify=False)
                                
    
    def sendTaskUpdate(self, task, data):
        dataStr = json.dumps(data).replace('"', '\\"')
        
        query = f"""mutation {{
                            editTask(
                                key: "{task}"
                                data: "{dataStr}"
                            )
                        }}"""
        print(query)
        self.runQuery(query)
        
    def getScraperingTasks(self):
        query = f"""query {{
          getTasks
            {{
              task
              stage
              settings {{
                proxy
              }}
            }}
        }}"""
        responseData = self.runQuery(query)
        self.tasks = responseData['data']['getTasks']
        
        
        
    
    # A simple function to use requests.post to make the API call. Note the json= section.
    def runQuery(self, query):
        try:
            request = self.request(
                API_URL, data={'query': query}, headers=HEADERS, post=True, verify=False)
        except requests.exceptions.ConnectionError:
            sleep(10)
            request = self.request(
                API_URL, data={'query': query}, headers=HEADERS, post=True, verify=False)
        if request.status_code == 200:
            print(request.json())
            return request.json()
        else:
            print(request.text)
            raise Exception("Query failed to run by returning code of {}. {}".format(
                request.status_code, query))
    
    def updateUserStaking(self, opts):
        self.sendTaskUpdate("tennisFixtures", {"task":"userStaking", "stage":"In Progress"})
        query = """
            query {
                updateStaking
            }
        """
        self.runQuery(query)
        self.sendTaskUpdate("tennisFixtures", {"task":"userStaking", "stage":"Complete"})
    # Page functions
    def getSportsFixturePages(self, opts):
        
        if ('tennis' in opts['sportsList']):
            self.sendTaskUpdate("tennisFixtures", {"task":"tennisFixtures", "stage":"In Progress"})
        else:
            self.sendTaskUpdate("sportsFixtures", {"task":"sportsFixtures", "stage":"In Progress"})
        START_DATE = datetime.now()
        for sportName in opts['sportsList']:
            getDate = datetime.now()
            sport = sportName.replace('-', ' ').title()
            while getDate < START_DATE + timedelta(8):
                getDateText = getDate.strftime("%Y-%m-%d")
                print(getDateText)
                url = f"{SPORTS_BASE_URL}/{sportName}/{getDateText}"
                self.changeIP(driverKey="proxyDriver", opts={"proxy": "socks5://127.0.0.1:9051"})
                print(url)
                while True:
                    try:
                        self.drivers["proxyDriver"].get(url)
                        break
                    except selenium.common.exceptions.WebDriverException:
                        sleep(1)
                sleep(5)
                button = False
                try:
                    showMore = self.drivers['proxyDriver'].find_element(self.By.XPATH, '//button[text()="Show all matches"]')
                    print('showMore')
                    print(showMore)
                    if showMore is not None:
                        button = True
                    else:
                        sleep(2)
                        showMore = self.drivers['proxyDriver'].find_element(self.By.XPATH, '//button[text()="Show all matches"]')
                        if showMore is not None:
                            print('showMore')
                            print(showMore)
                            button = True
                    sleep(2)
                except selenium.common.exceptions.NoSuchElementException:
                    pass
                sleep(1)
                while True:
                    try:
                        while True:
                            try:
                                self.drivers['proxyDriver'].get(f'https://api.sofascore.com/api/v1/sport/{sportName}/scheduled-events/{getDateText}')
                                games = self.drivers['proxyDriver'].find_element(self.By.TAG_NAME, 'body').text
                                print(games)
                                games = json.loads(games)
                                games = games['events']
                                break
                            except selenium.common.exceptions.WebDriverException:
                                sleep(1)
                                self.drivers['proxyDriver'].quit()
                                self.loadChromedriver(key="proxyDriver", opts={"proxy": "socks5://127.0.0.1:9051"})
                            except selenium.common.exceptions.NoSuchWindowException:
                                sleep(1)
                                self.drivers['proxyDriver'].quit()
                                self.loadChromedriver(key="proxyDriver", opts={"proxy": "socks5://127.0.0.1:9051"})
                            except selenium.common.exceptions.TimeoutException:
                                sleep(1)
                                self.drivers['proxyDriver'].quit()
                                self.loadChromedriver(key="proxyDriver", opts={"proxy": "socks5://127.0.0.1:9051"})
                        if button:
                            sleep(2)
                            try:
                                self.drivers['proxyDriver'].get(f'https://api.sofascore.com/api/v1/sport/{sportName}/scheduled-events/{getDateText}/inverse')
                            except selenium.common.exceptions.WebDriverException:
                                self.drivers['proxyDriver'].quit()
                                self.loadChromedriver(key='proxyDriver', opts={'proxy': "socks5://127.0.0.1:9051"})
                                self.drives['proxyDriver'].get(f'https://api.sofascore.com/api/v1/sport/{sportName}/scheduled-events/{getDateText}/inverse')
                            except selenium.common.exceptions.NoSuchWindowException:
                                self.drivers['proxyDriver'].quit()
                                self.loadChromedriver(key='proxyDriver', opts={'proxy': "socks5://127.0.0.1:9051"})
                                self.drivers['proxyDriver'].get(f'https://api.sofascore.com/api/v1/sport/{sportName}/scheduled-events/{getDateText}/inverse')
                            except selenium.common.exceptions.TimeoutException:
                                self.drivers['proxyDriver'].quit()
                                self.loadChromedriver(key='proxyDriver', opts={'proxy': "socks5://127.0.0.1:9051"})
                                self.drivers['proxyDriver'].get(f'https://api.sofascore.com/api/v1/sport/{sportName}/scheduled-events/{getDateText}/inverse')
                            gamesToAdd = self.drivers['proxyDriver'].find_element(self.By.TAG_NAME, 'body').text
                            #print(gamesToAdd)
                            gamesToAdd = json.loads(gamesToAdd)
                            games = games + gamesToAdd['events']
                        data = {
                            'task': 'sportsFixtures',
                            'data': json.dumps(games)
                        }
                        self.sendToParser(data)
                        break
                    except json.decoder.JSONDecodeError:
                        if SERVER in games:
                            raise ValueError('tor not working')
                        print('changing IP')
                        self.changeIP(driverKey="proxyDriver", opts={"proxy": "socks5://127.0.0.1:9051"})
                        sleep(1)  
                getDate = getDate + timedelta(1)
        if ('tennis' in opts['sportsList']):
            self.sendTaskUpdate("tennisFixtures", {"task":"tennisFixtures", "stage":"Complete"})
        else:
            self.sendTaskUpdate("sportsFixtures", {"task":"sportsFixtures", "stage":"Complete"})
        
    def getESportsFixturePages(self, opts):
        self.sendTaskUpdate("eSportsFixtures", {"task":"eSportsFixtures", "stage":"In Progress"})
        url = f"{ESPORTS_BASE_URL}"
        print(url)
        self.drivers['proxyDriver'].get(url)

        sleep(3)  
        #print(BOT.soup)
        data = {
                'task': 'eSportsFixtures',
                'data': self.drivers['proxyDriver'].find_element(self.By.TAG_NAME, 'body').get_attribute('innerHTML')
            }
        self.sendToParser(data)
        self.sendTaskUpdate("eSportsFixtures", {"task":"eSportsFixtures", "stage":"Complete"})
        
            
    def getLiveTennisUrlPages(self, opts):
        self.sendTaskUpdate("liveTennisUrls", {"task":"liveTennisUrls", "stage":"In Progress"})
        self.drivers['proxyDriver'].get(TENNIS_LIVE_BASE_URL)
        sleep(5)
        data = {
                'task': 'liveTennisUrls',
                'data': self.drivers['proxyDriver'].find_element(self.By.TAG_NAME, 'body').get_attribute('innerHTML')
            }
        self.sendToParser(data)
        self.sendTaskUpdate("liveTennisUrls", {"task":"liveTennisUrls", "stage":"Complete"})
    
    def blogabet(self):
        def click_on_menu(linkText):
            while True:
                try:
                    menuBtn = self.drivers['proxyDriver'].find_element(self.By.CLASS_NAME, 'btn-blogmenu')
                    self.drivers['proxyDriver'].execute_script(
                        "arguments[0].scrollIntoView();", menuBtn)
                    self.drivers['proxyDriver'].execute_script('arguments[0].click()', menuBtn)
                except selenium.common.exceptions.NoSuchElementException:
                    return False
                # stop slow interaction with site for bot controls
                sleep(2)
                try:
                    menu = self.headlessWaitForElement("visible", 'blog-menu', self.By.CLASS_NAME, driverKey="proxyDriver")
                except selenium.common.exceptions.TimeoutException:
                    continue
                break
            try:
                followingLink = menu.find_element(self.By.PARTIAL_LINK_TEXT, linkText)
                print(followingLink)
                followingLink.click()
            except selenium.common.exceptions.ElementClickInterceptedException:
                buttons = self.drivers['proxyDriver'].find_elements_by_xpath("//*[contains(text(), 'Yes, I am over 18')]")
                buttons[0].click()
                sleep(2)
                followingLink = menu.find_element(self.By.PARTIAL_LINK_TEXT, linkText)
                print(followingLink)
                followingLink.click()
        
        def go_to_following_page():
            click_on_menu("FOLLOWING")
            
        def load_all_tipsters():
            while True:
                try:
                    self.headlessWaitForElement(
                        "visible", '_load-more', self.By.ID, waitTime=3, driverKey="proxyDriver")
                    
                    moreBtn = self.drivers['proxyDriver'].find_element(self.By.ID, '_load-more')
                    print(moreBtn)
                    if not moreBtn:
                        break
                    self.drivers['proxyDriver'].execute_script(
                        '''document.getElementById("_load-more").click()''')
                    sleep(2)
                except:
                    break
                #except selenium.common.exceptions.NoSuchElementException:
                    #break
                #except selenium.common.exceptions.WebDriverException:
                    #break
            return True
        
        def start_tipster_details():

            tipsters = self.drivers['proxyDriver'].find_element(self.By.ID, 
                '_following').find_elements_by_tag_name('li')
            for tipster in tipsters:
                print(tipster)
                dets = tipster.find_element(self.By.CLASS_NAME, 
                    'tipster').find_element(self.By.TAG_NAME, 'a')
                name = dets.get_attribute('title')
                link = dets.get_attribute('href')
                
                self.tipsterStats[name] = {}
                self.tipsterStats[name]['link'] = link
            
            
        self.drivers['proxyDriver'].get(BLOGABET_PROFILE)
        go_to_following_page()
        load_all_tipsters()
        start_tipster_details()
        tipsterPages = []
        for key, tipster in self.tipsterStats.items():
            print(tipster)
            pages = {'platform': 'blogabet'}
            self.drivers['proxyDriver'].get(tipster['link'])
            
            try:
                self.headlessWaitForElement("present", "winrate_container", self.By.ID, waitTime=5, driverKey="proxyDriver")
            except selenium.common.exceptions.TimeoutException:
                continue
            sleep(5)
            #print(BOT.drivers['proxyDriver'].find_element(BOT.By.TAG_NAME, 'body').get_attribute('innerHTML'))
            pages['dashboard'] = self.drivers['proxyDriver'].find_element(self.By.TAG_NAME, 'body').get_attribute('innerHTML')
            click_on_menu('STATISTICS')
            sleep(2)
            pages['stats'] = self.drivers['proxyDriver'].find_element(self.By.TAG_NAME, 'body').get_attribute('innerHTML')
            pages['link'] = tipster['link']
            data = {
                'task': 'tipsterProfiling',
                'data': json.dumps(pages)
            }
            self.sendToParser(data)

            
        
    def getTipsterProfilingPages(self, opts):
        self.sendTaskUpdate("tipsterProfiling", {"task":"tipsterProfiling", "stage":"In Progress"})
        self.blogabet()
        self.sendTaskUpdate("tipsterProfiling", {"task":"tipsterProfiling", "stage":"Complete"})
        
    
    def getBetfairDataPages(self, opts):
        print('eventIds')
        self.sendTaskUpdate("betfairEventIds", {"task":"betfairEventIds", "stage":"In Progress"})
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
        self.headers = BETFAIR_HEADERS_GET
        try:
            self.headers['user-agent'] = self.drivers['standard'].execute_script("return navigator.userAgent;")
        except selenium.common.exceptions.NoSuchWindowException:
            self.drivers['standard'].quit()
            self.loadChromedriver(key="standard")
            self.headers['user-agent'] = self.drivers['standard'].execute_script("return navigator.userAgent;")
        self.drivers['standard'].get('https://www.betfair.com/exchange/plus/')
        cookies = self.drivers['standard'].get_cookies()
        print(cookies)
        cookieStr = ''
        for cookie in cookies:
            cookieStr= f"{cookieStr} {cookie['name']}={cookie['value']};"
        print(cookieStr)
        self.headers['cookie'] = cookieStr.strip()
        res = self.request('https://scan-inbf.betfair.com/www/sports/navigation/facet/v1/search?_ak=nzIFcwyWhrlwYMrh&alt=json', data=DATA, post=True)
        resData: Dict = json.loads(res.text)
        data = {
                'task': 'betfairEventIds',
                'data': res.text
            }
        self.sendToParser(data)
        print(res.text)
        self.sendTaskUpdate("betfairEventIds", {"task":"betfairEventIds", "stage":"Complete"})
        
    def getStartingSoonEvents(self):
        
        now: datetime = datetime.now()
        startTime: datetime = now + timedelta(hours=12)
        print(int(now.timestamp()), int(startTime.timestamp()))
        queryFilter: Dict = {
            "sport": "Tennis",
            "eventDate": { "$gte": int(now.timestamp()), "$lte": int(startTime.timestamp()) },
            "betFair.eventId": {"$exists": True} 
        }
        query: str = f"""query {{
            getSportsEvent(filter: "{json.dumps(queryFilter).replace('"', "'")}") {{
                _id,
                homeTeam,
                awayTeam,
                betFair {{
                    eventId
                    markets {{
                        marketId
                        marketName
                        selections {{
                            selectionId
                            selectionName
                        }}
                    }}
                }}
            }}
        }}
        """
        data = self.runQuery(query)
        return data['data']['getSportsEvent']
    
    def getStartingSoonEventsPages(self, opts):
        self.sendTaskUpdate("betfairStartingOdds", {"task":"getStartingSoonEventsPages", "stage":"In Progress"})
        events = self.getStartingSoonEvents()
        print(events)
        marketIds = []
        if events is None:
            return
        else:
            for event in events:
                markets = event['betFair']['markets']
                for market in markets:
                    if market['marketName'] == 'Match Odds':
                        marketIds.append(market['marketId'])
            if len(marketIds) == 0:
                return
            self.headers = BETFAIR_HEADERS_MARKET
            try:
                self.headers['user-agent'] = self.drivers['standard'].execute_script("return navigator.userAgent;")
            except selenium.common.exceptions.NoSuchWindowException:
                self.drivers['standard'].quit()
                self.loadChromedriver(key="standard")
                self.headers['user-agent'] = self.drivers['standard'].execute_script("return navigator.userAgent;")
            cookies = self.drivers['standard'].get_cookies()
            print(cookies)
            cookieStr = ''
            for cookie in cookies:
                cookieStr= f"{cookieStr} {cookie['name']}={cookie['value']};"
            print(cookieStr)
            self.headers['cookie'] = cookieStr.strip()
            print(self.headers)
            splitMarkets = chunks(marketIds, 8)
            betfairEvents = []
            for lst in splitMarkets:
                print(f'https://ero.betfair.com/www/sports/exchange/readonly/v1/bymarket?_ak=nzIFcwyWhrlwYMrh&alt=json&currencyCode=GBP&locale=en&marketIds={",".join(lst)}&rollupLimit=1&rollupModel=STAKE&types=MARKET_STATE,RUNNER_STATE,RUNNER_EXCHANGE_PRICES_BEST')
                
                try:
                    self.drivers['standard'].get(f'https://ero.betfair.com/www/sports/exchange/readonly/v1/bymarket?_ak=nzIFcwyWhrlwYMrh&alt=json&currencyCode=GBP&locale=en&marketIds={",".join(lst)}&rollupLimit=1&rollupModel=STAKE&types=MARKET_STATE,RUNNER_STATE,RUNNER_EXCHANGE_PRICES_BEST')
                except selenium.common.exceptions.NoSuchElementException:
                    return
                res = self.drivers['standard'].find_element(self.By.TAG_NAME, 'body').find_element(self.By.TAG_NAME, 'pre').get_attribute('innerHTML')
                resData: Dict = json.loads(res)
                betfairEvents = betfairEvents + resData['eventTypes'][0]['eventNodes']
                sleep(2)
            data = {
                    'task': 'betfairStartingOdds',
                    'data': json.dumps(betfairEvents)
                }
            self.sendToParser(data)
        self.sendTaskUpdate("betfairStartingOdds", {"task":"betfairStartingOdds", "stage":"Complete"})
        
        
    def getSoccerwayPages(self, opts):
        def loadSoccerwayHomePage():
            #tomorrow = (date.today() + timedelta(days=1)).strftime('%Y/%m/%d')
            tomorrow = (date.today()).strftime('%Y/%m/%d')
            while True:
                self.drivers['proxyDriver'].get(f"https://int.soccerway.com/matches/{tomorrow}")
                sleep(3)
                body = self.drivers['proxyDriver'].find_element(self.By.TAG_NAME, 'body').text
                print(body)
                if "You don't have permission to access" in body:
                    self.changeIP(driverKey="proxyDriver", opts={"proxy": "socks5://127.0.0.1:9051"})
                    continue
                    
                break                
        def checkAgreement():
            try:
                agreementElement = self.headlessWaitForElement('visible', 'qc-cmp2-container', self.By.ID, waitTime=5, driverKey="proxyDriver")
                if agreementElement.is_displayed():
                    agreementElement.find_element(self.By.XPATH, "//button[contains(., 'AGREE')]").click()
            except selenium.common.exceptions.NoSuchElementException:
                pass
            except selenium.common.exceptions.TimeoutException:
                pass
            
        def closeFloorAdd():
            try:
                floorAd = self.drivers['proxyDriver'].find_element(self.By.CLASS_NAME, 'ad_high_impact')
                iframeId = floorAd.find_element(self.By.TAG_NAME, 'iframe').get_attribute('id')
                self.drivers['proxyDriver'].headlessSwitchToIFrame(self.By.CSS_SELECTOR, f"iframe[id='{iframeId}']", 5)
                closeFloorAdd = self.headlessWaitForElement('clickable', 'floor-close', self.By.ID, waitTime=5, driverKey='proxyDriver')
                closeFloorAdd.click()
            except selenium.common.exceptions.NoSuchElementException:
                jsScript = '''\
                const ads = document.getElementsByClassName('block_ad');
                for (let i = 0; i<ads.length; i++) {
                    ads[i].style.display = 'none'
                }
                '''
                self.drivers['proxyDriver'].execute_script(jsScript)
            except selenium.common.exceptions.ElementClickInterceptedException:
                jsScript = '''\
                const ads = document.getElementsByClassName('block_ad');
                for (let i = 0; i<ads.length; i++) {
                        ads[i].style.display = 'none'
                }
                '''
                self.drivers['proxyDriver'].execute_script(jsScript)
                jsScript = """\
                const ad = document.getElementById('"""+iframeId+"""');
                ad.style.display = 'none'
                """
                self.drivers['proxyDriver'].execute_script(jsScript)
            
        def clickCompetitionHeaders():
            groupHeads = self.drivers['proxyDriver'].find_elements_by_class_name('group-head')
            for groupHead in groupHeads:
                try:
                    if 'clickable' in groupHead.get_attribute('class'):
                        groupHead.click() 
                        sleep(1)
                except selenium.common.exceptions.ElementClickInterceptedException:
                    closeFloorAdd()
                    if 'clickable' in groupHead.get_attribute('class'):
                        groupHead.click()
                        sleep(1)
                except selenium.common.exceptions.ElementNotInteractableException:
                    print('not clickable')
                    actions = ActionChains(self.drivers['proxyDriver'])
                    actions.move_to_element(groupHead).perform()
                    sleep(0.5)
                    groupHead.click() 
                    
        def getMatchData():
            comps = {}
            matches = []
            matchTable = self.drivers['proxyDriver'].find_element(self.By.CLASS_NAME, 'matches_new').find_elements_by_tag_name('tr')

            competiton = ''
            region = ''
            roundURL = ''
            roundHead = ''
            competitionURL = ''
            competitionID = ''

            for row in matchTable:
                if 'group-head' in row.get_attribute('class'):
                    #print(row.get_attribute('innerHTML'))
                    fullComp = row.find_element(self.By.TAG_NAME, 'h3').get_attribute('textContent')
                    text = fullComp.split(' - ')
                    competitionURL = row.find_element(self.By.CLASS_NAME, 'competition-link').find_element(self.By.TAG_NAME, 'a').get_attribute('href')
                    competitionID = competitionURL.split('/')[-2]
                    competitionURL = competitionURL.rsplit('/', 4)[0]
                    if re.search("\su\d\d", fullComp.lower()) or 'youth' in fullComp.lower():
                        eventType = 'Youth'
                    elif 'women' in fullComp.lower():
                        eventType = 'Women'
                    else:
                        eventType = 'Men'

                    
            
                    competiton = text[1]
                    region = text[0]
                    roundHead = ''
                    roundURL = ''
                elif 'round-head' in row.get_attribute('class'):
                    roundHead = row.find_element(self.By.TAG_NAME, 'h4').get_attribute('textContent')
                    roundURL = row.find_element(self.By.TAG_NAME, 'h4').find_element(self.By.TAG_NAME, 'a').get_attribute('href')
                elif 'match' in row.get_attribute('class'):
                    if ':' not in row.find_element(self.By.CLASS_NAME, 'score-time').get_attribute('textContent'):
                        continue
                    matchTime = int(row.get_attribute('data-timestamp'))
                    if not isinstance(matchTime, int):
                        continue
                    try:
                        home = row.find_element(self.By.CLASS_NAME, 'team-a').find_element(self.By.TAG_NAME, 'a')
                        away = row.find_element(self.By.CLASS_NAME, 'team-b').find_element(self.By.TAG_NAME, 'a')
                        homeTeam = unidecode.unidecode(home.get_attribute('textContent').replace('\n', '').strip())
                        awayTeam = unidecode.unidecode(away.get_attribute('textContent').replace('\n', '').strip())
                        homeTeamURL = home.get_attribute('href')
                        awayTeamURL = away.get_attribute('href')
                        homeTeamID = homeTeamURL.split('/')[-2]
                        awayTeamID = awayTeamURL.split('/')[-2]
                        if re.search("\su\d\d", awayTeam.lower()) or 'youth' in awayTeam.lower() or re.search("\su\d\d", homeTeam.lower()) or 'youth' in homeTeam.lower():
                            eventType = 'Youth'
                        elif 'women' in awayTeam.lower() or 'women' in homeTeam.lower():
                            eventType = 'Women'
                        else:
                            eventType = 'Men'

                        if roundHead != '':
                            compName = f"{competiton} - {roundHead}"
                            compURL = roundURL
                        else: 
                            compName = competiton
                            compURL = competitionURL
                        if matchTime < datetime.now().timestamp():
                            status = 'Finished'
                        comps[competitionID] = {
                            'competition': compName,
                            'url': compURL
                        }

                        match = {
                            'startTime': matchTime,
                            'fixture': f"{homeTeam} - {awayTeam}",
                            'competition': compName,
                            'teams': [homeTeam, awayTeam],
                            'sport': 'Football',
                            'eventType': eventType,
                            'homeTeamID': homeTeamID,
                            'homeTeamURL': homeTeamURL,
                            'awayTeamID': awayTeamID,
                            'awayTeamURL': awayTeamURL,
                            'competitionID': competitionID,
                            'competitionURL': compURL,
                            'region': region,
                            'url': row.find_element(self.By.CLASS_NAME, 'score-time').find_element(self.By.TAG_NAME, 'a').get_attribute('href'),
                            'status': 'not-started'
                        }
                        print(match)
                        matches.append(match)
                    except selenium.common.exceptions.NoSuchElementException:
                        pass
                    except:
                        traceback.print_exc()
            return matches, comps

        def getCompData(comps):
            print(comps)
            for key, comp in comps.items():
                print(f"getting {key} data...")
                self.drivers['proxyDriver'].get(comp['url'])
                sleep(1)
                try:
                    ele = self.drivers['proxyDriver'].find_element(self.By.XPATH, '//option[text()="Wide"]')
                except selenium.common.exceptions.NoSuchElementException:
                    continue
                self.drivers['proxyDriver'].execute_script("arguments[0].click();", ele)
                sleep(2)
                tableRows = self.drivers['proxyDriver'].find_element(self.By.XPATH, '//table[contains(@class, "leaguetable")]').find_element(self.By.TAG_NAME, 'tbody').find_elements_by_tag_name('tr')
                comp['total'] = {
                        'matchesPlayed':0,
                        'goalsScored':0,
                        'goalsConceded':0
                    }
                comp['home'] = {
                        'matchesPlayed':0,
                        'goalsScored':0,
                        'goalsConceded':0
                    }
                comp['away'] = {
                        'matchesPlayed':0,
                        'goalsScored':0,
                        'goalsConceded':0
                    }
                
                while True:
                    try:
                        for row in tableRows:
                            comp['home']['matchesPlayed'] = comp['home']['matchesPlayed'] + int(row.find_element(self.By.CLASS_NAME, 'home_total').text.strip())
                            comp['home']['goalsScored'] = comp['home']['goalsScored'] + int(row.find_element(self.By.CLASS_NAME, 'home_gf').text.strip())
                            comp['home']['goalsConceded'] = comp['home']['goalsConceded'] + int(row.find_element(self.By.CLASS_NAME, 'home_ga').text.strip())
                            comp['away']['matchesPlayed'] = comp['away']['matchesPlayed'] + int(row.find_element(self.By.CLASS_NAME, 'away_total').text.strip())
                            comp['away']['goalsScored'] = comp['away']['goalsScored'] + int(row.find_element(self.By.CLASS_NAME, 'away_gf').text.strip())
                            comp['away']['goalsConceded'] = comp['away']['goalsConceded'] + int(row.find_element(self.By.CLASS_NAME, 'away_ga').text.strip())
                        break
                    except selenium.common.exceptions.StaleElementReferenceException:
                        tableRows = self.drivers['proxyDriver'].find_element(self.By.XPATH, '//table[contains(@class, "leaguetable")]').find_element(self.By.TAG_NAME, 'tbody').find_elements_by_tag_name('tr')
                
                comp['total']['matchesPlayed'] = comp['home']['matchesPlayed'] + comp['away']['matchesPlayed']
                comp['total']['goalsScored'] = comp['total']['goalsScored'] + comp['away']['goalsScored']
                comp['total']['goalsConceded'] = comp['total']['goalsConceded'] + comp['away']['goalsConceded']
                print(comp)
            return comps
            
        def getformData():
            sides = ['container-left', 'container-right']
            formtypes = ['form', 'homeForm', 'awayForm']
            forms = {}
            for index, side in enumerate(sides):
                formData = {}
                for i, form in enumerate(formtypes):
                    tempData = {
                        "form": []
                    }

                    formTableRows = self.drivers['proxyDriver'].find_element(self.By.CLASS_NAME, 'block_h2hsection_form-wrapper') \
                                    .find_element(self.By.CLASS_NAME, side) \
                                    .find_element(self.By.TAG_NAME, 'table') \
                                    .find_elements_by_tag_name('tr')
                    print(i)
                    totalGs = 0
                    totalGc = 0
                    over15Total=0
                    over25Total=0
                    over35Total=0
                    print(len(formTableRows))
                    for formTableRow in formTableRows:
                
                        print(formTableRow.get_attribute('class'))
                        if 'match' in formTableRow.get_attribute('class'):
                            score = formTableRow.find_element(self.By.CLASS_NAME, 'score-time').text
                            where = formTableRow.find_elements_by_tag_name('td')[4].text
                            print(score)
                            if score != '-' and ' - ' in score:
                                goals = score.split(' - ')
                                homeGoals = int(goals[0])
                                awayGoals = int(goals[1])
                                if where == 'H':
                                    gs = homeGoals
                                    gc = awayGoals
                                    totalGc = totalGc + awayGoals
                                    totalGs = totalGs + homeGoals
                                elif  where == 'A':
                                    gs = awayGoals
                                    gc = homeGoals
                                    totalGc = totalGc + homeGoals
                                    totalGs = totalGs + awayGoals
                                if homeGoals + awayGoals > 3:
                                    over35Total = over35Total + 1
                                    over25Total = over25Total + 1
                                    over15Total = over15Total + 1
                                elif homeGoals + awayGoals > 2:
                                    over25Total = over25Total + 1
                                    over15Total = over15Total + 1
                                elif homeGoals + awayGoals > 1:
                                    over15Total = over15Total + 1
                                if homeGoals == awayGoals:
                                    tempData['form'].append({'pts': 1, 'gs': gs, 'gc': gc})
                                elif homeGoals > awayGoals:
                                    tempData['form'].append({'pts': 3, 'gs': gs, 'gc': gc})
                                else:
                                    tempData['form'].append({'pts': 0, 'gs': gs, 'gc': gc})
                        
                                
                       
                        
                    if len(tempData['form']) == 0:
                        return False
                        
                    tempData['totalGc'] = totalGc
                    tempData['totalGs'] = totalGs
                    tempData['avgGc'] = totalGc/len(tempData['form'])
                    tempData['avgGs'] = totalGc/len(tempData['form'])
                    tempData['over15Per'] = (100/len(tempData['form']))*over15Total
                    tempData['over25Per'] = (100/len(tempData['form']))*over25Total
                    tempData['over35Per'] = (100/len(tempData['form']))*over35Total
                            
                    formData[form] = tempData
                
                    if i<2:
                        print(i)
                        menuBtn = self.drivers['proxyDriver'].find_element(self.By.CLASS_NAME, 'block_h2hsection_form-wrapper').find_element(self.By.CLASS_NAME, side).find_element(self.By.CLASS_NAME, 'subnav').find_elements_by_tag_name('li')[i+1].find_element(self.By.TAG_NAME, 'a')
                        self.drivers['proxyDriver'].execute_script(
                            "arguments[0].scrollIntoView();", menuBtn)
                        self.drivers['proxyDriver'].execute_script('arguments[0].click()', menuBtn)

                        print(self.drivers['proxyDriver'].find_element(self.By.CLASS_NAME, 'block_h2hsection_form-wrapper').find_element(self.By.CLASS_NAME, side).find_element(self.By.CLASS_NAME, 'subnav').find_elements_by_tag_name('li')[i+1].find_element(self.By.TAG_NAME, 'a'))

                        sleep(2)
                forms[side] = formData
            return forms
        def gameData(matches, comps):
            for match in matches:
                print(f"{match['url']}/head2head/")
                while True:
                    try:
                        self.drivers['proxyDriver'].get(f"{match['url']}/head2head/")
                        break
                    except selenium.common.exceptions.TimeoutException:
                        sleep(1)
                        self.drivers['proxyDriver'].quit()
                        self.loadChromedriver(key="proxyDriver", opts={"proxy": "socks5://127.0.0.1:9051"})

                query = f"""query {{
                        matchSportsEvent(
                        inputSportsEvent: {{
                            sport: "{match['sport']}",
                            region: "{match['region']}",
                            competition: "{match['competition']}",
                            eventDate: {match['startTime']},
                            homeTeam: "{match['teams'][0]}",
                            awayTeam: "{match['teams'][1]}",
                            homeTeamID: "{match['homeTeamID']}",
                            awayTeamID: "{match['awayTeamID']}",
                            competitionID: "{match['competitionID']}",
                            homeTeamURL: "{match['homeTeamURL']}",
                            awayTeamURL: "{match['awayTeamURL']}",
                            competitionURL: "{match['competitionURL']}",
                            platform : "soccerway"
                        }}) {{
                        _id
                        }}
                    }}"""
                print(query)
                resData = self.runQuery(query)
                matchId = resData['data']['matchSportsEvent']['_id']
                if matchId == "" or matchId is None:
                    continue
                try:
                    self.headlessWaitForElement("present", '//*[@id="scoring_minutes_chart_a"]//table', self.By.XPATH, driverKey="proxyDriver", waitTime=6)
                    
                except selenium.common.exceptions.TimeoutException:
                    print('no scoring charts')
                    continue
                attempts = 0
                for i in range(3):
                    try:
                        forms = getformData()
                        break
                    except selenium.common.exceptions.StaleElementReferenceException:
                        sleep(1)
                        self.changeIP(driverKey="proxyDriver", opts={"proxy": "socks5://127.0.0.1:9051"})
                        self.drivers['proxyDriver'].get(f"{match['url']}/head2head/")
                    except selenium.common.exceptions.TimeoutException:
                        sleep(1)
                        self.changeIP(driverKey="proxyDriver", opts={"proxy": "socks5://127.0.0.1:9051"})
                        self.drivers['proxyDriver'].get(f"{match['url']}/head2head/")
                    attempts = attempts + 1
                if attempts == 3:
                    continue          
                    
                if forms is False:
                    continue
                print("got forms")
                match['_id'] = matchId
                page = self.drivers['proxyDriver'].find_element(self.By.TAG_NAME, 'body').get_attribute('innerHTML')
                data = {
                    "page": page,
                    "comp": comps[match['competitionID']],
                    "forms": forms,
                    "match" : match
                }
                data = {
                    'task': 'soccerwayPrematch',
                    'data': json.dumps(data)
                }
                self.sendToParser(data)
                print('sent data')
        self.sendTaskUpdate("soccerwayPrematch", {"task":"soccerwayPrematch", "stage":"In Progress"})
        loadSoccerwayHomePage()
        #self.drivers['proxyDriver'].waitBetween(2, 6)
        sleep(2)
        checkAgreement()
        sleep(2)
        print('GETTING COMPS...')
        clickCompetitionHeaders()
        sleep(2)
        matches, comps = getMatchData()
        print("getting ... comp data")
        comps = getCompData(comps)
        
        gameData(matches, comps)
        self.sendTaskUpdate("soccerwayPrematch", {"task":"soccerwayPrematch", "stage":"Complete"})
        self.runQuery("""
                      query {
                            getTodaysPicks
                        }""")
        
    
    def getLiveFootballUrlPages(self, opts):
        self.sendTaskUpdate("liveFootballUrls", {"task":"liveFootballUrls", "stage":"In Progress"})
        todaysDate = datetime.now()
        currentDate = datetime.now()
        while currentDate < (todaysDate + timedelta(days=2)):
            currentDateStr = currentDate.strftime('%Y%m%d')
            #BOT.changeIP()
            self.drivers['proxyDriver'].get(f'https://www.scorebing.com/fixtures/{currentDateStr}')
            print(f'https://www.scorebing.com/fixtures/{currentDateStr}')
            nextPageBtn = True
            while nextPageBtn:
                self.makeSoup(self.drivers['proxyDriver'].find_element(self.By.TAG_NAME, 'body').get_attribute('innerHTML'))
                print(self.soup)
                tables = self.soup.find_all('table', {'class': 'live-list-table'})
                for table in tables:
                    #print(table.get_attribute('innerHTML'))
                    tbody = table.find('tbody')
                    #print(tbody)
                    if not tbody or type(tbody) is None:
                        continue
                
                    
                    rows = tbody.find_all('tr')
                    for row in rows:
                        #print(row)
                        tds = row.find_all('td')
                        
                        matchDate = datetime.strptime(tds[1].text.strip().split(' ')[0], '%y/%m/%d')
                        print(matchDate, datetime.strptime(currentDateStr, '%Y%m%d'))
                        if matchDate != datetime.strptime(currentDateStr, '%Y%m%d'):
                            continue
                        matchDate = datetime.strptime(tds[1].text.strip(), '%y/%m/%d %H:%M')
                        homeTeam = tds[2].find('a').text.replace('\n', '').strip()
                        awayTeam = tds[4].find('a').text.replace('\n', '').strip()
                        homeTeamURL = f"https://www.scorebing.com{tds[2].find('a')['href']}"
                        awayTeamURL = f"https://www.scorebing.com{tds[4].find('a')['href']}"
                        homeTeamID =  tds[2].find('a')['href'].split('/')[-1]
                        awayTeamID =  tds[4].find('a')['href'].split('/')[-1]
                        compDets = tds[0].find('a').text.split(' ', 1)
                        print(compDets)
                        region = compDets[0]
                        if len(compDets) == 1:
                            competition = compDets[0]
                        else: 
                            competition = compDets[1]

                        competitionID = tds[0].find('a')['href'].split('/')[-1]
                        competitionURL = f"https://www.scorebing.com{tds[0].find('a')['href']}"

                        pattern = re.compile("\su\d\d")
                        if 'women' in awayTeam.lower() or 'women' in homeTeam.lower():
                            eventType = 'Women'
                        elif 'youth' in awayTeam.lower() or 'youth' in homeTeam.lower() or pattern.search(homeTeam.lower()) or pattern.search(awayTeam.lower()):
                            eventType = 'Youth'
                        else:
                            eventType = 'Men'
                        liveUrl = tds[-2].find('a')['href'].split('/')[-1]
                        queryStr = f"""query {{
                            matchSportsEvent(
                                inputSportsEvent: {{
                                    sport: "Football"
                                    homeTeam: "{homeTeam}",
                                    awayTeam: "{awayTeam}",
                                    homeTeamID: "{homeTeamID}",
                                    homeTeamURL: "{homeTeamURL}",
                                    awayTeamID: "{awayTeamID}",
                                    awayTeamURL: "{awayTeamURL}"
                                    eventDate: {int(matchDate.timestamp())},
                                    platform: "scorebing",
                                    region: "{region}",
                                    competition: "{competition}",
                                    competitionURL: "{competitionURL}",
                                    competitionID: "{competitionID}"
                                    
                                }}
                            ) {{
                                _id
                            }}
                        }}"""
                        print(queryStr)
                        data = self.runQuery(queryStr)
                        print(data)
                        if data['data']['matchSportsEvent']['_id'] != "" and data['data']['matchSportsEvent']['_id'] is not None:
                        
                            queryStr = f"""mutation {{
                                updateSportsEvent(
                                    inputSportsEvent: {{
                                        liveUrl: "{liveUrl}"
                                    }}, 
                                    _id: "{data['data']['matchSportsEvent']['_id']}"
                                )
                            }}"""
                            data = self.runQuery(queryStr)
                            print(data)
                sleep(10)        
                try:
                    nextPageBtn = self.drivers['proxyDriver'].find_element(self.By.CLASS_NAME, 'pagination').find_elements_by_tag_name('li')[-1]

                    if 'Next' in nextPageBtn.text:
                        print('click')
                        nextPageBtn.click()
                        sleep(3)
                    else:
                        nextPageBtn = False
                except selenium.common.exceptions.StaleElementReferenceException:
                    nextPageBtn = False
                except selenium.common.exceptions.NoSuchElementException:
                    nextPageBtn = False
            currentDate = currentDate + timedelta(days=1)
        self.sendTaskUpdate("liveFootballUrls", {"task":"liveFootballUrls", "stage":"Complete"})
        
    def getTennisRankingsPages(self, opts):
        self.changeIP(driverKey="proxyDriver", opts={"proxy": "socks5://127.0.0.1:9051"})
        for rankingURL in ['https://api.sofascore.com/api/v1/rankings/type/5', 'https://api.sofascore.com/api/v1/rankings/type/6']:
            while True:
                try:
                    while True:
                        try:
                            self.drivers['proxyDriver'].get(rankingURL)
                            data = self.drivers['proxyDriver'].find_element(self.By.TAG_NAME, 'body').get_attribute('innerHTML')
                            print(data)
                            data = json.loads(data)
                            break
                        except selenium.common.exceptions.WebDriverException:
                            sleep(1)
                            self.drivers['proxyDriver'].quit()
                            self.loadChromedriver(key="proxyDriver", opts={"proxy": "socks5://127.0.0.1:9051"})
                        except selenium.common.exceptions.NoSuchWindowException:
                            sleep(1)
                            self.drivers['proxyDriver'].quit()
                            self.loadChromedriver(key="proxyDriver", opts={"proxy": "socks5://127.0.0.1:9051"})
                        except selenium.common.exceptions.TimeoutException:
                            sleep(1)
                            self.drivers['proxyDriver'].quit()
                            self.loadChromedriver(key="proxyDriver", opts={"proxy": "socks5://127.0.0.1:9051"})
                    break
                except json.decoder.JSONDecodeError:
                    if SERVER in data:
                        raise ValueError('tor not working')
                    print('changing IP')
                    self.changeIP(driverKey="proxyDriver", opts={"proxy": "socks5://127.0.0.1:9051"})
                    sleep(1)  
            data = {
                    'task': 'tennisRankings',
                    'data':  json.dumps(data['rankings'])
                }
            self.sendToParser(data)
        self.sendTaskUpdate("tennisRankings", {"task":"tennisRankings", "stage":"Complete"})