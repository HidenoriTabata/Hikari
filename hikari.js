const fetch = require('node-fetch')
const readlineSync = require('readline-sync')
const fs = require ('fs')
const colors = require('colors')
const yargs = require('yargs')
  .option("s", {
    alias: "search",
    describe: "Search anilist for an anime/manga",
    type: "string",
    nargs: 1,
  })
  .option("completed", {
    describe: "display completed anime/manga"
  })
  .option("dropped", {
    describe: "display dropped anime/manga",
  })
  .option("planning", {
    describe: "display planned anime/manga",
  })
  .option("paused", {
    describe: "display planned anime/manga",
  })
  .option("repeating", {
    describe: "display anime/manga you are currently rewatching",
  })
  .option("manga", {
    describe: "search manga",
  }).argv



let graphql = require("./graphQL.js")


function printResults(response) {
  if (graphql.variables.search != null) {
    if (graphql.variables.type == "ANIME") {
      animeList = response.data.anime.results
      animeList.forEach(anime => {
        console.log(anime.title.userPreferred.green)
      })
    }
    else {
      mangaList = response.data.manga.results
      mangaList.forEach(manga => {
        console.log(manga.title.userPreferred.green)
      })
    }
  }
  else {
    var showNumber = 0
    animeList = response.data.MediaListCollection.lists[0].entries
    animeList.forEach(anime => {
      var animeTitle = anime.media.title.userPreferred
      var episodesWatched = String(anime.progress)
      var numberOfEpisodes = String(anime.media.episodes)
      showNumber++
      if (numberOfEpisodes == "null") {
        numberOfEpisodes = '?'
      }
      console.log("%s: " + "%s".green + " (%s/10)".yellow, showNumber, animeTitle, anime.score)
      console.log("   You have watched %s out of %s episodes", episodesWatched, numberOfEpisodes)
    })
  }
}

function getAccessToken() {
    return new Promise((resolve, reject) => {
      if (fs.existsSync("./accesstoken")) {
        // Read existing token from disk
        fs.readFile("./accesstoken", "utf8", (err,data) => {
          if (err) return reject(err)
          resolve(data)
        })
      }
      else {
        // Fetch new access token
        auth_url = "https://anilist.co/api/v2/oauth/authorize?client_id=3979&response_type=token"
        console.log("Login here to get your access token: " + auth_url)
        var accessToken = readlineSync.question("Paste token here: ")
        fs.writeFile("./accesstoken", accessToken, (err) => {
          if (err) return console.log(err)
        })
      }
  })
}

async function searchAnilist(query) {
  var accessToken = await getAccessToken()

  url = 'https://graphql.anilist.co',
    options = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: graphql.variables
      })
    }

    const response = await fetch(url, options)
    if (!response.ok) {
      throw Error(response.statusText)
    }
    printResults(await response.json())
}

if (yargs._.includes("completed")) {
  graphql.variables.status = "COMPLETED"
}
else if (yargs._.includes("dropped")) {
  graphql.variables.status = "DROPPED"
}
else if (yargs._.includes("planning")) {
  graphql.variables.status = "{PLANNING}"
}
else if (yargs._.includes("paused")) {
  graphql.variables.status = "PAUSED"
}
else if (yargs._.includes("repeating")) {
  graphql.variables.status = "REPEATING"
}

// Search defaults to anime unless specified
if (yargs._.includes("manga")) {
  graphql.variables.type = "MANGA"
}

if (yargs.s) {
  graphql.variables.search = yargs.s
  searchAnilist(graphql.searchQuery)
}
else {
  searchAnilist(graphql.query)
}