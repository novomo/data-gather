import os, fileinput

DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def addSettings(proxy):
    contentFile = open(f"{DIRECTORY}/content.js", "r")
    listOfLines = contentFile.readlines()
    if proxy:
        listOfLines[0] = f"const proxy = true\n"
    elif proxy is False:
        listOfLines[0] = f"const proxy = false\n"
    contentFile.close()
    with open(f"{DIRECTORY}/content.js", "wt") as newContentFile:
        for line in listOfLines:
            newContentFile.write(line)
            
            
def inputCredsToContentJS(passwrd, username):
    contentFile = open(f"{DIRECTORY}/content.js", "r")
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
                
                
#addSettings(True)

inputCredsToContentJS("bob", "test")