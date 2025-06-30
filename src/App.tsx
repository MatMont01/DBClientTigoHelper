import "./index.css";
import {useState, useEffect} from "react";
import {TaskPanel} from "./components/TaskPanel";
import {AVAILABLE_TASKS} from "./data/availableTasks";
import type {AutomationTaskMeta} from "./types/TaskTypes";
import {TaskRunnerPanel} from "./components/TaskRunnerPanel";
import {Navbar} from "./components/Navbar";
import {Footer} from "./components/Footer";
import {motion, AnimatePresence} from "framer-motion";
import {SplashScreen} from "./components/SplashScreen.tsx";


// Dark mode: Siempre respetar la clase de <html> (manejada desde Navbar o hook)
function App() {
    // @ts-ignore
    const [showSplash, setShowSplash] = useState(true);
    const [selectedTask, setSelectedTask] = useState<AutomationTaskMeta | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!("theme" in localStorage)) {
            document.documentElement.classList.add("dark");
        }
        // Splash dura 1.9 segundos, ajústalo si quieres
        const timer = setTimeout(() => setShowSplash(false), 1900);
        return () => clearTimeout(timer);
    }, []);

    const filteredTasks = AVAILABLE_TASKS.filter(task =>
        task.displayName.toLowerCase().includes(search.toLowerCase())
    );

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
                    {/* NAVBAR */}
                    <Navbar searchValue={search} onSearchChange={setSearch}/>

                    {/* CABECERA */}
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
                        <p className="
                        mt-2 font-medium text-base tracking-wide
                        text-blue-800/80 dark:text-blue-200/80
                    ">
                            SONRÍE ¡ERES PARTE DE LA FAMILIA TIGO!
                        </p>
                    </header>

                    {/* PANEL DE TAREAS */}
                    <motion.div
                        initial={{opacity: 0, y: 40}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.65, delay: 0.15}}
                    >
                        <TaskPanel
                            tasks={filteredTasks}
                            onSelectTask={setSelectedTask}
                            selectedTaskKey={selectedTask?.key}
                        />
                    </motion.div>

                    {/* PANEL DE ACCIONES/TAREAS (con animación) */}
                    <AnimatePresence>
                        {selectedTask && (
                            <motion.div
                                key={selectedTask.key}
                                initial={{opacity: 0, y: 60, scale: 0.98}}
                                animate={{opacity: 1, y: 0, scale: 1}}
                                exit={{opacity: 0, y: 60, scale: 0.98}}
                                transition={{duration: 0.6, type: "spring", bounce: 0.14}}
                            >
                                <TaskRunnerPanel task={selectedTask}/>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* FOOTER */}
                    <Footer/>
                </div>
            )}
        </>
    );

}

export default App;
