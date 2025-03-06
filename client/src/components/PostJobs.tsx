import { useState } from 'react';
import axios from 'axios';

const PostJobs = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requiredSkills, setRequiredSkills] = useState('');
    const [budget, setBudget] = useState('');

    const handlePostJob = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Unauthorized. Please login.');
                return;
            }

            await axios.post('/api/jobs', 
                { title, description, requiredSkills: requiredSkills.split(','), budget },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Job posted successfully!');
        } catch (error) {
            console.error('Error posting job:', error);
            alert('Failed to post job.');
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-md text-white">
            <h2 className="text-2xl font-bold mb-4">Post a Job</h2>
            <input 
                type="text"
                placeholder="Job Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 mb-2 bg-gray-700 rounded"
            />
            <textarea 
                placeholder="Job Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 mb-2 bg-gray-700 rounded"
            />
            <input 
                type="text"
                placeholder="Required Skills (comma separated)"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                className="w-full p-2 mb-2 bg-gray-700 rounded"
            />
            <input 
                type="number"
                placeholder="Budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full p-2 mb-2 bg-gray-700 rounded"
            />
            <button 
                onClick={handlePostJob} 
                className="bg-blue-500 w-full py-2 rounded-md mt-4 hover:bg-blue-600"
            >
                Post Job
            </button>
        </div>
    );
};

export default PostJobs;
