import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const JobsPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/notes', { state: { filter: 'job' }, replace: true });
    }, [navigate]);

    return null;
};

export default JobsPage;
