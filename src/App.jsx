import React from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import { OnboardingScreen, LanguageSelectionScreen } from './screens/Onboarding';
import { MainChatScreen } from './screens/MainChat';

const AppContent = () => {
  const { onboardingStep } = useChat();

  return (
    <>
      {onboardingStep === 1 && <OnboardingScreen />}
      {onboardingStep === 2 && <LanguageSelectionScreen />}
      {onboardingStep === 3 && <MainChatScreen />}
    </>
  );
};

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
