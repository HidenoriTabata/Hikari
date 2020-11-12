const fetch = require('node-fetch')
const readlineSync = require('readline-sync')
const fs = require ('fs')
const colors = require('colors')
const yargs = require('yargs')(process.argv.slice(2)).argv

/*
TODO:
Finish making the granular search controls work
Use yargs to fix command line arguments
Implement inc/dec tool (I think I will have to use anime/manga ids for this)
Write login comment
*/

let graphql = require("./graphQL.js")
// const { resolve } = require('path')


function checkGraphQL(graphql) {
  console.log(graphql.anime)
  if (graphql.data == null) {
    console.log("ERROR: " + graphql.errors[0].message)
    process.exit(1)
  }
  // else if (typeof graphql.data.MediaListCollection.lists[0] == 'undefined') {
  //   console.log("ERROR: No data found.")
  //   process.exit(1)
  // }

  return graphql
}


function printResults(response) {
  if (graphql.variables.search != null) {
    if (graphql.variables.type == "ANIME") {
      animeList = response.data.anime.results
      animeList.forEach(anime => {
        console.log(anime.title.userPreferred)
      })
    }
    else {
      mangaList = response.data.manga.results
      mangaList.forEach(manga => {
        console.log(manga.title.userPreferred)
      })
    }
  }
  else {
    var itemNumber = 0
    animeList = response.data.MediaListCollection.lists[0].entries
    animeList.forEach(anime => {
      var AnimeTitle = anime.media.title.userPreferred
      var EpisodesWatched = String(anime.progress)
      var NumberOfEpisodes = String(anime.media.episodes)
      itemNumber++
      if (NumberOfEpisodes == "null") {
        NumberOfEpisodes = '?'
      }
      console.log(itemNumber + ": " + AnimeTitle.green)
      console.log("   You have watched " + EpisodesWatched.white + " out of " + NumberOfEpisodes.white + " episodes")
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
        console.log("Go to this url: " + auth_url)
        var accessToken = readlineSync.question("Enter: ")
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

if (yargs._.includes("completed")) {
  graphql.variables.status = "COMPLETED"
}


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