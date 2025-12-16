import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardScreen from './screens/DashboardScreen';
import TranslationScreen from './screens/TranslationScreen';
import EditingScreen from './screens/EditingScreen';
import SummaryScreen from './screens/SummaryScreen';
import ChatScreen from './screens/ChatScreen';
import DocumentEditorScreen from './screens/DocumentEditorScreen';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<DashboardScreen />} />
                <Route path="/translate" element={<TranslationScreen />} />
                <Route path="/edit" element={<EditingScreen />} />
                <Route path="/summarize" element={<SummaryScreen />} />
                <Route path="/chat" element={<ChatScreen />} />
                <Route path="/editor" element={<DocumentEditorScreen />} />
            </Routes>
        </Router>
    );
};

export default App;