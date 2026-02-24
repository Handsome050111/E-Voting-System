import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const InfoPage = ({ type }) => {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const getContent = () => {
        switch (type) {
            case 'faq':
                return {
                    title: 'Frequently Asked Questions',
                    description: 'Everything you need to know about the VoteSecure platform.',
                    sections: [
                        {
                            q: 'How secure is my vote?',
                            a: 'We use end-to-end encryption and blockchain-inspired integrity checks to ensure that your vote is private and cannot be tampered with.'
                        },
                        {
                            q: 'How is my identity verified?',
                            a: 'Identity is verified through email-based OTP (One-Time Password) that is unique to your registered email address.'
                        },
                        {
                            q: 'Can I change my vote after submitting?',
                            a: 'No, once a vote is cast and recorded in the audit log, it cannot be altered or removed to maintain the integrity of the election.'
                        },
                        {
                            q: 'Where can I see the results?',
                            a: 'Live results are available on the Results page once the election is active. Final results are archived for public viewing.'
                        }
                    ]
                };
            case 'how-it-works':
                return {
                    title: 'How It Works',
                    description: 'VoteSecure is designed to be simple, secure, and accessible. Follow these 4 steps to cast your vote.',
                    sections: [
                        {
                            q: '01. Register',
                            a: 'Create your account using your official email address. Make sure you have access to this email to receive your verification codes.'
                        },
                        {
                            q: '02. Verify',
                            a: 'Every time you sign in or cast a vote, we send a secure 4-digit OTP (One-Time Password) to your email to confirm it\'s really you.'
                        },
                        {
                            q: '03. Select Election',
                            a: 'Browse the list of active elections in your dashboard. You can view candidates and their details before making your choice.'
                        },
                        {
                            q: '04. Cast Your Vote',
                            a: 'Once you\'ve made your choice, submit your ballot securely. Your vote is then encrypted and recorded in our verifiable audit log.'
                        }
                    ]
                };
            case 'privacy':
                return {
                    title: 'Privacy Policy',
                    description: 'How we protect and handle your personal informational.',
                    sections: [
                        {
                            q: 'Data Collection',
                            a: 'We only collect essential information such as your name and email address for authentication purposes.'
                        },
                        {
                            q: 'Ballot Secrecy',
                            a: 'Your individual voting choice is decoupled from your identity using advanced cryptographic techniques. No one, not even administrators, can see who you voted for.'
                        },
                        {
                            q: 'Audit Logs',
                            a: 'While activity is logged for auditing, these logs contain anonymized identifiers that do not reveal individual choices.'
                        }
                    ]
                };
            case 'help':
                return {
                    title: 'Help Center',
                    description: 'Get support and learn how to use the platform.',
                    sections: [
                        {
                            q: 'Getting Started',
                            a: 'To start voting, register for an account using your email, verify your identity via OTP, and then browse active elections in your dashboard.'
                        },
                        {
                            q: 'Troubleshooting Login',
                            a: 'If you haven\'t received your OTP, check your spam folder or click "Resend OTP" on the verification page.'
                        },
                        {
                            q: 'Technical Support',
                            a: 'For technical issues, please contact our support team at support@votesecure.com.'
                        }
                    ]
                };
            default:
                return { title: 'Information', description: 'Platform details.', sections: [] };
        }
    };

    const content = getContent();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />
            <div className="container mx-auto px-6 pt-16">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-12">
                        <Link to="/" className="text-indigo-600 font-bold flex items-center gap-2 mb-6 hover:translate-x-[-4px] transition-transform w-fit">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                        <h1 className="text-4xl font-black text-slate-900 mb-4">{content.title}</h1>
                        <p className="text-lg text-slate-500">{content.description}</p>
                    </div>

                    <div className="space-y-6">
                        {content.sections.map((section, index) => (
                            <div key={index} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{section.q}</h3>
                                <p className="text-slate-600 leading-relaxed">{section.a}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 p-10 bg-indigo-600 rounded-[2.5rem] text-white text-center shadow-2xl shadow-indigo-200">
                        <h2 className="text-2xl font-black mb-4">Still have questions?</h2>
                        <p className="mb-8 opacity-90">Our team is here to help you with any issues or concerns.</p>
                        <a href="mailto:support@votesecure.com" className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-all">
                            Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoPage;
