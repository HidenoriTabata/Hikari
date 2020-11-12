module.exports.variables = {
    userId: 347384,
    userName: "pongopeter826",
    type: "ANIME",
    status: "CURRENT",
    search: null,
    isAdult: false
  }
  
module.exports.query = `
  query ($userId: Int, $userName: String, $type: MediaType, $status: MediaListStatus) {
    MediaListCollection(userId: $userId, userName: $userName, type: $type, status_in: [$status]) {
      lists {
        name
        entries {
          ...mediaListEntry
        }
      }
    }
  }
  
  fragment mediaListEntry on MediaList {
    id
    mediaId
    status
    score
    progress
    progressVolumes
    repeat
    priority
    hiddenFromStatusLists
    advancedScores
    media {
      title {
        userPreferred
      }
      type
      format
      status
      episodes
      volumes
      chapters
      averageScore
      popularity
      isAdult
      genres
    }
  }
  `

module.exports.searchQuery = `
  query ($search: String, $isAdult: Boolean) {
    anime: Page(perPage: 8) {
      pageInfo {
        total
      }
      results: media(type: ANIME, isAdult: $isAdult, search: $search) {
        id
        title {
          userPreferred
        }
        type
        format
        episodes
        isLicensed
        mediaListEntry {
          progress
        }

      }
    }
    manga: Page(perPage: 8) {
      pageInfo {
        total
      }
      results: media(type: MANGA, isAdult: $isAdult, search: $search) {
        id
        title {
          userPreferred
        }
        type
        format
        chapters
        isLicensed
        startDate {
          year
        }
      }
    }
  }
  `