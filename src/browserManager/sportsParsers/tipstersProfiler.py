from sportsParsers.blogabet import blogabet

TIPPING_PLATFORMS = {
    'blogabet': blogabet
}



def getTipsterProfilingPages(BOT, opts):
    for key in TIPPING_PLATFORMS:
        print(key)
        TIPPING_PLATFORMS[key](BOT)




    