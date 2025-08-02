const OpenAI = require('openai');

/**
 * 构造分析github组织的提示词
 * @param {Array} organizationName 组织名
 * @param {Array} organizationUrl 组织的链接
 * @returns 提示词
 */
const getAnalyzeOrganizationPrompt = (organizationName, organizationUrl) => {
    const PROMPT = [
        `你是一名github开源组织分析师，你需要访问给定的开源组织的github主页，生成一段100字以内的开源组织介绍，并判断是否为知识分享类的开源组织，以及是否为和AI相关的开源组织。`,
        `知识分享类的开源组织的判断标准是：是否有教程类项目`,
        `和AI相关的开源组织的判断标准是：是否有AI相关的项目`,
        `组织名：${organizationName}，主页地址：${organizationUrl}`,
        `使用json格式进行输出，不需要输出其它任何内容`,
        `输出例子：{"introduction": "xxxx是一个开源组织，致力于数据科学和人工智能领域的知识分享和开源项目推广。", "isKnowledgeSharingOrganization": true, "isAIOrganization": true}`
    ]
    return PROMPT.join("\n");
}

/**
 * 构造分析仓库的提示词
 * @param {Array} repoName 仓库名
 * @param {Array} repoUrl 仓库的链接
 * @returns 提示词
 */
const getAnalyzeRepoPrompt = (repoName, repoUrl) => {
    const PROMPT = [
        `你是一名github开源组织分析师，你需要访问给定的开源项目，生成一段100字以内的开源项目介绍。`,
        `项目名：${repoName}，项目地址：${repoUrl}`,
        `使用json格式进行输出，不需要输出其它任何内容`,
        `输出例子：{"introduction": "xxxx是一个包含了如何使用xxx的教程。"}`
    ]
    return PROMPT.join("\n");
}

/**
 * 请求火山引擎的大模型服务
 * @param {Array} prompt 提示词
 * @param {Array} aiKey 大模型的key
 * @returns 提示词
 */
const chatWithDeepSeek = async (prompt, aiKey) => {
    const arkClient = new OpenAI({
        apiKey: aiKey,
        baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    });
    
    const response = await arkClient.chat.completions.create({
        model: "deepseek-v3-241226",
        messages: [{ role: "user", content: prompt }],
    });
    const resultString = response.choices[0].message.content;
    return JSON.parse(resultString.replace(/```json/g, "").replace(/```/g, ""));
}

/**
 * 根据组织列表获取组织介绍
 * @param {Array} organizationList 组织列表
 * @param {Array} oldAllOrganizationIntroduction 旧的组织介绍列表
 * @param {string} aiKey 大模型的key
 * @returns 组织介绍信息
 */
const fetchOrganizationInfoByAI = async (organizationList, oldAllOrganizationIntroduction, aiKey) => {
    const output = []
    const startIndex = 0;
    const endIndex = organizationList.length;
    for (let i = startIndex; i < endIndex; i++) {
        const organization = organizationList[i];
        const organizationName = organization.name;
        const organizationUrl = `https://github.com/${organizationName}`;
        const oldOrganization = oldAllOrganizationIntroduction.find((item) => item.name === organizationName);
        let result = null;
        if (oldOrganization) {
            result = {
                introduction: oldOrganization.introduction,
                isKnowledgeSharingOrganization: oldOrganization.isKnowledgeSharingOrganization,
                isAIOrganization: oldOrganization.isAIOrganization
            }
        } else {
            const prompt = getAnalyzeOrganizationPrompt(organizationName, organizationUrl);
            result = await chatWithDeepSeek(prompt, aiKey);
        }
        const resultWithOrganization = {
            ...organization,
            ...result
        }
        output.push(resultWithOrganization);
        console.log("analysis index", i, "organization name", organizationName, "result", resultWithOrganization);
    }
    return output;
}


/**
 * 根据仓库列表获取仓库介绍
 * @param {string} organizationName 组织名
 * @param {Array} repoList 仓库列表
 * @param {string} aiKey AI key
 * @returns 仓库介绍信息
 */
const fetchRepoInfoByAI = async (organizationName, repoList, aiKey) => {
    const output = []
    const startIndex = 0;
    const endIndex = repoList.length;
    for (let i = startIndex; i < endIndex; i++) {
        const repo = repoList[i];
        const repoName = repo.name;
        const repoUrl = `https://github.com/${repoName}`;
        const prompt = getAnalyzeRepoPrompt(repoName, repoUrl);
        const result = await chatWithDeepSeek(prompt, aiKey);
        const resultWithRepo = {
            ...repo,
            ...result,
            organizationName: organizationName,
        }
        output.push(resultWithRepo);
        console.log("analysis index", i, "repo name", repoName, "result", resultWithRepo);
    }
    return output;
}

module.exports = {
    fetchOrganizationInfoByAI,
    fetchRepoInfoByAI
}


