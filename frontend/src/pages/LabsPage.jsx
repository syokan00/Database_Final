import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LabsPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/notes', { state: { filter: 'lab' }, replace: true });
    }, [navigate]);

    return null;
};

export default LabsPage;
