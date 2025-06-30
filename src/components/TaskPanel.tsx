import React from "react";
import type {AutomationTaskList, AutomationTaskMeta} from "../types/TaskTypes";
import {motion} from "framer-motion";

type TaskPanelProps = {
    tasks: AutomationTaskList;
    onSelectTask: (task: AutomationTaskMeta) => void;
    selectedTaskKey?: string;
};

export const TaskPanel: React.FC<TaskPanelProps> = ({
                                                        tasks,
                                                        onSelectTask,
                                                        selectedTaskKey,
                                                    }) => {
    return (
        <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4"
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.7, ease: "easeOut"}}
        >
            {tasks.map((task) => (
                <motion.div
                    key={task.key}
                    layout
                    whileHover={{
                        scale: 1.04,
                        boxShadow: "0 6px 36px 0 rgba(34,147,255,0.20)",
                    }}
                    className={`
            relative rounded-3xl cursor-pointer transition-all
            bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
            border-2 ${
                        selectedTaskKey === task.key
                            ? "border-blue-500 shadow-blue-500/40 shadow-xl ring-2 ring-blue-400"
                            : "border-gray-200 dark:border-gray-800"
                    }
            overflow-hidden group
            shadow-md
          `}
                    onClick={() => onSelectTask(task)}
                >
                    {task.image && (
                        <img
                            src={task.image}
                            alt={task.displayName}
                            className="w-full h-40 object-cover rounded-t-3xl bg-blue-100 dark:bg-gray-800 group-hover:opacity-90 transition"
                            style={{borderBottom: "1.5px solid #183860"}}
                        />
                    )}
                    <div className="p-6 flex flex-col gap-2">
                        <h2 className="font-extrabold text-xl text-blue-800 dark:text-blue-300 drop-shadow tracking-wide mb-1">
                            {task.displayName}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 font-medium text-base leading-tight">
                            {task.description}
                        </p>
                    </div>
                    {/* Azul glow animado al seleccionar */}
                    {selectedTaskKey === task.key && (
                        <motion.div
                            layoutId="task-glow"
                            className="absolute inset-0 z-10 rounded-3xl pointer-events-none"
                            style={{
                                boxShadow:
                                    "0 0 0 3px #38bdf8, 0 0 32px 6px rgba(34,147,255,0.16)",
                                borderRadius: "inherit",
                            }}
                            initial={{opacity: 0}}
                            animate={{opacity: 0.32}}
                            exit={{opacity: 0}}
                            transition={{duration: 0.4}}
                        />
                    )}
                </motion.div>
            ))}
        </motion.div>
    );
};
