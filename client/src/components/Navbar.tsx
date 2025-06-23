'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { motion } from 'framer-motion';

interface User {
    name: string;
    email: string;
    role: 'Freelancer' | 'Company';
    profilePicture?: string;
}

const Navbar = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) return;

                const res = await axios.get('/api/auth/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUser(res.data.user);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    const navVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    return (
        <motion.nav
            className="bg-gray-900 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-100 shadow-lg border-b border-gray-700"
            initial="hidden"
            animate="visible"
            variants={navVariants}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/dashboard">
                            <motion.div
                                className="flex items-center space-x-2 cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">D</span>
                                </div>
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">DeWorkHub</span>
                            </motion.div>
                        </Link>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center gap-56">
                        <div className="flex space-x-6 mr-8">
                            {user?.role === 'Freelancer' ? (
                                <>
                                    <NavLink href="/dashboard" label="Jobs" />
                                    <NavLink href="/contracts" label="Contracts" />
                                    <NavLink href="/chat" label="Chat" />
                                    <NavLink href="/leaderboard" label="Leaderboard" />
                                    <NavLink href="/profile" label="Profile" />
                                </>
                            ) : user?.role === 'Company' ? (
                                <>
                                    <NavLink href="/dashboard" label="Post" />
                                    <NavLink href="/hire" label="Hire" />
                                    <NavLink href="/chat" label="Chat" />
                                    <NavLink href="/leaderboard" label="Leaderboard" />
                                    <NavLink href="/profile" label="Profile" />
                                </>
                            ) : null}
                        </div>

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <motion.div
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
                                    whileHover={{ backgroundColor: 'rgba(30, 41, 59, 1)' }}
                                >
                                    {user.profilePicture ? (
                                        <Image
                                            src={user.profilePicture}
                                            alt="User Profile"
                                            width={32}
                                            height={32}
                                            className="rounded-full ring-2 ring-purple-500"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium">{user.name}</span>
                                </motion.div>
                                <motion.button
                                    onClick={logout}
                                    className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-lg text-white font-medium shadow-md"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Logout
                                </motion.button>
                            </div>
                        ) : (
                            <Link href="/login">
                                <motion.button
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 rounded-lg text-white font-medium shadow-md"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Login
                                </motion.button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <motion.button
                            className="p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
                            onClick={() => setIsOpen(!isOpen)}
                            whileTap={{ scale: 0.95 }}
                        >
                            {!isOpen ? (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <motion.div
                className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700">
                    {user?.role === 'Freelancer' ? (
                        <>
                            <MobileNavLink href="/dashboard" label="Jobs" />
                            <MobileNavLink href="/contracts" label="Contracts" />
                            <MobileNavLink href="/chat" label="Chat" />
                            <MobileNavLink href="/leaderboard" label="Leaderboard" />
                            <MobileNavLink href="/profile" label="Profile" />
                        </>
                    ) : user?.role === 'Company' ? (
                        <>
                            <MobileNavLink href="/dashboard" label="Post" />
                            <MobileNavLink href="/hire" label="Hire" />
                            <MobileNavLink href="/chat" label="Chat" />
                            <MobileNavLink href="/leaderboard" label="Leaderboard" />
                            <MobileNavLink href="/profile" label="Profile" />
                        </>
                    ) : null}
                </div>

                {user ? (
                    <div className="pt-4 pb-3 border-t border-gray-700">
                        <div className="flex items-center px-5">
                            {user.profilePicture ? (
                                <Image
                                    src={user.profilePicture}
                                    alt="User Profile"
                                    width={40}
                                    height={40}
                                    className="rounded-full ring-2 ring-purple-500"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="ml-3">
                                <div className="text-base font-medium">{user.name}</div>
                                <div className="text-sm font-medium text-gray-400">{user.email}</div>
                            </div>
                        </div>
                        <div className="mt-3 px-2 space-y-1">
                            <motion.button
                                onClick={logout}
                                className="w-full block px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-red-500 to-red-600"
                                whileTap={{ scale: 0.95 }}
                            >
                                Logout
                            </motion.button>
                        </div>
                    </div>
                ) : (
                    <div className="pt-4 pb-3 border-t border-gray-700 px-5">
                        <Link href="/login" className="w-full block">
                            <motion.button
                                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 focus:outline-none"
                                whileTap={{ scale: 0.95 }}
                            >
                                Login
                            </motion.button>
                        </Link>
                    </div>
                )}
            </motion.div>
        </motion.nav>
    );
};

const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link href={href}>
        <motion.span
            className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium cursor-pointer hover:text-white hover:border-blue-500"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            {label}
        </motion.span>
    </Link>
);

const MobileNavLink = ({ href, label }: { href: string; label: string }) => (
    <Link href={href}>
        <motion.span
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
        >
            {label}
        </motion.span>
    </Link>
);

export default Navbar;