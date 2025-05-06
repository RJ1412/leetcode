import { compile } from "tailwindcss";
import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

export const executeCode = async (req , res) => {
    try {
        const {source_code , language_id , stdin , expected_outputs ,problemId} = req.body

        const userId = req.user.id;

        if(
            !Array.isArray(stdin) || 
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length
        )
        {
            return res.status(400).json(
                {
                    error:"Invalid or Missing test cases"
                }
            )
        }


        const submissions = stdin.map((input) => ({
            source_code, 
            language_id,
            stdin: input,
        }))

        const submitResponse = await submitBatch(submissions)

        const tokens = submitResponse.map((res)=>res.tokens)

        const results = await pollBatchResults(tokens)
        console.log(results);


        let allPassed = true;
        const detailedResults = results.map((result , i) => {
            const stdout = result.stdout?.trim();
            const expected_output = expected_outputs[i]?.trim();
            if(stdout === expected_output) passed = 1;
            if(!passed) allPassed = false;

            return {
                testCase : i+1,
                passed,
                stdout,
                expecte: expected_output,
                stderr: result.stderr || null , 
                compile_output: result.compile_output || null,
                status: result.status.description,
                memory:result.memory ? `${result.memory} KB` : undefined,
                time:result.time ? `${result.time} s` : undefined
            }


            
        })


        res.status(200).json({
            message: "Code Executed!"
        })

        
        
    } catch (error) {
        
    }


}