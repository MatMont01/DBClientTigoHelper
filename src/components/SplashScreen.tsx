import React from "react";
import {motion, AnimatePresence} from "framer-motion";
import tigoLogo from "../assets/tigoLogo.png";

type SplashScreenProps = {
    visible: boolean;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({visible}) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#101625] dark:bg-[#101625] transition-colors"
                initial={{opacity: 1}}
                animate={{opacity: 1}}
                exit={{opacity: 0, transition: {duration: 0.6}}}
            >
                <motion.img
                    src={tigoLogo}
                    alt="Tigo Logo"
                    className="w-28 h-28 mb-6 rounded-xl shadow-2xl"
                    initial={{scale: 0, rotate: -15}}
                    animate={{scale: 1, rotate: 0}}
                    transition={{type: "spring", stiffness: 320, damping: 18, delay: 0.1}}
                />
                <motion.h1
                    className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-cyan-400 drop-shadow-xl tracking-tight"
                    initial={{y: 40, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    transition={{delay: 0.3, duration: 0.8, type: "spring"}}
                >
                    ¡Bienvenido!
                </motion.h1>
                <motion.p
                    className="mt-4 text-blue-200/80 text-lg font-medium"
                    initial={{y: 32, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    transition={{delay: 0.7, duration: 0.6}}
                >
                    ExcelClientTigoHelper
                </motion.p>
            </motion.div>
        )}
    </AnimatePresence>
);
