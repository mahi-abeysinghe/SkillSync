import React from 'react';
import ParticleBackground from '../components/ParticleBackground';

const ExamplePage = () => {
    return (
        <div className="page-container">
            <ParticleBackground bgColor="#f9f9f9" particleColor="#4285F4" linkColor="#34A853" />
            <div className="content">
                {/* Your page content here */}
                <h1>Example Page</h1>
                <p>This is an example of using the new particle background.</p>
            </div>
        </div>
    );
};

export default ExamplePage;
