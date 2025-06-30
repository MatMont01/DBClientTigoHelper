import React, {useState, ChangeEvent} from "react";
import type {AutomationTaskMeta} from "../types/TaskTypes";
import {useAutomationTask} from "../hooks/useAutomationTask";
import {nanoid} from "nanoid";
import {exportAutomationTask} from "../utils/tauriHelpers";
import {PreviewTable} from "./PreviewTable";
import {writeFile, readFile} from "@tauri-apps/plugin-fs";
import {save as dialogSave} from "@tauri-apps/plugin-dialog";
import {join, tempDir} from "@tauri-apps/api/path";
import {motion, AnimatePresence} from "framer-motion";

type TaskRunnerPanelProps = {
    task: AutomationTaskMeta;
};

export const TaskRunnerPanel: React.FC<TaskRunnerPanelProps> = ({task}) => {
    const [scheduleFile, setScheduleFile] = useState<File | null>(null);
    const [clientsFile, setClientsFile] = useState<File | null>(null);
    const [filter, setFilter] = useState<"all" | "b2b" | "b2c">("all");
    const [exporting, setExporting] = useState(false);

    const {status, result, error, runTask} = useAutomationTask(task.key);

    async function saveFileTemp(file: File, prefix: string): Promise<string> {
        const arrayBuffer = await file.arrayBuffer();
        const ext = file.name.split(".").pop() || "xlsx";
        const fileName = `${prefix}_${Date.now()}_${nanoid(6)}.${ext}`;
        const tempPath = await join(await tempDir(), fileName);
        await writeFile(tempPath, new Uint8Array(arrayBuffer));
        return fileName;
    }

    function handleFileChange(
        e: ChangeEvent<HTMLInputElement>,
        type: "schedule" | "clients"
    ) {
        const file = e.target.files && e.target.files[0];
        if (type === "schedule") setScheduleFile(file ?? null);
        if (type === "clients") setClientsFile(file ?? null);
    }

    async function handleRunTask() {
        if (!scheduleFile || !clientsFile) return;
        const schedulePath = await saveFileTemp(scheduleFile, "cronograma");
        const clientsPath = await saveFileTemp(clientsFile, "clientes");
        await runTask({
            schedule_path: schedulePath,
            clients_path: clientsPath,
            filter_b2b: filter,
        });
    }

    async function handleExport() {
        if (!scheduleFile || !clientsFile) return;
        setExporting(true);
        try {
            const schedulePath = await saveFileTemp(scheduleFile, "cronograma");
            const clientsPath = await saveFileTemp(clientsFile, "clientes");
            const filename = await exportAutomationTask(task.key, {
                schedule_path: schedulePath,
                clients_path: clientsPath,
                filter_b2b: filter,
            });

            const savePath = await dialogSave({
                defaultPath: filename,
                filters: [{name: "Excel", extensions: ["xlsx"]}],
            });

            if (!savePath || !filename) {
                setExporting(false);
                alert("Exportación cancelada o archivo no generado.");
                return;
            }

            const tempDirectory = await tempDir();
            const tempFilePath = await join(tempDirectory, filename);
            const fileBytes = await readFile(tempFilePath);
            await writeFile(savePath, fileBytes);

            alert("Archivo exportado exitosamente.");
        } catch (err) {
            alert(
                `Error exportando el archivo: ${
                    err instanceof Error ? err.message : JSON.stringify(err)
                }`
            );
        }
        setExporting(false);
    }

    return (
        <motion.div
            className="
                max-w-xl mx-auto my-8 p-6 rounded-3xl shadow-2xl
                bg-blue-50 border border-blue-300
                dark:bg-[#181e2a] dark:border-blue-900/60
            "
            initial={{opacity: 0, scale: 0.97, y: 30}}
            animate={{opacity: 1, scale: 1, y: 0}}
            transition={{duration: 0.45, ease: "easeOut"}}
        >
            <h2 className="font-extrabold text-2xl text-blue-800 dark:text-blue-300 mb-2 tracking-tight">
                {task.displayName}
            </h2>
            <p className="mb-5 text-blue-900/80 dark:text-gray-400 font-medium text-base">
                {task.description}
            </p>
            <div className="mb-4 flex flex-col gap-4">
                <label className="block">
                    <span className="font-semibold text-blue-800 dark:text-gray-200">
                        Archivo de cronograma:
                    </span>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => handleFileChange(e, "schedule")}
                        className="
                            block mt-2 w-full
                            bg-blue-100 text-blue-900 border border-blue-400 rounded-xl px-3 py-2 shadow-sm
                            file:bg-blue-100 file:text-blue-700 file:border-none file:rounded-lg
                            transition focus:border-blue-500 focus:ring-1 focus:ring-blue-400
                            dark:bg-gray-800 dark:text-gray-100 dark:border-blue-500/30
                            dark:file:bg-blue-900 dark:file:text-blue-200
                        "
                    />
                </label>
                <label className="block">
                    <span className="font-semibold text-blue-800 dark:text-gray-200">
                        Archivo de clientes:
                    </span>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => handleFileChange(e, "clients")}
                        className="
                            block mt-2 w-full
                            bg-blue-100 text-blue-900 border border-blue-400 rounded-xl px-3 py-2 shadow-sm
                            file:bg-blue-100 file:text-blue-700 file:border-none file:rounded-lg
                            transition focus:border-blue-500 focus:ring-1 focus:ring-blue-400
                            dark:bg-gray-800 dark:text-gray-100 dark:border-blue-500/30
                            dark:file:bg-blue-900 dark:file:text-blue-200
                        "
                    />
                </label>
                <label className="block">
                    <span className="font-semibold text-blue-800 dark:text-gray-200">
                        Filtro de clientes:
                    </span>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as "all" | "b2b" | "b2c")}
                        className="
                            block mt-2 px-3 py-2 rounded-xl
                            bg-blue-100 text-blue-900 border border-blue-400
                            focus:border-blue-500 focus:ring-1 focus:ring-blue-400 transition
                            dark:bg-gray-800 dark:text-blue-200 dark:border-blue-500/30
                        "
                    >
                        <option value="all">Mostrar todos</option>
                        <option value="b2b">Solo B2B</option>
                        <option value="b2c">Solo B2C</option>
                    </select>
                </label>
            </div>
            <motion.button
                whileTap={{scale: 0.98}}
                className="
                    w-full mt-4 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white font-bold py-2 rounded-xl
                    shadow-lg hover:bg-blue-700 hover:shadow-blue-600/40
                    transition-all duration-200 disabled:opacity-50
                "
                disabled={!scheduleFile || !clientsFile || status === "loading"}
                onClick={handleRunTask}
            >
                {status === "loading" ? (
                    <motion.span
                        className="inline-block animate-spin mr-2"
                        style={{borderTopColor: "#38bdf8"}}
                    >
                        <svg
                            className="w-5 h-5 inline-block"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-20"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="#38bdf8"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-70"
                                fill="#38bdf8"
                                d="M4 12a8 8 0 018-8v8z"
                            ></path>
                        </svg>
                    </motion.span>
                ) : null}
                {status === "loading" ? "Procesando..." : "Procesar"}
            </motion.button>
            <motion.button
                whileTap={{scale: 0.98}}
                className="
                    w-full mt-2 bg-gradient-to-r from-cyan-700 via-blue-700 to-blue-900 text-white font-bold py-2 rounded-xl
                    shadow-lg hover:bg-cyan-700 hover:shadow-cyan-700/40
                    transition-all duration-200 disabled:opacity-50
                "
                disabled={!scheduleFile || !clientsFile || exporting}
                onClick={handleExport}
            >
                {exporting ? (
                    <motion.span
                        className="inline-block animate-spin mr-2"
                        style={{borderTopColor: "#38bdf8"}}
                    >
                        <svg
                            className="w-5 h-5 inline-block"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-20"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="#38bdf8"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-70"
                                fill="#38bdf8"
                                d="M4 12a8 8 0 018-8v8z"
                            ></path>
                        </svg>
                    </motion.span>
                ) : null}
                {exporting ? "Exportando..." : "Exportar resultado a Excel"}
            </motion.button>

            <AnimatePresence>
                {error && (
                    <motion.div
                        className="mt-4 text-center rounded-lg bg-red-700/80 text-red-200 px-4 py-3 font-semibold shadow-lg"
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: 10}}
                        transition={{duration: 0.35}}
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {status === "success" && result && (
                    <motion.div
                        className="mt-10"
                        initial={{opacity: 0, y: 25}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: 25}}
                        transition={{duration: 0.45}}
                    >
                        <h3 className="font-semibold mb-3 text-lg text-blue-800 dark:text-blue-300">
                            Preview del resultado:
                        </h3>
                        <PreviewTable data={result} maxRows={10}/>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
