import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";
import { db } from "../libs/db.js";
export const createProblem = async (req, res) => {
    //going to get the all the data from body
    const { title, description, difficuilty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions } = req.body;

    //check the user role that he is admin or not

    if (req.user.role !== "ADMIN") {
        return res.status(403).json({
            error: "You are not allowed to create a problem"
        })
    }

    try {
        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
            const languageId = getJudge0LanguageId(language);

            if (!languageId) {
                return res.status(400).json({
                    error: `Language ${language} is not supported`
                })
            }

            const submissions = testcases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }))

            const submissionResults = await submitBatch(submissions)

            const tokens = submissionResults.map((res) => res.token);

            const results = await pollBatchResults(tokens)

            for (let i = 0; i < results.legth; i++) {

                const result = results[i];
                if (result.status.id !== 3) {
                    return res.status(400).json({
                        error: `Testcase ${i + 1} failed for language ${language}`
                    })
                }
            }

            const newProblem = await db.problem.creare({
                data: {
                    title, description, difficuilty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions, languageId, userId: req.user.id,
                }
            })

            return res.status(201).json(newProblem);
        }

    } catch (error) {

    }
    //loop through  each reference solution for different language
    //for each language , create a new problem in the database with the corresponding solution


}

export const getAllProblems = async (req, res) => {

}

export const getProblemById = async (req, res) => {

}

export const updateProblem = async (req, res) => {

}

export const deleteProblem = async (req, res) => {

}

export const getAllProblemsSolvedByUser = async (req, res) => {

}