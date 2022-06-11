from secrets import API_URL, HEADERS


# A simple function to use requests.post to make the API call. Note the json= section.
def run_query(query, bot):
    request = bot.request(
        API_URL, data={'query': query}, headers=HEADERS, post=True, verify=False)
    if request.status_code == 200:
        print(request.json())
        return request.json()
    else:
        print(request.text)
        raise Exception("Query failed to run by returning code of {}. {}".format(
            request.status_code, query))


def getTasks(bot):
    query = f"""query {{
          getTasks
            {{
              task
              tabStatus
              currentPage
              pages
              stage
              tabId
              gotCurrent
              settings {{
                proxy
              }}
            }}
    }}"""
    responseData = run_query(query, bot)
    return responseData['data']['getTasks']
    