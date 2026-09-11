import { useState, useEffect } from 'react'

function App() {
  const [feed, setFeed] = useState([])
  const [totalShame, setTotalShame] = useState(0)
  const [isShaking, setIsShaking] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // 1. WebSocket Connection
  useEffect(() => {
    const ws = new WebSocket('wss://outcognito-mode.onrender.com')

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setFeed((prevFeed) => [data, ...prevFeed])
      setTotalShame((prev) => prev + data.points)
    }

    return () => ws.close()
  }, [])

  // 2. Escape Key Listener for the Modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowModal(false)
      }
    }

    // Only attach the listener if the modal is currently open
    if (showModal) {
      window.addEventListener('keydown', handleKeyDown)
    }

    // Cleanup listener when modal closes
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showModal])

  const handlePanic = async () => {
    if (totalShame > 0) {
      const audio = new Audio('/gotcha.mp3')
      audio.play().catch(err => console.error("Audio blocked by browser:", err))
      
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)

      setTotalShame((prev) => prev * 2)
      setShowModal(true) 
      // The setTimeout that automatically closed the modal was removed from here
      
      const lastSite = feed.length > 0 ? feed[0] : { title: "Nothing", url: "Empty History" }

      try {
        await fetch('https://outcognito-mode.onrender.com/panic', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: lastSite.url, title: lastSite.title })
        })
      } catch (err) {
        console.error("Failed to trigger panic email", err)
      }
    }
  }

  let subtitle = "Live Global Browsing Feed"
  if (totalShame > 100) subtitle = "Warning: Productivity levels critically low."
  if (totalShame > 300) subtitle = "Are you even trying to graduate?"
  if (totalShame > 500) subtitle = "Preparing to email browsing history to your HOD..."

  return (
    <div className={`min-h-screen bg-gray-950 text-gray-100 p-8 font-mono relative ${isShaking ? 'shake-animation' : ''}`}>
      
      <style>{`
        .shake-animation {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          transform: translate3d(0, 0, 0);
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-5px, 0, 0); }
          20%, 80% { transform: translate3d(10px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-15px, 0, 0); }
          40%, 60% { transform: translate3d(15px, 0, 0); }
        }
      `}</style>

      {/* THE NEW FULL-SCREEN POPUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md">
          <div className="bg-gray-950 border-4 border-red-600 p-12 rounded-xl text-center shadow-[0_0_150px_rgba(220,38,38,0.8)] animate-pulse">
            <h1 className="text-7xl font-black text-red-600 mb-6 tracking-widest uppercase drop-shadow-lg">
              ACCESS DENIED
            </h1>
            <p className="text-4xl text-red-400 font-bold">
              mail sent to HoD, now you are cooked..!
            </p>
          </div>
          <p className="text-gray-600 mt-8 animate-bounce font-bold tracking-widest uppercase">
            [ Press ESC to accept your fate ]
          </p>
        </div>
      )}

      <header className="mb-10 flex items-center justify-between border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-red-500 mb-2">OUTCOGNITO MODE</h1>
          <p className="text-gray-400 font-bold transition-all">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 uppercase tracking-widest">Total Shame Points</p>
          <p className="text-5xl font-black text-red-500 transition-all">{totalShame}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Live Intercepts
          </h2>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 h-[600px] overflow-y-auto shadow-inner space-y-3 relative">
            {feed.length === 0 ? (
              <p className="text-gray-600 text-center mt-20">Waiting for targets to browse...</p>
            ) : (
              feed.map((item, index) => (
                <div key={index} className="bg-gray-950 border border-gray-800 p-4 rounded shadow-sm hover:border-red-900 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold truncate pr-4">{item.title}</span>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${item.points > 10 ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                      +{item.points} pts
                    </span>
                  </div>
                  
                  {item.snark && (
                    <p className="text-xs text-yellow-400 italic mb-2 border-l-2 border-yellow-400 pl-2">
                      "{item.snark}"
                    </p>
                  )}

                  <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 truncate block hover:underline">
                    {item.url}
                  </a>
                </div>
              ))
            )}
          </div>
        </main>

        <aside className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-300 border-b border-gray-800 pb-2">Shame Rules</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex justify-between">
                <span>StackOverflow / GitHub</span>
                <span className="text-green-400 font-bold">0 pts</span>
              </li>
              <li className="flex justify-between">
                <span>Standard Browsing</span>
                <span className="text-yellow-400 font-bold">10 pts</span>
              </li>
              <li className="flex justify-between">
                <span>Netflix / YouTube / Reddit</span>
                <span className="text-red-500 font-bold">50 pts</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
            <h3 className="font-bold text-lg mb-4 text-gray-300">Privacy Controls</h3>
            <p className="text-xs text-gray-500 mb-4">Wipe your session data before anyone sees it.</p>
            
            <button 
              onClick={handlePanic}
              className="w-full bg-red-900 hover:bg-red-700 text-red-100 font-bold py-3 px-4 rounded border border-red-500 transition-colors active:bg-red-950"
            >
              CLEAR HISTORY
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App