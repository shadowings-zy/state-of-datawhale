const fs = require('fs')
const path = require('path')
const { ensureDirAndWriteFile } = require("../util")

const PREVIOUS_KEY = '2025-4'
const CURRENT_KEY = '2025-7'
const MONTH_KEY = ['2025-1', '2025-2', '2025-3', '2025-4', '2025-5', '2025-6', '2025-7']

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
    return diffInfo
}

const getRepoStarMoreThan1000 = () => {
    const data = fs.readFileSync(path.join(__dirname, `../../data/${CURRENT_KEY}/datawhalechina/repoList.json`), 'utf8')
    const repoList = JSON.parse(data)
    const moreThan1000RepoList = repoList.filter(item => item.starCount >= 1000)
    const result = joinRepoDetailByName(moreThan1000RepoList)

    console.log(result)
    return result
}

const getRepoAddStarMoreThan1000 = () => {
    const previousData = fs.readFileSync(path.join(__dirname, `../../data/${PREVIOUS_KEY}/datawhalechina/repoList.json`), 'utf8')
    const currentData = fs.readFileSync(path.join(__dirname, `../../data/${CURRENT_KEY}/datawhalechina/repoList.json`), 'utf8')

    const previousRepoList = JSON.parse(previousData)
    const currentRepoList = JSON.parse(currentData)

    const diffInfo = currentRepoList.filter(item => item.starCount >= 1000).map(item => {
        const previousItem = previousRepoList.find(prevItem => prevItem.name === item.name)
        return {
            ...item,
            starAdd: item.starCount - previousItem?.starCount ?? 0,
        }
    })
    diffInfo.sort((a, b) => b.starAdd - a.starAdd)
    const result = joinRepoDetailByName(diffInfo)

    console.log(result)
    return result
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
    return result
}

const getAddStarTop3NewRepo = () => {
    const previousData = fs.readFileSync(path.join(__dirname, `../../data/${PREVIOUS_KEY}/datawhalechina/repoList.json`), 'utf8')
    const currentData = fs.readFileSync(path.join(__dirname, `../../data/${CURRENT_KEY}/datawhalechina/repoList.json`), 'utf8')

    const previousRepoList = JSON.parse(previousData)
    const currentRepoList = JSON.parse(currentData)
    const newRepoList = currentRepoList.filter(currentRepo => {
        const previousRepoStarMoreThan10RepoList = previousRepoList.filter(previousRepo => previousRepo.starCount > 10)
        return previousRepoStarMoreThan10RepoList.every(previousRepo => previousRepo.name !== currentRepo.name)
    })

    newRepoList.sort((a, b) => b.starCount - a.starCount)
    const detailRepoList = joinRepoDetailByName(newRepoList)
    const top5NewRepo = detailRepoList.slice(0, 3)

    console.log(top5NewRepo)
    return top5NewRepo
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
    return aiKnowledgeSharingOrganization
}


const main = async () => {
    const DATASOURCE_PATH = path.join(__dirname, `../../app/assets/datasource.json`);
    const top10KnowledgeSharingOrganizationInfo = getTop10KnowledgeSharingOrganizationInfo()
    const allAiKnowledgeSharingOrganizationInfo = getAllAiKnowledgeSharingOrganization()
    const projectInfo = getRepoStarMoreThan1000()
    const projectAddInfo = getRepoAddStarMoreThan1000()
    const projectAddTop5Info = getAddStarTop5Repo()
    const newProjectAddTop3Info = getAddStarTop3NewRepo()

    ensureDirAndWriteFile(
        DATASOURCE_PATH,
        JSON.stringify({
            projectInfo,
            projectAddInfo,
            projectAddTop5Info,
            newProjectAddTop3Info,
            top10KnowledgeSharingOrganizationInfo,
            allAiKnowledgeSharingOrganizationInfo
        })
    );
}

main()
