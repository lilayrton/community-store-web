"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownClockProps {
    targetDate: Date | string;
}

export function CountdownClock({ targetDate }: CountdownClockProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                setTimeLeft({ days, hours, minutes, seconds });

                // Urgency mode: less than 24 hours
                setIsUrgent(days === 0 && hours < 24);
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft(); // Initial call
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const TimeUnit = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 min-w-[50px] text-center shadow-inner">
                <span className="text-2xl font-bold text-white font-mono">
                    {value.toString().padStart(2, '0')}
                </span>
            </div>
            <span className="text-[10px] text-white/80 uppercase font-medium mt-1 tracking-wider">{label}</span>
        </div>
    );

    return (
        <div className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-500 ${isUrgent
                ? "bg-gradient-to-br from-red-500 to-orange-600 animate-pulse-slow"
                : "bg-gradient-to-br from-indigo-500 to-purple-600"
            }`}>
            {/* Background decorators */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-20 h-20 bg-black/10 rounded-full blur-xl" />

            <div className="relative p-6 flex flex-col items-center justify-center h-full">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className={`w-5 h-5 ${isUrgent ? "text-white animate-bounce" : "text-indigo-100"}`} />
                    <h3 className="text-white font-bold text-sm tracking-wide">
                        CIERRE DE PEDIDOS
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <TimeUnit value={timeLeft.days} label="Días" />
                    <span className="text-white/50 text-2xl font-light -mt-4">:</span>
                    <TimeUnit value={timeLeft.hours} label="Hs" />
                    <span className="text-white/50 text-2xl font-light -mt-4">:</span>
                    <TimeUnit value={timeLeft.minutes} label="Min" />
                    <span className="text-white/50 text-2xl font-light -mt-4">:</span>
                    <TimeUnit value={timeLeft.seconds} label="Seg" />
                </div>

                {isUrgent && (
                    <div className="mt-4 px-3 py-1 bg-white/20 rounded-full border border-white/30">
                        <span className="text-xs text-white font-bold animate-pulse">
                            ⚠️ ¡ÚLTIMAS HORAS!
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
