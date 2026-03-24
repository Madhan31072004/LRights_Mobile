import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MainLayout from '../layouts/MainLayout';
import './Resources.css';

const Resources = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('emergency');

  const resources = {
    emergency: [
      { name: 'Police', number: '100', description: 'For immediate police assistance' },
      { name: 'Women\'s Helpline', number: '181', description: '24/7 support for women' },
      { name: 'Ambulance', number: '108', description: 'Medical emergency' },
      { name: 'Child Helpline', number: '1098', description: 'Support for children' },
      { name: 'AADHAR Helpline', number: '1947', description: 'AADHAR related issues' }
    ],
    government: [
      {
        name: 'National Legal Services Authority',
        link: 'nalsa.gov.in',
        description: 'Free legal aid services'
      },
      {
        name: 'National Commission for Women',
        link: 'ncw.nic.in',
        description: 'Women\'s rights and grievances'
      },
      {
        name: 'Ministry of Women & Child Development',
        link: 'wcd.nic.in',
        description: 'Government schemes and programs'
      },
      {
        name: 'e-courts India',
        link: 'ecourts.gov.in',
        description: 'Court case tracking and filing'
      },
      {
        name: 'Digital India',
        link: 'digitalindia.gov.in',
        description: 'Government digital services'
      }
    ],
    ngos: [
      {
        name: 'Voices Against Silence (VAS)',
        description: 'Support for domestic violence victims'
      },
      {
        name: 'Indian Women\'s Rights Organization',
        description: 'Advocacy and legal support'
      },
      {
        name: 'All India Women\'s Association',
        description: 'Women\'s empowerment programs'
      },
      {
        name: 'Legal Aid Society',
        description: 'Free legal consultation services'
      },
      {
        name: 'Women Power Connect',
        description: 'Skills training and entrepreneurship'
      }
    ],
    laws: [
      {
        title: 'Protection of Women from Domestic Violence Act, 2005',
        description: 'Legal protection against domestic abuse'
      },
      {
        title: 'Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013',
        description: 'Protection against workplace harassment'
      },
      {
        title: 'Dowry Prohibition Act, 1961',
        description: 'Prohibition of dowry practices'
      },
      {
        title: 'Hindu Marriage Act, 1955',
        description: 'Marriage and divorce laws'
      },
      {
        title: 'Hindu Succession Act, 1956',
        description: 'Inheritance and property rights'
      },
      {
        title: 'Maternity Benefit Act, 1961',
        description: 'Maternity leave and benefits'
      }
    ]
  };

  return (
    <MainLayout>
      <div className="resources-container">
        <div className="resources-header">
          <h1>📚 Legal Resources & Helplines</h1>
          <p>Find important resources, helplines, laws, and organizations</p>
        </div>

        {/* Category Tabs */}
        <div className="resource-tabs">
          {Object.keys(resources).map(category => (
            <button
              key={category}
              className={`tab-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'emergency' && '🚨'}
              {category === 'government' && '🏛️'}
              {category === 'ngos' && '🤝'}
              {category === 'laws' && '⚖️'}
              {' '}
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Resource Items */}
        <div className="resources-grid">
          {resources[selectedCategory].map((resource, idx) => (
            <div key={idx} className="resource-card">
              {selectedCategory === 'emergency' && (
                <div className="emergency-card">
                  <div className="card-header">
                    <h3>{resource.name}</h3>
                    <div className="emergency-number">{resource.number}</div>
                  </div>
                  <p>{resource.description}</p>
                  <button className="call-button" onClick={() => window.location.href = `tel:${resource.number}`}>
                    📞 Call Now
                  </button>
                </div>
              )}
              {selectedCategory === 'government' && (
                <div className="government-card">
                  <h3>{resource.name}</h3>
                  <p>{resource.description}</p>
                  <a href={`https://${resource.link}`} target="_blank" rel="noopener noreferrer" className="resource-link">
                    Visit Website →
                  </a>
                </div>
              )}
              {selectedCategory === 'ngos' && (
                <div className="ngo-card">
                  <h3>{resource.name}</h3>
                  <p>{resource.description}</p>
                </div>
              )}
              {selectedCategory === 'laws' && (
                <div className="law-card">
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="resources-faq">
          <h2>❓ Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How do I file a complaint?</h4>
              <p>You can file a complaint at your nearest police station, magistrate's court, or through online portals of respective organizations.</p>
            </div>
            <div className="faq-item">
              <h4>Is legal aid free?</h4>
              <p>Yes, legal aid is available free of cost for women below the poverty line through NALSA and state legal aid services.</p>
            </div>
            <div className="faq-item">
              <h4>What is the women's helpline number?</h4>
              <p>The national women's helpline number is 181, available 24/7 across India with multilingual support.</p>
            </div>
            <div className="faq-item">
              <h4>Can I get legal advice here?</h4>
              <p>This platform provides general legal information. For personalized legal advice, consult qualified attorneys through legal aid services.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Resources;
