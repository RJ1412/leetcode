import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useProblemStore } from "../store/useProblemStore";
import { Editor, useMonaco } from "@monaco-editor/react";
const difficulties = ["EASY", "MEDIUM", "HARD"];

const EditProblemModal = ({ isOpen, onClose, problem }) => {
    const { updateProblem } = useProblemStore();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficuilty: "EASY",
        tags: [],
        examples: [],
        constraints: "",
        testcases: [],
    });

    const [jsCode, setJsCode] = useState("");
    const [pyCode, setPyCode] = useState("");
    const [javaCode, setJavaCode] = useState("");

    useEffect(() => {
        if (!problem) return;

        const ensureArray = (val) => (Array.isArray(val) ? val : []);

        setFormData({
            title: problem.title || "",
            description: problem.description || "",
            difficuilty: problem.difficuilty || "EASY",
            tags: ensureArray(problem.tags),
            examples: ensureArray(problem.examples),
            constraints: problem.constraints || "",
            testcases: ensureArray(problem.testcases),
        });

        const codeSources = {
            ...problem.codeSnippets,
            ...(problem.referenceSolutions || {}),
        };

        setJsCode(codeSources.JAVASCRIPT || codeSources.javascript || "");
        setPyCode(codeSources.PYTHON || codeSources.python || "");
        setJavaCode(codeSources.JAVA || codeSources.java || "");
    }, [problem]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (e, field) => {
        const arr = e.target.value.split(",").map((item) => item.trim()).filter(Boolean);
        setFormData((prev) => ({ ...prev, [field]: arr }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!problem) return;

        const codeSnippets = {};
        if (jsCode.trim()) codeSnippets.JAVASCRIPT = jsCode.trim();
        if (pyCode.trim()) {
            console.log(pyCode);
            
            const sanitized = pyCode
                .replace(/\t/g, '    ') // replace tabs with spaces
                .split('\n')
                .map(line => line.replace(/\s+$/, '')) // trim trailing spaces
                .join('\n');

            console.log(sanitized);
            
            codeSnippets.PYTHON = sanitized;
        }



        if (javaCode.trim()) codeSnippets.JAVA = javaCode.trim();

        const res = await updateProblem(problem.id, {
            ...formData,
            codeSnippets,
            referenceSolutions: problem.referenceSolutions, // Preserve original solutions
        });

        if (res.success) onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-base-300">
                    <h3 className="text-xl font-bold">Edit Problem</h3>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="form-control">
                        <label className="label font-medium">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label font-medium">Description</label>
                        <textarea
                            name="description"
                            rows={5}
                            value={formData.description}
                            onChange={handleChange}
                            className="textarea textarea-bordered w-full"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label font-medium">Difficulty</label>
                        <select
                            name="difficuilty"
                            value={formData.difficuilty}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                        >
                            {difficulties.map((diff) => (
                                <option key={diff} value={diff}>
                                    {diff}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-control">
                        <label className="label font-medium">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={formData.tags.join(", ")}
                            onChange={(e) => handleArrayChange(e, "tags")}
                            className="input input-bordered w-full"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label font-medium">Constraints</label>
                        <input
                            type="text"
                            name="constraints"
                            value={formData.constraints}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                        />
                    </div>

                    {/* Structured Examples */}
                    <div className="form-control">
                        <label className="label font-medium">Examples</label>
                        {formData.examples.map((example, idx) => (
                            <div key={idx} className="border p-3 rounded-md mb-3 bg-base-200">
                                <div className="flex gap-2 mb-2">
                                    <label className="w-20 font-semibold">Input:</label>
                                    <input
                                        type="text"
                                        value={example.input}
                                        onChange={(e) => {
                                            const updated = [...formData.examples];
                                            updated[idx].input = e.target.value;
                                            setFormData((prev) => ({ ...prev, examples: updated }));
                                        }}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <label className="w-20 font-semibold">Output:</label>
                                    <input
                                        type="text"
                                        value={example.output}
                                        onChange={(e) => {
                                            const updated = [...formData.examples];
                                            updated[idx].output = e.target.value;
                                            setFormData((prev) => ({ ...prev, examples: updated }));
                                        }}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updated = formData.examples.filter((_, i) => i !== idx);
                                        setFormData((prev) => ({ ...prev, examples: updated }));
                                    }}
                                    className="btn btn-error btn-sm mt-2"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() =>
                                setFormData((prev) => ({
                                    ...prev,
                                    examples: [...prev.examples, { input: "", output: "" }],
                                }))
                            }
                            className="btn btn-secondary btn-sm mt-2"
                        >
                            + Add Example
                        </button>
                    </div>

                    <div className="form-control">
                        <label className="label font-medium">Testcases</label>
                        {formData.testcases.map((testcase, idx) => (
                            <div key={idx} className="flex flex-col gap-2 mb-4 border p-3 rounded-md bg-base-200">
                                <div className="flex gap-2">
                                    <label className="w-20 font-semibold">Input:</label>
                                    <input
                                        type="text"
                                        value={testcase.input}
                                        onChange={(e) => {
                                            const updated = [...formData.testcases];
                                            updated[idx].input = e.target.value;
                                            setFormData((prev) => ({ ...prev, testcases: updated }));
                                        }}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <label className="w-20 font-semibold">Output:</label>
                                    <input
                                        type="text"
                                        value={testcase.output}
                                        onChange={(e) => {
                                            const updated = [...formData.testcases];
                                            updated[idx].output = e.target.value;
                                            setFormData((prev) => ({ ...prev, testcases: updated }));
                                        }}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updated = formData.testcases.filter((_, i) => i !== idx);
                                        setFormData((prev) => ({ ...prev, testcases: updated }));
                                    }}
                                    className="btn btn-error btn-sm w-fit self-end"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() =>
                                setFormData((prev) => ({
                                    ...prev,
                                    testcases: [...prev.testcases, { input: "", output: "" }],
                                }))
                            }
                            className="btn btn-secondary btn-sm w-fit mt-2"
                        >
                            + Add Testcase
                        </button>
                    </div>

                    {/* Code Snippets */}
                    <div className="form-control">
                        <label className="label font-medium">JavaScript Solution</label>
                        <textarea
                            value={jsCode}
                            onChange={(e) => setJsCode(e.target.value)}
                            className="textarea textarea-bordered w-full font-mono"
                            rows={6}
                            placeholder="// JavaScript solution..."
                        />
                    </div>

                    <div className="form-control">
                        <label className="label font-medium">Python Solution</label>
                        <textarea
                            value={pyCode}
                            onChange={(e) => setPyCode(e.target.value)}
                            className="textarea textarea-bordered w-full font-mono"
                            rows={6}
                            placeholder="# Python solution..."
                        />
                    </div>


                    <div className="form-control">
                        <label className="label font-medium">Java Solution</label>
                        <textarea
                            value={javaCode}
                            onChange={(e) => setJavaCode(e.target.value)}
                            className="textarea textarea-bordered w-full font-mono"
                            rows={6}
                            placeholder="// Java solution..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="btn btn-ghost">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProblemModal;
