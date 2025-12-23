
"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function QuickStartPage() {
    const [pseudo, setPseudo] = useState('Player1');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
                <h1 className="text-3xl font-bold mb-6 text-center">Strategic Squads</h1>
                <h2 className="text-xl mb-4 text-center text-gray-400">Quick Start</h2>

                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium">Pseudo</label>
                    <input
                        type="text"
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white"
                        placeholder="Enter your name"
                    />
                </div>

                <Link
                    href={`/test-game?pseudo=${pseudo}`}
                    className="block w-full py-3 bg-blue-600 hover:bg-blue-700 rounded text-center font-semibold transition-colors"
                >
                    Start Game
                </Link>

                <div className="mt-6 text-sm text-gray-400">
                    <p>✅ Minimal client for testing</p>
                    <p>✅ Auto-joins blue team</p>
                    <p>✅ 2 units spawned</p>
                </div>
            </div>
        </div>
    );
}
