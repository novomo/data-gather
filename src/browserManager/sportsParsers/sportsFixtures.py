from datetime import datetime, timedelta
from time import sleep
import selenium
from secrets import SPORTS_BASE_URL
import json

def getSportsFixturePages(BOT, opts):
    for sportName in opts['sportsList']:
        getDate = datetime.now()
        sport = sportName.replace('-', ' ').title()
        i = 0
        while i < 8:
            getDateText = getDate.strftime("%Y-%m-%d")
            print(getDateText)
            url = f"{SPORTS_BASE_URL}/{sportName}/{getDateText}"
            BOT.changeIP(driverKey="proxyDriver", opts={"proxy": "socks5://127.0.0.1:9050"})
            print(url)
            while True:
                try:
                    BOT.drivers["proxyDriver"].get(url)
                    break
                except selenium.common.exceptions.WebDriverException:
                    sleep(1)
            sleep(5)
            button = False
            try:
                showMore = BOT.drivers['proxyDriver'].find_element_by_xpath('//button[text()="Show all matches"]')
                print('showMore')
                print(showMore)
                if showMore is not None:
                    button = True
                else:
                    sleep(2)
                    showMore = BOT.drivers['proxyDriver'].find_element_by_xpath('//button[text()="Show all matches"]')
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
                    try:
                        BOT.drivers['proxyDriver'].get(f'https://api.sofascore.com/api/v1/sport/{sportName}/scheduled-events/{getDateText}')
                        games = BOT.drivers['proxyDriver'].find_element_by_tag_name('body').text
                        print(games)
                        games = json.loads(games)
                        games = games['events']
                    except selenium.common.exceptions.WebDriverException:
                        BOT.drivers['proxyDriver'].quit()
                        BOT.loadChromedriver(driverKey="proxyDriver", options={"proxy": "socks5://127.0.0.1:9050"})
                        BOT.drivers['proxyDriver'].get(f'https://api.sofascore.com/api/v1/sport/{sportName}/scheduled-events/{getDateText}')
                        games = BOT.drivers['proxyDriver'].find_element_by_tag_name('body').text
                        print(games)
                        games = json.loads(games)
                        games = games['events']
                    except selenium.common.exceptions.NoSuchWindowException:
                        BOT.drivers['proxyDriver'].quit()
                        BOT.loadChromedriver(driverKey="proxyDriver", options={"proxy": "socks5://127.0.0.1:9050"})
                        BOT.drivers['proxyDriver'].get(f'https://api.sofascore.com/api/v1/sport/{sportName}/scheduled-events/{getDateText}')
                        games = BOT.drivers['proxyDriver'].find_element_by_tag_name('body').text
                        print(games)
                        games = json.loads(games)
                        games = games['events']
                    if button:
                        sleep(2)
                        try:
                            BOT.driver.get(f'https://api.sofascore.com/api/v1/sport/{sportName}/scheduled-events/{getDateText}/inverse')
                        except selenium.common.exceptions.WebDriverException:
                            BOT.driver.quit()
                            BOT.loadChromedriver()
                            BOT.driver.get(f'https://api.sofascore.com/api/v1/sport/{sportName}/scheduled-events/{getDateText}/inverse')
                        except selenium.common.exceptions.NoSuchWindowException:
                            BOT.driver.quit()
                            BOT.loadChromedriver()
                            BOT.driver.get(f'https://api.sofascore.com/api/v1/sport/{sportName}/scheduled-events/{getDateText}/inverse')
                        gamesToAdd = BOT.driver.find_element_by_tag_name('body').text
                        #print(gamesToAdd)
                        gamesToAdd = json.loads(gamesToAdd)
                        games = games + gamesToAdd['events']
                        break
                except json.decoder.JSONDecodeError:
                    print('changing IP')
                    BOT.changeIP()
                    sleep(1)     
    return BOT



def getSportsFixtureData():
    pass