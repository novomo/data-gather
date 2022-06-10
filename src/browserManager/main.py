import imp
import os
import sys
import json
import selenium
import requests
import \
    random, traceback, pyautogui
from time import sleep
from discord_webhook import DiscordWebhook
from pynput.keyboard import Key
from random import choice
import fileinput


# Custom libraries
from helpers import importModuleByPath
from subprocess import Popen, PIPE
from secrets import TOR_PASS, SCRAPER_APP_USERNAME, SCRAPER_APP_PASS


DIRECTORY = os.path.dirname(os.path.abspath(__file__))
PARENT_DIRECTORY = os.path.dirname(DIRECTORY)
masterBot = importModuleByPath(f'{DIRECTORY}/master-bot/src/app.py')

class Scraper(masterBot.Bot):
    def __inti__(self, requestBot: bool=False, visualBot: bool=False, 
       imagePath: str=f"{DIRECTORY}/images", virtualDisplay: bool=False, showVirtualDisplay: int=1, proxy: str="", torPass: str=""):
        super().__init__(requestBot, visualBot, 
       imagePath, virtualDisplay, showVirtualDisplay, proxy, torPass)
        if proxy != "":
            self.addSettings()
    
    def __quit__(self):
        self.removeCredsToContentJS(passwrd=SCRAPER_APP_PASS, username=SCRAPER_APP_USERNAME)
        for key, value in self.browserPid.items():
            self.browserPid[key].kill()
            
    
    def __exit__(self):
        self.removeCredsToContentJS(passwrd=SCRAPER_APP_PASS, username=SCRAPER_APP_USERNAME)
        for key, value in self.browserPid.items():
            self.browserPid[key].kill()
    
    def inputCredsToContentJS(self, passwrd, username):
        contentFile = open(f"{PARENT_DIRECTORY}/extension/content.js", "r")
        listOfLines = contentFile.readlines()
        for index, line in enumerate(listOfLines):
            print(line)
            if 'SCRAPER_APP_USERNAME = "USERNAME";' in line:
                listOfLines[index] = f'SCRAPER_APP_USERNAME = "{username}";\n'
            if 'SCRAPER_APP_PASS = "PASSWORD";' in line:
                listOfLines[index] = f'SCRAPER_APP_PASS = "{passwrd}";\n'
        contentFile.close()
        with open(f"{DIRECTORY}/content.js", "wt") as newContentFile:
            for line in listOfLines:
                newContentFile.write(line)
    
    def removeCredsToContentJS(self, passwrd, username):
        contentFile = open(f"{PARENT_DIRECTORY}/extension/content.js", "r")
        listOfLines = contentFile.readlines()
        for index, line in enumerate(listOfLines):
            print(line)
            if f'SCRAPER_APP_USERNAME = "{username}";' in line:
                listOfLines[index] = 'SCRAPER_APP_USERNAME = "USERNAME";\n'
            if f'SCRAPER_APP_PASS = "{passwrd}";' in line:
                listOfLines[index] = 'SCRAPER_APP_USERNAME = "PASSWORD";\n'
        contentFile.close()
        with open(f"{DIRECTORY}/content.js", "wt") as newContentFile:
            for line in listOfLines:
                newContentFile.write(line)
    
    def addSettings(self, proxy):
        contentFile = open(f"{PARENT_DIRECTORY}/extension/content.js", "r")
        listOfLines = contentFile.readlines()
        if proxy:
            listOfLines[0] = f"const proxy = true\n"
        elif proxy is False:
            listOfLines[0] = f"const proxy = false\n"
        contentFile.close()
        with open(f"{PARENT_DIRECTORY}/extension/content.js", "wt") as newContentFile:
            for line in listOfLines:
                newContentFile.write(line)
        
        
def main():
    try:
        virtualDisplay=True 
        showVirtualDisplay=0
        proxy = ""
        torPass = ""
        if '-d' in sys.argv:
            virtualDisplay = False
            showVirtualDisplay = 1
        if '-p' in sys.argv:
            proxy = "socks5://127.0.0.1:9050"
            torPass = TOR_PASS
        
        
            
        scraper = Scraper(requestBot=True, visualBot=True, imagePath=f'{DIRECTORY}/images', virtualDisplay=virtualDisplay, showVirtualDisplay=showVirtualDisplay, proxy=proxy, torPass=torPass)
        scraper.inputCredsToContentJS(passwrd=SCRAPER_APP_PASS, username=SCRAPER_APP_USERNAME)
        scraper.startBrowser("scraper", extensions=f"{PARENT_DIRECTORY}/extension", openWebsite="https://scraper-web-app-f97e9.web.app/")
        scraper.removeCredsToContentJS(passwrd=SCRAPER_APP_PASS, username=SCRAPER_APP_USERNAME)
    finally:
        try:
            scraper.__quit__()
        except UnboundLocalError:
            pass


if __name__ in "__main__":
    main()
        
        
