'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';

interface User {
    name: string;
    email: string;
    role: 'Freelancer' | 'Company';
    profilePicture?: string;
}

const Navbar = () => {
    const [user, setUser] = useState<User | null>();
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

    return (
        <nav className="bg-gray-900 text-white flex justify-between items-center px-6 py-4 shadow-md">
            <Link href="/dashboard">
                <span className="text-xl font-bold cursor-pointer">DeWorkHub</span>
            </Link>

            <div className="flex space-x-6">
                {user?.role === 'Freelancer' ? (
                    <>
                        <Link href="/dashboard">Jobs</Link>
                        <Link href="/contracts">Contracts</Link>
                        <Link href="/chat">Chat</Link>
                        <Link href="/leaderboard">Leaderboard</Link>
                    </>
                ) : user?.role === 'Company' ? (
                    <>
                        <Link href="/dashboard">Post</Link>
                        <Link href="/hire">Hire</Link>
                        <Link href="/chat">Chat</Link>
                        <Link href="/leaderboard">Leaderboard</Link>
                    </>
                ) : null}
            </div>

            {user ? (
                <div className="flex items-center space-x-4">
                    {user.profilePicture ? (
                        <Image
                            src={user.profilePicture}
                            alt="User Profile"
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <button onClick={logout} className="bg-red-500 px-3 py-1 rounded-md">Logout</button>
                </div>
            ) : (
                <Link href="/login">
                    <button className="bg-blue-500 px-4 py-2 rounded-md">Login</button>
                </Link>
            )}
        </nav>
    );
};

export default Navbar;
