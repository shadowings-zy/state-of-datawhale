const KEY = "2025-4";

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const allOrganization = require(`../data/${KEY}/allOrganization.json`);

const arkClient = new OpenAI({
    apiKey: "API_KEY",
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

const getPrompt = (organizationName, organizationUrl) => {
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

const chatWithDeepSeek = async (prompt) => {
    const response = await arkClient.chat.completions.create({
        model: "deepseek-v3-241226",
        messages: [{ role: "user", content: prompt }],
    });
    const resultString = response.choices[0].message.content;
    return JSON.parse(resultString.replace(/```json/g, "").replace(/```/g, ""));
}

const main = async () => {
    const output = []
    const startIndex = 0;
    const endIndex = allOrganization.length;
    for (let i = startIndex; i < endIndex; i++) {
        const organization = allOrganization[i];
        const organizationName = organization.name;
        const organizationUrl = `https://github.com/${organizationName}`;
        const prompt = getPrompt(organizationName, organizationUrl);
        const result = await chatWithDeepSeek(prompt);
        const resultWithOrganization = {
            ...organization,
            ...result
        }
        console.log("analysis index", i, "organization name", organizationName, "result", resultWithOrganization);
        output.push(resultWithOrganization);
    }

    fs.writeFileSync(path.join(__dirname, `../data/${KEY}/allOrganizationIntroduction.json`), JSON.stringify(output));
}

main();

