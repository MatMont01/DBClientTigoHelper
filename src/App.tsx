// src/App.tsx

import "./index.css";
import {useState, useEffect} from "react";
import {TaskPanel} from "./components/TaskPanel";
import {AVAILABLE_TASKS} from "./data/availableTasks";
import type {AutomationTask} from "./types/TaskTypes";
import {TaskRunnerPanel} from "./components/TaskRunnerPanel";
import {Navbar} from "./components/Navbar";
import {Footer} from "./components/Footer";
import {motion, AnimatePresence} from "framer-motion";
import {SplashScreen} from "./components/SplashScreen";

function App() {
    const [showSplash, setShowSplash] = useState(true);
    const [selectedTask, setSelectedTask] = useState<AutomationTask | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!("theme" in localStorage)) {
            document.documentElement.classList.add("dark");
        }
        const timer = setTimeout(() => setShowSplash(false), 1900);
        return () => clearTimeout(timer);
    }, []);

    const filteredTasks = AVAILABLE_TASKS.filter((task: AutomationTask) =>
        task.displayName.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectTask = (task: AutomationTask) => {
        setSelectedTask(task);
    };

    const handleBack = () => {
        setSelectedTask(null);
    };

    return (
        <>
            <SplashScreen visible={showSplash}/>
            {!showSplash && (
                <div
                    className={`
            min-h-screen font-sans
            bg-blue-50 text-gray-800
            dark:bg-[#101625] dark:text-gray-200
            transition-colors duration-500
          `}
                >
                    <Navbar searchValue={search} onSearchChange={setSearch}/>

                    <header
                        className="
              w-full flex flex-col items-center py-7 mb-4
              bg-gradient-to-b from-blue-200/70 via-blue-50 to-transparent
              border-b border-blue-300/40 shadow-sm
              dark:from-blue-900/70 dark:via-[#101625] dark:to-transparent
              dark:border-blue-800/40
            "
                    >
                        <motion.h1
                            className="
                text-4xl md:text-5xl font-extrabold tracking-tight
                bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400
                bg-clip-text text-transparent drop-shadow-md
                dark:from-blue-400 dark:via-blue-300 dark:to-cyan-400
              "
                            initial={{opacity: 0, y: -20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.8, delay: 0.1}}
                        >
                            ExcelClientTigoHelper
                        </motion.h1>
                        <p className="mt-2 font-medium text-base tracking-wide text-blue-800/80 dark:text-blue-200/80">
                            SONRÍE ¡ERES PARTE DE LA FAMILIA TIGO!
                        </p>
                    </header>

                    <AnimatePresence mode="wait">
                        {selectedTask ? (
                            <motion.div
                                key="runner"
                                initial={{opacity: 0, scale: 0.95}}
                                animate={{opacity: 1, scale: 1}}
                                exit={{opacity: 0, scale: 0.95}}
                                transition={{duration: 0.4}}
                            >
                                <TaskRunnerPanel task={selectedTask} onBack={handleBack}/>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="panel"
                                initial={{opacity: 0, y: 40}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.65, delay: 0.15}}
                            >
                                <TaskPanel
                                    tasks={filteredTasks}
                                    onSelectTask={handleSelectTask}
                                    // --- CAMBIO CLAVE Y FINAL AQUÍ ---
                                    // En esta rama, 'selectedTask' es null, por lo tanto no hay ninguna 'key' seleccionada.
                                    // Le pasamos 'undefined' directamente para evitar la confusión de TypeScript.
                                    selectedTaskKey={undefined}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Footer/>
                </div>
            )}
        </>
    );
}

export default App;