
import sys, os
from time import sleep

from secret import TOR_PASS, HOOK_URL
import traceback
from discord_webhook import DiscordWebhook
from scraper import ScraperBot





'''
def updateCron (now, nxt, cron ):
    query = f"""mutation {{
                        updateCron(inputCron: {{
                            key: "{cron}",
                            nxtRun: {int(now.timestamp())},
                            lastRun: {int(nxt.timestamp())}
                        }})
                    }}"""
    run_query(query, BOT)

def cronFinished (finished, cron):
    query = f"""mutation {{
                        updateCron(inputCron: {{
                            key: "{cron}",
                            lastFinished: {int(finished.timestamp())}
                        }})
                    }}"""
    run_query(query, BOT)
    '''
        
        
def main():
    os.system('killall chrome')

    if '-d' in sys.argv:
        headless = False
    else:
        headless = True

    if '-p' in sys.argv:
        proxy = "socks5://127.0.0.1:9050"
    else:
        proxy = ""
        
    if proxy == "socks5://127.0.0.1:9050":
        torPass = TOR_PASS
    else:
        torPass = ''

    BOT = ScraperBot(
        requestBot=True, 
        seleniumBot=True, 
        headless=headless,
        implicitWait=3, 
        proxy=proxy, 
        torPass=torPass,
        loadChrome=False
    )

    print(1)
    BOT.loadChromedriver(key='standard')
    print(2)
    BOT.loadChromedriver(key='proxyDriver', opts={'proxy': "socks5://127.0.0.1:9050"})
    sleep(2)
    try:
        while True:
            try:
                BOT.getScraperingTasks()
                print(BOT.tasks)         
                for task in BOT.tasks:
                    if task['stage'] == "New":
                        if 'opts' in BOT.config[task['task']]:
                            opts = BOT.config[task['task']]["opts"]
                        else:
                            opts = {}
                        print(task)
                        BOT.config[task['task']]["compilePageList"](opts)
                # add back after history finished sleep(900)
                BOT.config["historicFixtures"]["compilePageList"](opts)
            except ValueError:
                BOT.quit()
                BOT = None
                os.system('killall chrome')
                BOT = ScraperBot(
                    requestBot=True, 
                    seleniumBot=True, 
                    headless=headless,
                    implicitWait=3, 
                    proxy=proxy, 
                    torPass=torPass,
                    loadChrome=False
                )
                print(1)
                BOT.loadChromedriver(key='standard')
                print(2)
                BOT.loadChromedriver(key='proxyDriver', opts={'proxy': "socks5://127.0.0.1:9050"})
                sleep(2)

    except:
        traceback.print_exc()
        DiscordWebhook(url=HOOK_URL, content=traceback.format_exc()).execute()
                
    ''''
    if monitoring:
        DiscordWebhook(url=HOOK_URL, content='Started daily sports data collection').execute()
    try:
        if len(sys.argv) < 2:
            sys.exit(0)
        if '-f' in sys.argv:
            try:

                now = datetime.now()
                nxt = now + timedelta(days=2)


                DiscordWebhook(url=HOOK_URL, content='loopThroughSports').execute()


                sportsList = []
                if '-sport' in sys.argv:
                    sportsListIndex = sys.argv.index('-sport')

                    sportsList = sys.argv[sportsListIndex + 1].split(" ")
                    if 'tennis' in sportsList:

                        nxt = now + timedelta(hours=3)
                        #updateCron(now, nxt,"get_tennis_fixtures")
                        DiscordWebhook(url=HOOK_URL, content='tennisFixtures').execute()
                        #requests.post("http://localhost:5000", json={"task": "sportsFixtures"})
                else: 
                    DiscordWebhook(url=HOOK_URL, content='Fixtures').execute()
                    #updateCron(now, nxt,"get_sports_fixtures")
                    #requests.post("http://localhost:5000", json={"task": "sportsFixtures"})
                loopThroughSports(bot=BOT, sportsList=sportsList)

                        #nxt = now + timedelta(hours=3)
                        #updateCron(now, nxt,"get_tennis_fixtures")
                        requests.post("http://localhost:5000", json={"task": "tennisFixtures"})
                else: 
                    #updateCron(now, nxt,"get_sports_fixtures")
                    requests.post("http://localhost:5000", json={"task": "sportsFixtures"})

                #loopThroughSports(BOT, sportsList)


                now = datetime.now()
                if 'tennis' in sportsList:
                    cr = "get_tennis_fixtures"
                else:
                   cr = "get_sports_fixtures" 
                #cronFinished(now, cr)
                DiscordWebhook(url=HOOK_URL, content='loopThroughSports Finished').execute()
            except:
                traceback.print_exc()
                DiscordWebhook(url=HOOK_URL, content=traceback.format_exc()).execute()
        if '-t' in sys.argv:
            try:
                now = datetime.now()
                nxt = now + timedelta(days=2)
                
                #updateCron(now, nxt,"get_tipster_information")
               
               
                DiscordWebhook(url=HOOK_URL, content='getTipsterInfo').execute()

                getTipsterInfo(bot=BOT)
                #requests.post("http://localhost:5000", json={"task": "tipsters"})

                #getTipsterInfo(BOT)

                now = datetime.now()
                #cronFinished(now, "get_tipster_info")

               
                DiscordWebhook(url=HOOK_URL, content='getTipsterInfo Finished').execute()
            except:
                traceback.print_exc()
                DiscordWebhook(url=HOOK_URL, content=traceback.format_exc()).execute()
        if '-ef' in sys.argv:
            try:
                now = datetime.now()
                nxt = now + timedelta(hours=2)
                #updateCron(now, nxt,"get_esports_fixtures")
               
                DiscordWebhook(url=HOOK_URL, content='getEsports').execute()
                getEsports(bot=BOT)
                now = datetime.now()
                #cronFinished(now, "get_esports_fixtures")

                #requests.post("http://localhost:5000", json={"task": "esportsFixtures"})

                DiscordWebhook(url=HOOK_URL, content='getEsports Finished').execute()
            except:
                traceback.print_exc()
                DiscordWebhook(url=HOOK_URL, content=traceback.format_exc()).execute()
        if '-ll' in sys.argv:
            try:
                now = datetime.now()
                nxt = now + timedelta(days=1)
                #updateCron(now, nxt,"get_live_sports_data_links")
               
                DiscordWebhook(url=HOOK_URL, content='getLiveDataLinks').execute()
                liveFootball = False
                liveTennis = False
                if '-live-football' in sys.argv:
                    liveFootball = True
                if '-live-tennis' in sys.argv:
                    liveTennis = True
                getLiveDataLinks(bot=BOT, football=liveFootball, tennis=liveTennis)
                #requests.post("http://localhost:5000", json={"task": "liveTennis"})
                now = datetime.now()
                #cronFinished(now, "get_live_sports_data_links")

                DiscordWebhook(url=HOOK_URL, content='getLiveDataLinks Finished').execute()
            except:
                traceback.print_exc()
                DiscordWebhook(url=HOOK_URL, content=traceback.format_exc()).execute()
        if '-b' in sys.argv:
            try:
                now = datetime.now()
                nxt = now + timedelta(hours=4)
                #updateCron(now, nxt,"betfair_data")

                DiscordWebhook(url=HOOK_URL, content='BetfairData').execute()
                getBetfairData(bot=BOT)
                #requests.post("http://localhost:5000", json={"task": "betfairEventId"})
                now = datetime.now()
                #cronFinished(now, "betfair_data")
            except:
                traceback.print_exc()
                DiscordWebhook(url=HOOK_URL, content=traceback.format_exc()).execute()
        if '-bso' in sys.argv:
            try:
                now = datetime.now()
                nxt = now + timedelta(hours=4)
                #updateCron(now, nxt,"betfair_starting_odds")

                DiscordWebhook(url=HOOK_URL, content='BetfairStartingOdds').execute()
                getBetfairStartingOdds(bot=BOT)
                #requests.post("http://localhost:5000", json={"task": "betfairStartingOdds"})
                now = datetime.now()
                #cronFinished(now, "betfair_starting_odds")
            except:
                traceback.print_exc()
                DiscordWebhook(url=HOOK_URL, content=traceback.format_exc()).execute()
           
    except:
        traceback.print_exc()
        DiscordWebhook(url=HOOK_URL, content=traceback.format_exc()).execute()
    if monitoring:
        DiscordWebhook(url=HOOK_URL, content='Finished daily sports data collection').execute()

    BOT.driver.quit()
    '''

if __name__ in "__main__":
    main()