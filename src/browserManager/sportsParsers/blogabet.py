from secrets import BLOGABET_PROFILE
import selenium
from time import sleep
from bs4 import BeautifulSoup

BOT = None

TIPSTER_STATS = {}


def click_on_menu(linkText):
    while True:
        try:
            menuBtn = BOT.drivers['proxyDriver'].find_element_by_class_name('btn-blogmenu')
            BOT.drivers['proxyDriver'].execute_script(
                "arguments[0].scrollIntoView();", menuBtn)
            BOT.drivers['proxyDriver'].execute_script('arguments[0].click()', menuBtn)
        except selenium.common.exceptions.NoSuchElementException:
            return False
        # stop slow interaction with site for bot controls
        sleep(2)
        try:
            menu = BOT.headlessWaitForElement("visible", 'blog-menu', BOT.By.CLASS_NAME, driverKey="proxyDriver")
        except selenium.common.exceptions.TimeoutException:
            continue
        break
    try:
        followingLink = menu.find_element_by_partial_link_text(linkText)
        print(followingLink)
        followingLink.click()
    except selenium.common.exceptions.ElementClickInterceptedException:
        buttons = BOT.drivers['proxyDriver'].find_elements_by_xpath("//*[contains(text(), 'Yes, I am over 18')]")
        buttons[0].click()
        sleep(2)
        followingLink = menu.find_element_by_partial_link_text(linkText)
        print(followingLink)
        followingLink.click()
        
def go_to_following_page():
    click_on_menu("FOLLOWING")

def load_all_tipsters():
    while True:
        try:
            BOT.headlessWaitForElement(
                "visible", '_load-more', BOT.By.ID, waitTime=3, driverKey="proxyDriver")
            
            moreBtn = BOT.drivers['proxyDriver'].find_element_by_id('_load-more')
            print(moreBtn)
            if not moreBtn:
                break
            BOT.drivers['proxyDriver'].execute_script(
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
    global TIPSTER_STATS
    tipsters = BOT.drivers['proxyDriver'].find_element_by_id(
        '_following').find_elements_by_tag_name('li')
    for tipster in tipsters:
        print(tipster)
        dets = tipster.find_element_by_class_name(
            'tipster').find_element_by_tag_name('a')
        name = dets.get_attribute('title')
        link = dets.get_attribute('href')
        
        TIPSTER_STATS[name] = {}
        TIPSTER_STATS[name]['link'] = link
    
def blogabet(bot):
    global BOT
    BOT = bot
    BOT.drivers['proxyDriver'].get(BLOGABET_PROFILE)
    go_to_following_page()
    load_all_tipsters()
    start_tipster_details()
    tipsterPages = []
    for key, tipster in TIPSTER_STATS.items():
        print(tipster)
        pages = {'platform': 'blogabet'}
        BOT.drivers['proxyDriver'].get(tipster['link'])
        sleep(2)
        #print(BOT.drivers['proxyDriver'].find_element(BOT.By.TAG_NAME, 'body').get_attribute('innerHTML'))
        pages['dashboard'] = BeautifulSoup(BOT.drivers['proxyDriver'].find_element(BOT.By.TAG_NAME, 'body').get_attribute('innerHTML'), 'lxml')
        click_on_menu('FOLLOWING')
        sleep(2)
        pages['stats'] = BeautifulSoup(BOT.drivers['proxyDriver'].find_element(BOT.By.TAG_NAME, 'body').get_attribute('innerHTML'), 'lxml')
        tipsterPages.append(pages)
    


def getBlogabetData():
    pass