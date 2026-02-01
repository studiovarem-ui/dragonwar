import { useState, useEffect, useCallback, useRef } from 'react';
import { storyNodes, endingInfo, totalEndings } from './data/storyData';
import './index.css';

const playSound = (type) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    switch(type) {
      case 'click':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'page':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
      case 'success':
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.45);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.45);
        break;
    }
  } catch { }
};

const storage = {
  getCollectedEndings: () => { try { return JSON.parse(localStorage.getItem('dragonwar_endings') || '[]'); } catch { return []; } },
  addEnding: (endingType) => { const endings = storage.getCollectedEndings(); if (!endings.includes(endingType)) { endings.push(endingType); localStorage.setItem('dragonwar_endings', JSON.stringify(endings)); } return endings; },
  getPlayCount: () => parseInt(localStorage.getItem('dragonwar_playCount') || '0'),
  incrementPlayCount: () => { const count = storage.getPlayCount() + 1; localStorage.setItem('dragonwar_playCount', count.toString()); return count; },
  getSavedNames: () => { try { return JSON.parse(localStorage.getItem('dragonwar_names') || '{}'); } catch { return {}; } },
  saveNames: (names) => { localStorage.setItem('dragonwar_names', JSON.stringify(names)); }
};

// 홈 화면
const HomeScreen = ({ onStart, collectedEndings, playCount }) => {
  const [showCollection, setShowCollection] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 별 배경 */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-pulse" 
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, opacity: Math.random() * 0.7 + 0.3 }} />
        ))}
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-float">🐲</div>
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-2">드래곤 워</h1>
          <p className="text-lg text-purple-200">태초의 드래곤과 함께하는 서사시적 모험</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur rounded-2xl px-6 py-3 mb-8 flex gap-6">
          <div className="text-center"><div className="text-2xl">📖</div><div className="text-sm text-purple-200">{playCount}번 플레이</div></div>
          <div className="text-center"><div className="text-2xl">🏆</div><div className="text-sm text-purple-200">{collectedEndings.length}/{totalEndings} 엔딩</div></div>
        </div>
        
        <button onClick={() => { playSound('click'); onStart(); }} className="btn-press bg-gradient-to-r from-amber-500 to-orange-600 text-white text-2xl font-bold px-12 py-5 rounded-full shadow-lg shadow-orange-500/30 mb-4">모험 시작</button>
        <button onClick={() => { playSound('click'); setShowCollection(true); }} className="btn-press bg-white/10 backdrop-blur text-purple-200 font-bold px-8 py-3 rounded-full">엔딩 컬렉션</button>
      </div>
      
      {showCollection && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border border-purple-500/30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">엔딩 컬렉션</h2>
              <button onClick={() => setShowCollection(false)} className="text-2xl text-gray-400 hover:text-white">✕</button>
            </div>
            <p className="text-purple-300 mb-4">수집한 엔딩: {collectedEndings.length} / {totalEndings}</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(endingInfo).map(([key, info]) => {
                const isCollected = collectedEndings.includes(key);
                return (
                  <div key={key} className={`p-3 rounded-xl ${isCollected ? 'bg-gradient-to-r from-amber-900/50 to-orange-900/50 border border-amber-500/50' : 'bg-slate-700/50 border border-slate-600/50'}`}>
                    <div className={`font-bold text-sm ${isCollected ? 'text-amber-300' : 'text-gray-500'}`}>{isCollected ? info.title : '???'}</div>
                    <div className={`text-xs mt-1 ${isCollected ? 'text-gray-300' : 'text-gray-600'}`}>{isCollected ? info.description : '아직 발견하지 못했습니다'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 이름 입력 화면
const NameInputScreen = ({ onComplete }) => {
  const [playerName, setPlayerName] = useState('');
  const [dragonName, setDragonName] = useState('');
  const savedNames = storage.getSavedNames();
  
  useEffect(() => {
    if (savedNames.playerName) setPlayerName(savedNames.playerName);
    if (savedNames.dragonName) setDragonName(savedNames.dragonName);
  }, []);
  
  const handleStart = () => {
    const finalPlayerName = playerName.trim() || '알렌';
    const finalDragonName = dragonName.trim() || '프리즘';
    storage.saveNames({ playerName: finalPlayerName, dragonName: finalDragonName });
    onComplete({ playerName: finalPlayerName, dragonName: finalDragonName });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800/80 backdrop-blur rounded-3xl p-8 max-w-md w-full border border-indigo-500/30">
        <h2 className="text-2xl font-bold text-white text-center mb-6">이야기의 주인공</h2>
        
        <div className="mb-6">
          <label className="block text-indigo-300 font-medium mb-2">알을 발견한 아이의 이름</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="알렌"
            className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none text-lg"
          />
        </div>
        
        <div className="mb-8">
          <label className="block text-indigo-300 font-medium mb-2">태초의 드래곤 이름</label>
          <input
            type="text"
            value={dragonName}
            onChange={(e) => setDragonName(e.target.value)}
            placeholder="프리즘"
            className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none text-lg"
          />
        </div>
        
        <button
          onClick={handleStart}
          className="btn-press w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-bold py-4 rounded-full shadow-lg"
        >
          이야기 시작
        </button>
      </div>
    </div>
  );
};

// 스토리 화면 (여러 페이지 후 선택지)
const StoryScreen = ({ currentNode, names, history, onChoice, onNext, onBack, onHome }) => {
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    setShowContent(false);
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, [currentNode.id]);
  
  // 텍스트에서 {playerName}, {dragonName} 치환
  const replaceNames = (text) => {
    return text.replace(/{playerName}/g, names.playerName).replace(/{dragonName}/g, names.dragonName);
  };
  
  const hasChoices = currentNode.choices && currentNode.choices.length > 0;
  const hasNext = currentNode.nextId;
  
  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentNode.background || 'from-slate-900 via-slate-800 to-slate-900'} flex flex-col relative`}>
      {/* 헤더 */}
      <div className="bg-black/30 backdrop-blur-sm p-3 flex items-center justify-between sticky top-0 z-20">
        <button onClick={() => { playSound('click'); onBack(); }} className="btn-press text-xl w-10 h-10 flex items-center justify-center rounded-full bg-white/10" disabled={history.length === 0}>
          {history.length > 0 ? '←' : ''}
        </button>
        <div className="text-white/80 font-medium">{currentNode.chapter || ''}</div>
        <button onClick={() => { playSound('click'); onHome(); }} className="btn-press text-xl w-10 h-10 flex items-center justify-center rounded-full bg-white/10">🏠</button>
      </div>
      
      {/* 본문 */}
      <div className="flex-grow flex flex-col justify-center px-6 py-8">
        <div className={`transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {currentNode.title && (
            <h2 className="text-2xl font-bold text-white text-center mb-6">{replaceNames(currentNode.title)}</h2>
          )}
          <div className="bg-black/20 backdrop-blur rounded-2xl p-6 mb-6">
            <p className="text-lg text-gray-100 leading-relaxed whitespace-pre-line">{replaceNames(currentNode.text)}</p>
          </div>
        </div>
        
        {/* 다음 페이지 버튼 */}
        {hasNext && !hasChoices && (
          <button
            onClick={() => { playSound('page'); onNext(currentNode.nextId); }}
            className="btn-press self-center bg-white/20 text-white font-medium px-8 py-3 rounded-full mt-4"
          >
            다음 →
          </button>
        )}
        
        {/* 선택지 */}
        {hasChoices && (
          <div className="space-y-3 mt-4">
            {currentNode.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => { playSound('click'); onChoice(choice.nextId); }}
                className="btn-press w-full bg-gradient-to-r from-indigo-600/80 to-purple-600/80 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl p-4 text-left transition-all"
              >
                <span className="font-medium">{replaceNames(choice.text)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 엔딩 화면
const EndingScreen = ({ node, names, onRestart, onHome, isNewEnding, onCreateBook, history }) => {
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    playSound('success');
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);
  
  const replaceNames = (text) => {
    return text.replace(/{playerName}/g, names.playerName).replace(/{dragonName}/g, names.dragonName);
  };
  
  return (
    <div className={`min-h-screen bg-gradient-to-b ${node.background || 'from-amber-900 via-orange-900 to-red-900'} flex flex-col items-center justify-center p-6 relative overflow-hidden`}>
      <div className={`text-center transition-all duration-1000 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <h1 className="text-4xl font-black text-white mb-4">{replaceNames(node.title)}</h1>
        {isNewEnding && (
          <div className="bg-amber-500 text-amber-900 font-bold px-6 py-2 rounded-full mb-4 inline-block animate-pulse">새로운 엔딩!</div>
        )}
        <div className="bg-black/30 backdrop-blur rounded-2xl p-6 max-w-md mx-auto mb-8">
          <p className="text-gray-100 text-lg leading-relaxed">{replaceNames(node.text)}</p>
        </div>
        <div className="space-y-3">
          <button onClick={() => { playSound('click'); onCreateBook(); }} className="btn-press block w-full max-w-xs mx-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold px-8 py-4 rounded-full">나만의 동화책 만들기</button>
          <button onClick={() => { playSound('click'); onRestart(); }} className="btn-press block w-full max-w-xs mx-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg font-bold px-8 py-4 rounded-full">다시 모험하기</button>
          <button onClick={() => { playSound('click'); onHome(); }} className="btn-press block w-full max-w-xs mx-auto bg-white/20 text-white font-bold px-8 py-3 rounded-full">홈으로</button>
        </div>
      </div>
    </div>
  );
};

// 동화책 만들기 화면
const BookCreatorScreen = ({ history, endingNode, names, onHome, onRestart }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const bookRef = useRef(null);
  
  const replaceNames = (text) => {
    return text.replace(/{playerName}/g, names.playerName).replace(/{dragonName}/g, names.dragonName);
  };
  
  const fullStory = [...history, endingNode.id].map(nodeId => {
    const node = storyNodes[nodeId];
    return node ? { text: replaceNames(node.text) } : null;
  }).filter(Boolean);
  
  const downloadImage = async () => {
    if (!bookRef.current) return;
    try {
      const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')).default;
      const canvas = await html2canvas(bookRef.current, { backgroundColor: '#1e1b4b', scale: 2 });
      const link = document.createElement('a');
      link.download = `${title || '드래곤 워'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('이미지 저장 중 오류가 발생했습니다.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onHome} className="btn-press text-xl w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white">🏠</button>
          <h1 className="text-xl font-bold text-white">나만의 동화책</h1>
          <div className="w-10"></div>
        </div>
        
        {!showPreview ? (
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-indigo-500/30">
            <div className="mb-6">
              <label className="block text-indigo-300 font-medium mb-2">책 제목</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="드래곤 워" className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none" />
            </div>
            <div className="mb-6">
              <label className="block text-indigo-300 font-medium mb-2">작가 이름</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder={names.playerName} className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none" />
            </div>
            <button onClick={() => setShowPreview(true)} className="btn-press w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-bold py-4 rounded-full">동화책 만들기</button>
          </div>
        ) : (
          <div>
            <div ref={bookRef} className="bg-indigo-950 rounded-none p-8 mb-6" style={{ fontFamily: 'Noto Serif KR, serif' }}>
              <div className="text-center mb-8 pb-6 border-b border-indigo-700">
                <h1 className="text-2xl font-bold text-amber-400 mb-2">{title || '드래곤 워'}</h1>
                <p className="text-indigo-300">글: {author || names.playerName}</p>
              </div>
              <div className="space-y-4">
                {fullStory.map((item, idx) => (
                  <div key={idx}>
                    <p className="text-gray-200 text-sm leading-relaxed">{item.text}</p>
                    {idx < fullStory.length - 1 && <div className="text-center my-3 text-indigo-500">* * *</div>}
                  </div>
                ))}
              </div>
              <div className="text-center mt-8 pt-6 border-t border-indigo-700">
                <p className="text-indigo-400">- 끝 -</p>
              </div>
            </div>
            <div className="space-y-3">
              <button onClick={downloadImage} className="btn-press w-full bg-gradient-to-r from-green-500 to-teal-500 text-white text-lg font-bold py-4 rounded-full">이미지로 저장</button>
              <button onClick={() => setShowPreview(false)} className="btn-press w-full bg-white/10 text-white py-3 rounded-full">수정하기</button>
              <button onClick={onRestart} className="btn-press w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-full">새로운 모험</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 메인 앱
function App() {
  const [screen, setScreen] = useState('home');
  const [currentNodeId, setCurrentNodeId] = useState('prologue_1');
  const [history, setHistory] = useState([]);
  const [names, setNames] = useState({ playerName: '알렌', dragonName: '프리즘' });
  const [collectedEndings, setCollectedEndings] = useState(() => storage.getCollectedEndings());
  const [playCount, setPlayCount] = useState(() => storage.getPlayCount());
  const [isNewEnding, setIsNewEnding] = useState(false);
  
  const currentNode = storyNodes[currentNodeId];
  
  const handleStart = useCallback(() => {
    setScreen('nameInput');
  }, []);
  
  const handleNameComplete = useCallback((inputNames) => {
    setNames(inputNames);
    setCurrentNodeId('prologue_1');
    setHistory([]);
    setScreen('story');
    storage.incrementPlayCount();
    setPlayCount(prev => prev + 1);
  }, []);
  
  const handleNext = useCallback((nextId) => {
    setHistory(prev => [...prev, currentNodeId]);
    setCurrentNodeId(nextId);
  }, [currentNodeId]);
  
  const handleChoice = useCallback((nextId) => {
    const nextNode = storyNodes[nextId];
    setHistory(prev => [...prev, currentNodeId]);
    setCurrentNodeId(nextId);
    if (nextNode?.isEnding) {
      const endings = storage.getCollectedEndings();
      const wasNew = !endings.includes(nextNode.endingType);
      setIsNewEnding(wasNew);
      if (wasNew) {
        storage.addEnding(nextNode.endingType);
        setCollectedEndings(storage.getCollectedEndings());
      }
      setTimeout(() => setScreen('ending'), 500);
    }
  }, [currentNodeId]);
  
  const handleBack = useCallback(() => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prevNodeId = newHistory.pop();
      setHistory(newHistory);
      setCurrentNodeId(prevNodeId);
    }
  }, [history]);
  
  const handleHome = useCallback(() => {
    setScreen('home');
    setCurrentNodeId('prologue_1');
    setHistory([]);
  }, []);
  
  const handleRestart = useCallback(() => {
    setCurrentNodeId('prologue_1');
    setHistory([]);
    setScreen('story');
    storage.incrementPlayCount();
    setPlayCount(prev => prev + 1);
  }, []);
  
  const handleCreateBook = useCallback(() => {
    setScreen('book');
  }, []);
  
  return (
    <div className="max-w-lg mx-auto min-h-screen relative bg-slate-900">
      {screen === 'home' && <HomeScreen onStart={handleStart} collectedEndings={collectedEndings} playCount={playCount} />}
      {screen === 'nameInput' && <NameInputScreen onComplete={handleNameComplete} />}
      {screen === 'story' && currentNode && <StoryScreen currentNode={currentNode} names={names} history={history} onChoice={handleChoice} onNext={handleNext} onBack={handleBack} onHome={handleHome} />}
      {screen === 'ending' && currentNode && <EndingScreen node={currentNode} names={names} onRestart={handleRestart} onHome={handleHome} isNewEnding={isNewEnding} onCreateBook={handleCreateBook} history={history} />}
      {screen === 'book' && currentNode && <BookCreatorScreen history={history} endingNode={currentNode} names={names} onHome={handleHome} onRestart={handleRestart} />}
    </div>
  );
}

export default App;
