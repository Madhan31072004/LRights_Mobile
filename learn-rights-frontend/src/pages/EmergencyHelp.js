import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MainLayout from '../layouts/MainLayout';
import './EmergencyHelp.css';

const EmergencyHelp = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const emergencyContacts = {
    emergency: {
      title: '🚨 Emergency Services',
      icon: '🚨',
      color: '#f5576c',
      contacts: [
        { name: '📞 Police', number: '100', description: 'Immediate police assistance' },
        { name: '🚑 Ambulance', number: '108', description: 'Medical emergency' },
        { name: '☎️ Women\'s Helpline', number: '181', description: '24/7 Women in distress support' },
        { name: '👶 Child Helpline', number: '1098', description: 'Child abuse and welfare' },
        { name: '🧠 Mental Health Crisis', number: '9152987821', description: 'AASRA Suicide Prevention' },
        { name: '🔥 Disaster Management', number: '1077', description: 'Natural disasters' }
      ]
    },
    legal_aid: {
      title: '⚖️ Legal Aid & Support',
      icon: '⚖️',
      color: '#667eea',
      contacts: [
        { name: 'National Legal Services Authority', number: 'NALSA', description: 'Free legal services for all' },
        { name: 'State Legal Services Authority', number: 'Contact via NALSA', description: 'State-level legal aid' },
        { name: 'National Commission for Women', number: 'ncw.nic.in', description: 'Women\'s rights commission' },
        { name: 'District Legal Aid Center', number: 'Contact local court', description: 'Free local legal services' },
        { name: 'Legal Rights Helpline', number: '1800-180-1177', description: 'Free legal consultation' }
      ]
    },
    domestic_violence: {
      title: '🏠 Domestic Violence Support',
      icon: '🏠',
      color: '#f093fb',
      contacts: [
        { name: 'One Stop Centre', number: 'Contact locally', description: 'Integrated support for DV victims' },
        { name: 'Women\'s Shelters', number: 'State varies', description: 'Safe shelter from violence' },
        { name: 'Domestic Violence Helpline', number: '181', description: '24/7 Support for abuse' },
        { name: 'PWDVA Complaint Filing', number: 'Local police', description: 'File Protection Order' },
        { name: 'NGO Support Groups', number: 'Local NGOs', description: 'Counseling and support groups' }
      ]
    },
    health: {
      title: '🏥 Health & Medical Services',
      icon: '🏥',
      color: '#4facfe',
      contacts: [
        { name: 'Government Hospital', number: '1075', description: 'State healthcare services' },
        { name: 'Ayushman Bharat', number: 'ayushman.gov.in', description: 'Health insurance scheme' },
        { name: 'Women\'s Health Helpline', number: '1800-180-1111', description: 'Women\'s health information' },
        { name: 'Maternal Health Services', number: 'Local ASHA worker', description: 'Pregnancy & child care' },
        { name: 'Mental Health Services', number: 'AASRA: 9152987821', description: 'Mental health support' }
      ]
    },
    women_support: {
      title: '👩 Women\'s Support Organizations',
      icon: '👩',
      color: '#ffd700',
      contacts: [
        { name: 'All India Women\'s Association', number: 'aiwa.org', description: 'Women\'s rights organization' },
        { name: 'Indian Women\'s Press Club', number: 'iwpc.org', description: 'Media & women\'s issues' },
        { name: 'NCRB (Women Crime Data)', number: 'ncrb.gov.in', description: 'Crime against women data' },
        { name: 'State Women\'s Commission', number: 'Contact state', description: 'State women\'s rights body' },
        { name: 'Local NGOs', number: 'Search locally', description: 'Community support organizations' }
      ]
    },
    government_schemes: {
      title: '🏛️ Government Schemes',
      icon: '🏛️',
      color: '#00f2fe',
      contacts: [
        { name: 'Pradhan Mantri Schemes', number: 'pmay-aawas.gov.in', description: 'Housing & welfare schemes' },
        { name: 'Bhamashah Yojana', number: 'bhamashah.rajasthan.gov.in', description: 'Women empowerment scheme' },
        { name: 'Suraksha Scheme', number: 'Contact state', description: 'Women safety schemes' },
        { name: 'Pension Schemes', number: 'aadhaar.uidai.gov.in', description: 'Widow & disability pensions' },
        { name: 'Skill Development', number: 'pmkvy.gov.in', description: 'Training & employment schemes' }
      ]
    }
  };

  return (
    <MainLayout>
      <div className="emergency-help-container">
        <div className="header-section">
          <h1>🆘 Emergency Help & Resources</h1>
          <p>Quick access to all support services, legal aid, and emergency contacts</p>
          <div className="urgent-notice">
            <strong>⚠️ In immediate danger?</strong> Call <strong>100 (Police)</strong> or <strong>181 (Women's Helpline)</strong> NOW
          </div>
        </div>

        <div className="categories-grid">
          {Object.entries(emergencyContacts).map(([key, category]) => (
            <div
              key={key}
              className={`category-card ${selectedCategory === key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
              style={{ borderTopColor: category.color }}
            >
              <div className="category-icon" style={{ color: category.color }}>
                {category.icon}
              </div>
              <h3>{category.title}</h3>
            </div>
          ))}
        </div>

        {selectedCategory && (
          <div className="contacts-section">
            <div className="section-header">
              <h2 style={{ color: emergencyContacts[selectedCategory].color }}>
                {emergencyContacts[selectedCategory].title}
              </h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedCategory(null)}
              >
                ✕
              </button>
            </div>

            <div className="contacts-list">
              {emergencyContacts[selectedCategory].contacts.map((contact, index) => (
                <div 
                  key={index} 
                  className="contact-card"
                  style={{ borderLeftColor: emergencyContacts[selectedCategory].color }}
                >
                  <div className="contact-info">
                    <h4>{contact.name}</h4>
                    <p className="contact-description">{contact.description}</p>
                  </div>
                  <div className="contact-number">
                    <span className="number">{contact.number}</span>
                    {contact.number.match(/^\d+$/) && (
                      <button className="call-btn" onClick={() => window.location.href = `tel:${contact.number}`}>
                        📞 Call
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="tips-section">
          <h2>📋 How to Get Help</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-number">1</div>
              <h4>Ensure Your Safety</h4>
              <p>If in immediate danger, go to a safe place (friend, family, police station, or women's shelter)</p>
            </div>
            <div className="tip-card">
              <div className="tip-number">2</div>
              <h4>Call Emergency Services</h4>
              <p>Police (100) or Women's Helpline (181) for immediate assistance and protection</p>
            </div>
            <div className="tip-card">
              <div className="tip-number">3</div>
              <h4>Document Evidence</h4>
              <p>Keep records of abuse: medical reports, photos, witness names, messages, documents</p>
            </div>
            <div className="tip-card">
              <div className="tip-number">4</div>
              <h4>Seek Legal Support</h4>
              <p>Contact One Stop Centre or legal aid for free legal guidance and court procedures</p>
            </div>
            <div className="tip-card">
              <div className="tip-number">5</div>
              <h4>Medical Care</h4>
              <p>Visit hospital for medical examination and proper documentation of injuries</p>
            </div>
            <div className="tip-card">
              <div className="tip-number">6</div>
              <h4>Counseling Support</h4>
              <p>Reach out to NGOs and mental health services for emotional support and healing</p>
            </div>
          </div>
        </div>

        <div className="faq-section">
          <h2>❓ Frequently Asked Questions</h2>
          <div className="faq-items">
            <div className="faq-item">
              <h4>What is an FIR and how to file it?</h4>
              <p>FIR (First Information Report) is a legal document filed with police for criminal cases. Go to nearest police station, provide details, and they must record your statement. You get a copy immediately.</p>
            </div>
            <div className="faq-item">
              <h4>Is legal aid really free?</h4>
              <p>Yes! Legal aid services are completely free for women below poverty line. You can access through District Legal Services Authority or One Stop Centres.</p>
            </div>
            <div className="faq-item">
              <h4>What if police refuses to file FIR?</h4>
              <p>Police cannot refuse. If refused, contact the Superintendent of Police or file a complaint with the Magistrate. You can also contact legal aid services.</p>
            </div>
            <div className="faq-item">
              <h4>Can I file complaint anonymously?</h4>
              <p>Not always. For criminal complaints, you usually need to identify yourself. However, One Stop Centres can help you file confidentially if you fear retaliation.</p>
            </div>
            <div className="faq-item">
              <h4>What is One Stop Centre?</h4>
              <p>One Stop Centre provides integrated support for women in crisis - emergency shelter, police liaison, legal counseling, and medical referral - all under one roof.</p>
            </div>
            <div className="faq-item">
              <h4>How long does a legal case take?</h4>
              <p>Criminal cases take 6-24 months depending on complexity. Fast-track courts handle DV cases more quickly (3-6 months). Civil cases may take 2-5 years.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EmergencyHelp;
