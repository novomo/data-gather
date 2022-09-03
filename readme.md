Setup



Components

All components are just parts of the framework and no specific website exapmles are given.

Task management and Data parsing

Data parsing server is a mico task server that will process the data that is recive through custom functions. These functions can in added in the src/dataParser/parsingFunctions folder as Python files. Python is used in 
this instance for the abilities to easily intergrate C/C++ code to increase preformance but thiscan be changed to your liking.

The task managment server is just a microserver that passes the tasks on to the browser extension through a graphql Subscription. I this case crontab is used to automated the requests sent to the server. This method allows 
for scalable changes to be made in the future.

Browser manager and Extension

The browser managers purpose is to control the OS browser activties, this is done through asubmodule called master-bot that is a wrapper for most python data scraping libraries with the addition of tor and openCV.
link to master-bit repo. https://github.com/novomo/master-bot.git

Extension extension has a simple task of monitor and navigating to and throw the web browsers tabs and windows to send back the data to the data parsing server, for it to be processed


Usage


