import React, { useState, useEffect } from 'react';
import { FiActivity, FiTarget, FiAward } from 'react-icons/fi';

interface SimulationEvent {
    id: string;
    type: 'goal' | 'card' | 'win' | 'update';
    message: string;
    icon: any;
    color: string;
}

export const LiveEventPop = ({ externalEvent }: { externalEvent?: any }) => {
    const [event, setEvent] = useState<SimulationEvent | null>(null);

    // Sync external event
    useEffect(() => {
        if (externalEvent) {
            setEvent({
                id: externalEvent.id || Date.now().toString(),
                type: externalEvent.type || 'update',
                message: externalEvent.message || 'New Update',
                icon: FiActivity,
                color: 'text-blue-500'
            });
            const timer = setTimeout(() => {
                setEvent(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [externalEvent]);

    useEffect(() => {
        if (externalEvent) return;

        // Simulate random events
        const events: Omit<SimulationEvent, 'id'>[] = [
            { type: 'goal', message: 'GOAL! Cyber City takes the lead!', icon: FiTarget, color: 'text-green-500' },
            { type: 'update', message: 'Full Time: 2-1 Victory!', icon: FiAward, color: 'text-yellow-500' },
            { type: 'card', message: 'Yellow Card for #10', icon: FiActivity, color: 'text-red-500' },
        ];

        const triggerEvent = () => {
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            setEvent({ ...randomEvent, id: Date.now().toString() });

            // Clear event after 4 seconds
            setTimeout(() => setEvent(null), 4000);
        };

        // Random interval between 15s and 45s
        const timeout = setTimeout(triggerEvent, Math.random() * 30000 + 15000);

        return () => clearTimeout(timeout);
    }, [event]); // Re-run when event clears to schedule next one

    if (!event) return null;

    return (
        <div className="fixed bottom-8 left-8 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border border-gray-100 dark:border-gray-700 flex items-center space-x-4 pr-8">
                <div className={`p-3 rounded-full bg-gray-50 dark:bg-gray-700 ${event.color}`}>
                    <event.icon size={24} />
                </div>
                <div>
                    <p className="font-bold text-gray-900 dark:text-white tracking-tight">{event.type.toUpperCase()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{event.message}</p>
                </div>
            </div>
        </div>
    );
};
