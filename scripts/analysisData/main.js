const fs = require('fs')
const path = require('path')

const PREVIOUS_KEY = '2025-1'
const CURRENT_KEY = '2025-4'
const MONTH_KEY = ['2025-1', '2025-2', '2025-3', '2025-4']

const getObjectByMonthKey = (monthObject, key) => {
    const result = {}
    for (const month of key) {
        result[month] = monthObject[month] ?? 0
    }
    return result
}

const joinRepoDetailByName = (repoList) => {
    return repoList.map(item => {
        const filename = item.name.replace('datawhalechina/', '')
        const repoData = fs.readFileSync(path.join(__dirname, `../../data/${CURRENT_KEY}/datawhalechina/repoDetail/${filename}.json`), 'utf8')
        const repoDataList = JSON.parse(repoData)
        const monthlyStars = repoDataList.monthlyStars
        const monthlyTotalStars = repoDataList.monthlyTotalStars
        return {
            name: filename,
            starCount: item.starCount,
            monthlyStars: getObjectByMonthKey(monthlyStars, MONTH_KEY),
            monthlyTotalStars: getObjectByMonthKey(monthlyTotalStars, MONTH_KEY),
        }
    })
}

const getTop10KnowledgeSharingOrganizationInfo = () => {
    const previousData = fs.readFileSync(path.join(__dirname, `../../data/${PREVIOUS_KEY}/top10KnowledgeSharingOrganization.json`), 'utf8')
    const currentData = fs.readFileSync(path.join(__dirname, `../../data/${CURRENT_KEY}/top10KnowledgeSharingOrganization.json`), 'utf8')

    const previousDataList = JSON.parse(previousData)
    const currentDataList = JSON.parse(currentData)

    const diffInfo = currentDataList.map(item => {
        const previousItem = previousDataList.find(prevItem => prevItem.name === item.name)
        return {
            ...item,
            starAdd: item.starCount - previousItem.starCount,
            rankAdd: item.rank - previousItem.rank,
        }
    })

    console.log(diffInfo)
}

const getRepoStarMoreThan1000 = () => {
    const data = fs.readFileSync(path.join(__dirname, `../../data/${CURRENT_KEY}/datawhalechina/repoList.json`), 'utf8')
    const repoList = JSON.parse(data)
    const moreThan1000RepoList = repoList.filter(item => item.starCount >= 1000)
    const result = joinRepoDetailByName(moreThan1000RepoList)
    console.log(result)
}

const getAddStarTop5Repo = () => {
    const previousData = fs.readFileSync(path.join(__dirname, `../../data/${PREVIOUS_KEY}/datawhalechina/repoList.json`), 'utf8')
    const currentData = fs.readFileSync(path.join(__dirname, `../../data/${CURRENT_KEY}/datawhalechina/repoList.json`), 'utf8')

    const previousRepoList = JSON.parse(previousData)
    const currentRepoList = JSON.parse(currentData)

    const diffInfo = currentRepoList.map(item => {
        const previousItem = previousRepoList.find(prevItem => prevItem.name === item.name)
        return {
            ...item,
            starAdd: item.starCount - previousItem?.starCount ?? 0,
        }
    })
    diffInfo.sort((a, b) => b.starAdd - a.starAdd)
    const top5Repo = diffInfo.slice(0, 5)
    const result = joinRepoDetailByName(top5Repo)
    console.log(result)
}

const getAddStarTop5NewRepo = () => {
    const currentData = fs.readFileSync(path.join(__dirname, `../../data/${CURRENT_KEY}/datawhalechina/repoList.json`), 'utf8')
    const currentRepoList = JSON.parse(currentData)

    currentRepoList.sort((a, b) => b.starCount - a.starCount)
    const result = joinRepoDetailByName(currentRepoList)
    const newRepoList = result.filter(item => item.monthlyTotalStars[MONTH_KEY[0]] === item.monthlyStars[MONTH_KEY[0]])
    newRepoList.sort((a, b) => b.starCount - a.starCount).slice(0, 3)
    const top5Repo = newRepoList.slice(0, 5)
    console.log(top5Repo)
}

const getAllAiKnowledgeSharingOrganization = () => {
    const data = fs.readFileSync(path.join(__dirname, `../../data/${CURRENT_KEY}/aiKnowledgeSharingOrganization.json`), 'utf8')
    const dataList = JSON.parse(data)
    const aiKnowledgeSharingOrganization = dataList.map(item => {
        return {
            name: item.name,
            starCount: item.starCount,
            rank: item.rank,
            introduction: item.introduction,
            repo1: `${item.repoIntroductionList[0]?.name} (${item.repoIntroductionList[0]?.starCount})：${item.repoIntroductionList[0]?.introduction}`,
            repo2: `${item.repoIntroductionList[1]?.name} (${item.repoIntroductionList[1]?.starCount})：${item.repoIntroductionList[1]?.introduction}`,
            repo3: `${item.repoIntroductionList[2]?.name} (${item.repoIntroductionList[2]?.starCount})：${item.repoIntroductionList[2]?.introduction}`,
        }
    })
    console.log(aiKnowledgeSharingOrganization.map(item => `${item.name},${item.starCount},${item.rank},${item.introduction},${item.repo1},${item.repo2},${item.repo3}`).join('\n'))
}


const main = async () => {
    getTop10KnowledgeSharingOrganizationInfo()
    getRepoStarMoreThan1000()
    getAddStarTop5Repo()
    getAddStarTop5NewRepo()
    getAllAiKnowledgeSharingOrganization()
}

main()
