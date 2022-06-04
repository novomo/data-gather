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
from globals import PLATFORMS, HOOK_URL
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
    
    def __quit__(self):
        self.removeCredsToContentJS(passwrd=SCRAPER_APP_PASS, username=SCRAPER_APP_USERNAME)
        for key, value in self.browserPid.items():
            self.browserPid[key].kill()
            
    
    def __exit__(self):
        self.removeCredsToContentJS(passwrd=SCRAPER_APP_PASS, username=SCRAPER_APP_USERNAME)
        for key, value in self.browserPid.items():
            self.browserPid[key].kill()
    
    def inputCredsToContentJS(self, passwrd, username):
        with fileinput.FileInput(f"{PARENT_DIRECTORY}/extension/context.js", inplace=True, backup='.bak') as file:
            for line in file:
                print(line.replace('SCRAPER_APP_USERNAME = "USERNAME";', f'SCRAPER_APP_USERNAME = "{username}";'), end='')
                print(line.replace('SCRAPER_APP_USERNAME = "PASSWORD";', f'SCRAPER_APP_PASS = "{passwrd}";'), end='')
    
    def removeCredsToContentJS(self, passwrd, username):
        with fileinput.FileInput(f"{PARENT_DIRECTORY}/extension/context.js", inplace=True, backup='.bak') as file:
            for line in file:
                print(line.replace(f'SCRAPER_APP_USERNAME = "{username}";', 'SCRAPER_APP_USERNAME = "USERNAME";'), end='')
                print(line.replace(f'SCRAPER_APP_PASS = "{passwrd}";', 'SCRAPER_APP_USERNAME = "PASSWORD";'), end='')
        
        
        



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
        scraper.startBrowser(extensions=f"{PARENT_DIRECTORY}/extension", openWebsite="https://scraper-app.netlify.app/")
        scraper.removeCredsToContentJS(passwrd=SCRAPER_APP_PASS, username=SCRAPER_APP_USERNAME)
    finally:
        scraper.__quit__()


if __name__ in "__main__":
    main()
        
        
